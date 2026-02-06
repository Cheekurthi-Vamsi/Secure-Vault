import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_in_production';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password -securityAnswer');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Token verification failed' });
  }
};

// Sign up
router.post('/signup', async (req, res) => {
  try {
    const { 
      email, 
      password, 
      firstName, 
      lastName, 
      dateOfBirth, 
      phoneNumber, 
      address, 
      occupation, 
      company, 
      bio, 
      securityQuestion, 
      securityAnswer 
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !securityQuestion || !securityAnswer) {
      return res.status(400).json({ 
        message: 'Missing required fields: email, password, firstName, lastName, securityQuestion, securityAnswer' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      phoneNumber: phoneNumber?.trim(),
      address: address || {},
      occupation: occupation?.trim(),
      company: company?.trim(),
      bio: bio?.trim(),
      securityQuestion: securityQuestion.trim(),
      securityAnswer: securityAnswer.trim()
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (password and securityAnswer are excluded by toJSON transform)
    res.status(201).json({ 
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// Sign in - Step 1: Verify credentials
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account is temporarily locked due to too many failed login attempts. Please try again later.' 
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Reset login attempts on successful password verification
    await user.resetLoginAttempts();

    res.json({ 
      message: 'Credentials verified. Please answer security question.',
      userId: user._id,
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

// Sign in - Step 2: Verify security answer
router.post('/verify-security', async (req, res) => {
  try {
    const { userId, securityAnswer } = req.body;

    if (!userId || !securityAnswer) {
      return res.status(400).json({ message: 'User ID and security answer are required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAnswerValid = await user.compareSecurityAnswer(securityAnswer);
    if (!isAnswerValid) {
      return res.status(400).json({ message: 'Incorrect security answer' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePhoto: user.profilePhoto
      }
    });
  } catch (error) {
    console.error('Security verification error:', error);
    res.status(500).json({ message: 'Security verification failed' });
  }
});

// Forgot Password - Step 1: Verify user details
router.post('/forgot-password', async (req, res) => {
  try {
    const { email, firstName, lastName, dateOfBirth } = req.body;

    if (!email || !firstName || !lastName || !dateOfBirth) {
      return res.status(400).json({ 
        message: 'Email, first name, last name, and date of birth are required' 
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify user details
    const userDateOfBirth = user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : null;
    
    if (user.firstName !== firstName.trim() || 
        user.lastName !== lastName.trim() || 
        userDateOfBirth !== dateOfBirth) {
      return res.status(400).json({ message: 'User details do not match our records' });
    }

    res.json({
      message: 'User details verified. Please answer your security question.',
      userId: user._id,
      securityQuestion: user.securityQuestion
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password recovery failed' });
  }
});

// Forgot Password - Step 2: Verify security answer and reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { userId, securityAnswer, newPassword } = req.body;

    if (!userId || !securityAnswer || !newPassword) {
      return res.status(400).json({ 
        message: 'User ID, security answer, and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isAnswerValid = await user.compareSecurityAnswer(securityAnswer);
    if (!isAnswerValid) {
      return res.status(400).json({ message: 'Incorrect security answer' });
    }

    // Update password
    user.password = newPassword;
    user.loginAttempts = 0; // Reset login attempts
    user.lockUntil = undefined; // Remove any account lock
    await user.save();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
});

// Get user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -securityAnswer');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update allowed fields (excluding password and security answer)
    const allowedFields = [
      'firstName', 'lastName', 'dateOfBirth', 'phoneNumber', 'address',
      'occupation', 'company', 'bio', 'profilePhoto', 'preferences'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'dateOfBirth' && req.body[field]) {
          user[field] = new Date(req.body[field]);
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();

    const updatedUser = await User.findById(user._id).select('-password -securityAnswer');
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

// Change password (requires current password)
router.put('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Current password and new password are required' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Failed to change password' });
  }
});

export default router;