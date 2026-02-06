import express from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify Clerk session and get user
const authenticateClerkUser = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Access token required' });
        }

        // Verify the Clerk session token
        const sessionClaims = await clerkClient.verifyToken(token);

        if (!sessionClaims || !sessionClaims.sub) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Get user from MongoDB
        const user = await User.findOne({ clerkUserId: sessionClaims.sub });

        if (!user) {
            return res.status(404).json({ message: 'User not found in database' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }

        req.user = user;
        req.clerkUserId = sessionClaims.sub;
        next();
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(403).json({ message: 'Authentication failed' });
    }
};

// Get user profile
router.get('/profile', authenticateClerkUser, async (req, res) => {
    try {
        const user = await User.findOne({ clerkUserId: req.clerkUserId }).select('-userPin');

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
router.put('/profile', authenticateClerkUser, async (req, res) => {
    try {
        const user = await User.findOne({ clerkUserId: req.clerkUserId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update allowed fields (excluding clerkUserId, email, and userPin)
        const allowedFields = [
            'dateOfBirth', 'phoneNumber', 'address',
            'occupation', 'company', 'bio', 'preferences'
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

        const updatedUser = await User.findOne({ clerkUserId: req.clerkUserId }).select('-userPin');
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

// Set user PIN
router.post('/set-pin', authenticateClerkUser, async (req, res) => {
    try {
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ message: 'PIN is required' });
        }

        // Validate PIN format (4-6 digits)
        if (!/^\d{4,6}$/.test(pin)) {
            return res.status(400).json({ message: 'PIN must be 4-6 digits' });
        }

        const user = await User.findOne({ clerkUserId: req.clerkUserId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.userPin = pin;
        await user.save();

        res.json({ message: 'PIN set successfully' });
    } catch (error) {
        console.error('Set PIN error:', error);
        res.status(500).json({ message: 'Failed to set PIN' });
    }
});

// Verify user PIN
router.post('/verify-pin', authenticateClerkUser, async (req, res) => {
    try {
        const { pin } = req.body;

        if (!pin) {
            return res.status(400).json({ message: 'PIN is required' });
        }

        const user = await User.findOne({ clerkUserId: req.clerkUserId }).select('+userPin');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.userPin) {
            return res.status(400).json({ message: 'PIN not set for this user' });
        }

        const isValid = await user.comparePin(pin);

        if (!isValid) {
            return res.status(400).json({ message: 'Invalid PIN' });
        }

        // Update last login
        await user.updateLastLogin();

        res.json({ message: 'PIN verified successfully', verified: true });
    } catch (error) {
        console.error('Verify PIN error:', error);
        res.status(500).json({ message: 'Failed to verify PIN' });
    }
});

// Change user PIN
router.put('/change-pin', authenticateClerkUser, async (req, res) => {
    try {
        const { currentPin, newPin } = req.body;

        if (!currentPin || !newPin) {
            return res.status(400).json({
                message: 'Current PIN and new PIN are required'
            });
        }

        // Validate new PIN format
        if (!/^\d{4,6}$/.test(newPin)) {
            return res.status(400).json({ message: 'New PIN must be 4-6 digits' });
        }

        const user = await User.findOne({ clerkUserId: req.clerkUserId }).select('+userPin');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.userPin) {
            return res.status(400).json({ message: 'PIN not set for this user' });
        }

        // Verify current PIN
        const isCurrentPinValid = await user.comparePin(currentPin);
        if (!isCurrentPinValid) {
            return res.status(400).json({ message: 'Current PIN is incorrect' });
        }

        // Update PIN
        user.userPin = newPin;
        await user.save();

        res.json({ message: 'PIN changed successfully' });
    } catch (error) {
        console.error('Change PIN error:', error);
        res.status(500).json({ message: 'Failed to change PIN' });
    }
});

// Check if user has PIN set
router.get('/has-pin', authenticateClerkUser, async (req, res) => {
    try {
        const user = await User.findOne({ clerkUserId: req.clerkUserId }).select('+userPin');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ hasPin: !!user.userPin });
    } catch (error) {
        console.error('Check PIN error:', error);
        res.status(500).json({ message: 'Failed to check PIN status' });
    }
});

export { authenticateClerkUser };
export default router;
