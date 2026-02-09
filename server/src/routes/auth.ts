import express from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, verifyPassword } from '../utils/security';

const router = express.Router();
const prisma = new PrismaClient();

// Initialize the system with a Master Password
router.post('/init', async (req, res) => {
    try {
        const userCount = await prisma.user.count();
        if (userCount > 0) {
            return res.status(400).json({ error: 'System already initialized' });
        }

        const { password } = req.body;
        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        const hash = await hashPassword(password);
        await prisma.user.create({
            data: {
                username: 'admin',
                passwordHash: hash
            }
        });

        res.status(201).json({ message: 'System initialized successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to initialize system' });
    }
});

// Login (Verify Master Password)
// In a real app, this would issue a JWT. 
// For this strict system, we verify the password matches. 
// The client will need to hold onto the password to send it for decryption operations.
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        const user = await prisma.user.findUnique({ where: { username: 'admin' } });

        if (!user) {
            return res.status(404).json({ error: 'System not initialized' });
        }

        const isValid = await verifyPassword(user.passwordHash, password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful' });
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
});

export default router;
