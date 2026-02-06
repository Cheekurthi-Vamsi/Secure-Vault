import express from 'express';
import Password from '../models/Password.js';
import { authenticateClerkUser } from './user.js';

const router = express.Router();

// Get all passwords for user
router.get('/', authenticateClerkUser, async (req, res) => {
  try {
    const { category, search, limit = 50, page = 1 } = req.query;

    let query = { userId: req.userId, isActive: true };

    // Add category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    // Add search filter
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { title: searchRegex },
        { website: searchRegex },
        { username: searchRegex },
        { notes: searchRegex }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const passwords = await Password.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip)
      .lean(); // Use lean() for better performance

    // Get total count for pagination
    const total = await Password.countDocuments(query);

    res.json({
      passwords,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get passwords error:', error);
    res.status(500).json({ message: 'Failed to fetch passwords' });
  }
});

// Get single password by ID
router.get('/:id', authenticateClerkUser, async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true
    });

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    // Update access tracking
    await password.updateAccess();

    res.json(password);
  } catch (error) {
    console.error('Get password error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid password ID' });
    }

    res.status(500).json({ message: 'Failed to fetch password' });
  }
});

// Create new password
router.post('/', authenticateClerkUser, async (req, res) => {
  try {
    const { title, username, password, website, category, notes, pin } = req.body;

    // Validate required fields
    if (!title || !username || !password || !website) {
      return res.status(400).json({
        message: 'Missing required fields: title, username, password, website'
      });
    }

    // Validate category
    const validCategories = ['social', 'work', 'finance', 'entertainment', 'other'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({
        message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
      });
    }

    // Create new password entry
    const newPassword = new Password({
      userId: req.userId,
      title: title.trim(),
      username: username.trim(),
      password: password, // Will be encrypted by pre-save middleware
      website: website.trim(),
      category: category || 'other',
      notes: notes?.trim() || '',
      pin: pin || undefined // Will be encrypted by pre-save middleware if provided
    });

    await newPassword.save();

    res.status(201).json({
      message: 'Password created successfully',
      password: newPassword
    });
  } catch (error) {
    console.error('Create password error:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Failed to create password' });
  }
});

// Verify PIN for password access
router.post('/:id/verify-pin', authenticateClerkUser, async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ message: 'PIN is required' });
    }

    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true
    });

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    if (!password.pin) {
      return res.status(400).json({ message: 'No PIN set for this password' });
    }

    const isValidPin = await password.comparePin(pin);
    if (!isValidPin) {
      return res.status(400).json({ message: 'Incorrect PIN' });
    }

    // Update access tracking
    await password.updateAccess();

    res.json({
      message: 'PIN verified successfully',
      verified: true
    });
  } catch (error) {
    console.error('PIN verification error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid password ID' });
    }

    res.status(500).json({ message: 'PIN verification failed' });
  }
});

// Update password
router.put('/:id', authenticateClerkUser, async (req, res) => {
  try {
    const { title, username, password, website, category, notes, pin } = req.body;

    const existingPassword = await Password.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true
    });

    if (!existingPassword) {
      return res.status(404).json({ message: 'Password not found' });
    }

    // Validate category if provided
    if (category) {
      const validCategories = ['social', 'work', 'finance', 'entertainment', 'other'];
      if (!validCategories.includes(category)) {
        return res.status(400).json({
          message: 'Invalid category. Must be one of: ' + validCategories.join(', ')
        });
      }
    }

    // Update fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (username !== undefined) updateFields.username = username.trim();
    if (password !== undefined) updateFields.password = password; // Will be encrypted by pre-save middleware
    if (website !== undefined) updateFields.website = website.trim();
    if (category !== undefined) updateFields.category = category;
    if (notes !== undefined) updateFields.notes = notes.trim();
    if (pin !== undefined) updateFields.pin = pin || null; // Will be encrypted by pre-save middleware

    // Use findOneAndUpdate to trigger pre-save middleware
    Object.assign(existingPassword, updateFields);
    await existingPassword.save();

    res.json({
      message: 'Password updated successfully',
      password: existingPassword
    });
  } catch (error) {
    console.error('Update password error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid password ID' });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }

    res.status(500).json({ message: 'Failed to update password' });
  }
});

// Delete password (soft delete)
router.delete('/:id', authenticateClerkUser, async (req, res) => {
  try {
    const password = await Password.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true
    });

    if (!password) {
      return res.status(404).json({ message: 'Password not found' });
    }

    // Soft delete by setting isActive to false
    password.isActive = false;
    await password.save();

    res.json({
      message: 'Password deleted successfully',
      deleted: true
    });
  } catch (error) {
    console.error('Delete password error:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid password ID' });
    }

    res.status(500).json({ message: 'Failed to delete password' });
  }
});

// Get password statistics
router.get('/stats/overview', authenticateClerkUser, async (req, res) => {
  try {
    const stats = await Password.aggregate([
      { $match: { userId: req.userId, isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          lastUpdated: { $max: '$updatedAt' }
        }
      }
    ]);

    const total = await Password.countDocuments({
      userId: req.userId,
      isActive: true
    });

    res.json({
      total,
      byCategory: stats,
      summary: {
        social: stats.find(s => s._id === 'social')?.count || 0,
        work: stats.find(s => s._id === 'work')?.count || 0,
        finance: stats.find(s => s._id === 'finance')?.count || 0,
        entertainment: stats.find(s => s._id === 'entertainment')?.count || 0,
        other: stats.find(s => s._id === 'other')?.count || 0
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Bulk operations
router.post('/bulk/delete', authenticateClerkUser, async (req, res) => {
  try {
    const { passwordIds } = req.body;

    if (!passwordIds || !Array.isArray(passwordIds) || passwordIds.length === 0) {
      return res.status(400).json({ message: 'Password IDs array is required' });
    }

    const result = await Password.updateMany(
      {
        _id: { $in: passwordIds },
        userId: req.userId,
        isActive: true
      },
      { isActive: false }
    );

    res.json({
      message: `${result.modifiedCount} passwords deleted successfully`,
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    res.status(500).json({ message: 'Failed to delete passwords' });
  }
});

export default router;
