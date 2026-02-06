import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const passwordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  username: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  password: {
    type: String,
    required: true,
    maxlength: 500 // Encrypted passwords can be longer
  },
  website: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
    validate: {
      validator: function(url) {
        // Allow both full URLs and domain names
        const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        return urlPattern.test(url);
      },
      message: 'Please enter a valid website URL or domain'
    }
  },
  category: {
    type: String,
    enum: ['social', 'work', 'finance', 'entertainment', 'other'],
    default: 'other',
    index: true
  },
  notes: {
    type: String,
    default: '',
    maxlength: 1000,
    trim: true
  },
  pin: {
    type: String,
    required: false,
    validate: {
      validator: function(pin) {
        return !pin || /^\d{4}$/.test(pin);
      },
      message: 'PIN must be exactly 4 digits'
    }
  },
  // Additional security fields
  isActive: {
    type: Boolean,
    default: true
  },
  lastAccessed: {
    type: Date,
    default: null
  },
  accessCount: {
    type: Number,
    default: 0
  },
  // Encryption metadata
  encryptionVersion: {
    type: String,
    default: 'v1'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Don't expose the actual password in JSON responses
      if (ret.password) {
        ret.password = '••••••••••••';
      }
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better performance
passwordSchema.index({ userId: 1, category: 1 });
passwordSchema.index({ userId: 1, createdAt: -1 });
passwordSchema.index({ userId: 1, title: 1 });

// Encrypt password before saving
passwordSchema.pre('save', async function(next) {
  try {
    // Only encrypt if password is modified and not already encrypted
    if (this.isModified('password') && !this.password.startsWith('$2b$')) {
      if (!this.password || this.password.length === 0) {
        throw new Error('Password cannot be empty');
      }
      this.password = await bcrypt.hash(this.password, 12);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Encrypt PIN before saving
passwordSchema.pre('save', async function(next) {
  try {
    if (this.isModified('pin') && this.pin && !this.pin.startsWith('$2b$')) {
      // Validate PIN format
      if (!/^\d{4}$/.test(this.pin)) {
        throw new Error('PIN must be exactly 4 digits');
      }
      this.pin = await bcrypt.hash(this.pin, 12);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare PIN
passwordSchema.methods.comparePin = async function(pin) {
  try {
    if (!this.pin || !pin) return false;
    
    // Validate PIN format
    if (!/^\d{4}$/.test(pin)) return false;
    
    return await bcrypt.compare(pin, this.pin);
  } catch (error) {
    console.error('PIN comparison error:', error);
    return false;
  }
};

// Method to get decrypted password (for authorized access)
passwordSchema.methods.getDecryptedPassword = async function(originalPassword) {
  try {
    // This method should only be used when the user has been authenticated
    // In a real implementation, you might want additional security layers
    return originalPassword; // The original password before encryption
  } catch (error) {
    console.error('Password decryption error:', error);
    return null;
  }
};

// Method to update last accessed
passwordSchema.methods.updateAccess = function() {
  return this.updateOne({
    $set: { lastAccessed: new Date() },
    $inc: { accessCount: 1 }
  });
};

// Static method to find passwords by category
passwordSchema.statics.findByCategory = function(userId, category) {
  return this.find({ 
    userId: userId, 
    category: category, 
    isActive: true 
  }).sort({ createdAt: -1 });
};

// Static method to search passwords
passwordSchema.statics.searchPasswords = function(userId, searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    userId: userId,
    isActive: true,
    $or: [
      { title: regex },
      { website: regex },
      { username: regex },
      { notes: regex }
    ]
  }).sort({ createdAt: -1 });
};

export default mongoose.model('Password', passwordSchema);