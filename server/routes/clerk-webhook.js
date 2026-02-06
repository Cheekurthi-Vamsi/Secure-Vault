import express from 'express';
import { Webhook } from 'svix';
import User from '../models/User.js';

const router = express.Router();

// Clerk webhook handler
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    try {
        const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

        if (!WEBHOOK_SECRET) {
            console.error('CLERK_WEBHOOK_SECRET is not set');
            return res.status(500).json({ message: 'Webhook secret not configured' });
        }

        // Get the headers
        const svix_id = req.headers['svix-id'];
        const svix_timestamp = req.headers['svix-timestamp'];
        const svix_signature = req.headers['svix-signature'];

        // If there are no headers, error out
        if (!svix_id || !svix_timestamp || !svix_signature) {
            return res.status(400).json({ message: 'Missing svix headers' });
        }

        // Get the body
        const payload = req.body;
        const body = payload.toString();

        // Create a new Svix instance with your webhook secret
        const wh = new Webhook(WEBHOOK_SECRET);

        let evt;

        // Verify the webhook
        try {
            evt = wh.verify(body, {
                'svix-id': svix_id,
                'svix-timestamp': svix_timestamp,
                'svix-signature': svix_signature,
            });
        } catch (err) {
            console.error('Error verifying webhook:', err);
            return res.status(400).json({ message: 'Webhook verification failed' });
        }

        // Handle the webhook
        const eventType = evt.type;
        console.log(`Webhook received: ${eventType}`);

        switch (eventType) {
            case 'user.created':
                await handleUserCreated(evt.data);
                break;
            case 'user.updated':
                await handleUserUpdated(evt.data);
                break;
            case 'user.deleted':
                await handleUserDeleted(evt.data);
                break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
        }

        res.status(200).json({ message: 'Webhook processed successfully' });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Webhook processing failed' });
    }
});

// Handle user created event
async function handleUserCreated(data) {
    try {
        const { id, email_addresses, first_name, last_name, image_url } = data;

        // Check if user already exists
        const existingUser = await User.findOne({ clerkUserId: id });
        if (existingUser) {
            console.log(`User ${id} already exists`);
            return;
        }

        // Get primary email
        const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
        const email = primaryEmail?.email_address || email_addresses[0]?.email_address;

        if (!email) {
            console.error('No email found for user');
            return;
        }

        // Create new user in MongoDB
        const user = new User({
            clerkUserId: id,
            email: email.toLowerCase(),
            firstName: first_name || '',
            lastName: last_name || '',
            profilePhoto: image_url || '',
            isActive: true,
        });

        await user.save();
        console.log(`User created in MongoDB: ${email}`);
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

// Handle user updated event
async function handleUserUpdated(data) {
    try {
        const { id, email_addresses, first_name, last_name, image_url } = data;

        // Get primary email
        const primaryEmail = email_addresses.find(email => email.id === data.primary_email_address_id);
        const email = primaryEmail?.email_address || email_addresses[0]?.email_address;

        // Update user in MongoDB
        const user = await User.findOne({ clerkUserId: id });
        if (!user) {
            console.log(`User ${id} not found, creating new user`);
            await handleUserCreated(data);
            return;
        }

        user.email = email?.toLowerCase() || user.email;
        user.firstName = first_name || user.firstName;
        user.lastName = last_name || user.lastName;
        user.profilePhoto = image_url || user.profilePhoto;

        await user.save();
        console.log(`User updated in MongoDB: ${email}`);
    } catch (error) {
        console.error('Error updating user:', error);
    }
}

// Handle user deleted event
async function handleUserDeleted(data) {
    try {
        const { id } = data;

        // Soft delete - mark as inactive instead of deleting
        const user = await User.findOne({ clerkUserId: id });
        if (!user) {
            console.log(`User ${id} not found`);
            return;
        }

        user.isActive = false;
        await user.save();
        console.log(`User deactivated in MongoDB: ${id}`);
    } catch (error) {
        console.error('Error deleting user:', error);
    }
}

export default router;
