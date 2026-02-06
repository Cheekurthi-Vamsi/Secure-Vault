import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Clerk User ID (primary identifier)
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Basic Info (synced from Clerk)
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: function(email) {
        return /^\w+([-.]?\w+)*@\w+([-.]?\w+)*(\.\w{2,3})+$/.test(email);
      },
      message: 'Please enter a valid email address'
    }
  },
  
  // Personal Information (synced from Clerk)
  firstName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: false,
    trim: true,
    maxlength: 50
  },
  profilePhoto: {
    type: String,
    default: '',
    validate: {
      validator: function(photo) {
        return !photo || photo.startsWith('data:image/') || photo.startsWith('http');
      },
      message: 'Profile photo must be a valid image URL or base64 string'
    }
  },
  
  // Additional User Information (stored in MongoDB)
  dateOfBirth: {
    type: Date,
    required: false,
    validate: {
      validator: function(date) {
        return !date || date < new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  phoneNumber: {
    type: String,
    required: false,
    trim: true,
    validate: {
      validator: function(phone) {
        return !phone || /^[\+]?[1-9][\d]{0,15}$/.test(phone);
      },
      message: 'Please enter a valid phone number'
    }
  },
  address: {
    street: { 
      type: String, 
      trim: true,
      maxlength: 100
    },
    city: { 
      type: String, 
      trim: true,
      maxlength: 50
    },
    state: { 
      type: String, 
      trim: true,
      maxlength: 50
    },
    zipCode: { 
      type: String, 
      trim: true,
      maxlength: 20
    },
    country: { 
      type: String, 
      trim: true,
      maxlength: 50
    }
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: 100
  },
  company: {
    type: String,
    trim: true,
    maxlength: 100
  },
  bio: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // User PIN for additional security (stored in MongoDB, hashed)
  userPin: {
    type: String,
    required: false,
    select: false // Don't include by default in queries
  },
  
  // Preferences
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'auto'
    },
    notifications: {
      email: { type: Boolean, default: true },
      security: { type: Boolean, default: true }
    },
    language: {
      type: String,
      default: 'en',
      maxlength: 5
    }
  },
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.userPin;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
userSchema.index({ clerkUserId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

// Pre-save middleware for PIN hashing
userSchema.pre('save', async function(next) {
  try {
    // Only hash PIN if it's modified
    if (this.isModified('userPin') && this.userPin) {
      // Validate PIN (should be 4-6 digits)
      if (!/^\d{4,6}$/.test(this.userPin)) {
        throw new Error('PIN must be 4-6 digits');
      }
      this.userPin = await bcrypt.hash(this.userPin, 12);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare PIN
userSchema.methods.comparePin = async function(pin) {
  try {
    if (!pin || !this.userPin) return false;
    return await bcrypt.compare(pin, this.userPin);
  } catch (error) {
    return false;
  }
};

// Method to update last login
userSchema.methods.updateLastLogin = function() {
  return this.updateOne({
    $set: { lastLogin: new Date() }
  });
};

export default mongoose.model('User', userSchema);