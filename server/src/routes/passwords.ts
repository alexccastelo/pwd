import express from 'express';
import { PrismaClient } from '@prisma/client';
import { encrypt, decrypt, deriveKey } from '../utils/encryption';
import { verifyPassword } from '../utils/security';

const router = express.Router();
const prisma = new PrismaClient();

// Helper to validate master password and get the user
const validateMasterPassword = async (password: string) => {
    const user = await prisma.user.findUnique({ where: { username: 'admin' } });
    if (!user) throw new Error('System not initialized');

    const isValid = await verifyPassword(user.passwordHash, password);
    if (!isValid) throw new Error('Invalid credentials');

    return user;
};

// GET /passwords - List all (encrypted)
router.get('/', async (req, res) => {
    try {
        const credentials = await prisma.credential.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                serviceName: true,
                login: true,
                createdAt: true,
                updatedAt: true,
                // We do NOT return the password blob here to keep listing lightweight?
                // Or maybe we do? Let's return it so client *could* decrypt if it had the key.
                encryptedPassword: true,
                iv: true,
                authTag: true
            }
        });
        res.json(credentials);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch passwords' });
    }
});

// POST /passwords - Create new
router.post('/', async (req, res) => {
    try {
        const { serviceName, login, password, masterPassword } = req.body;

        if (!serviceName || !login || !password || !masterPassword) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify Master Password
        try {
            await validateMasterPassword(masterPassword);
        } catch (e) {
            return res.status(401).json({ error: 'Invalid Master Password' });
        }

        // Derive Key & Encrypt
        // We use a fixed salt for now or the user's generic salt?
        // Ideally, salt should be unique per user or stored. 
        // For this single-user system, we use a constant salt for the *Encryption Key Derivation* to ensure determinism if we needed to regenerate it, 
        // BUT using a random salt per session is safer, provided we don't need to persist the *key*.
        // Here we derive the key ON THE FLY from the master password.
        const salt = 'constant-salt-for-poc'; // In prod, store this in env or DB
        const key = deriveKey(masterPassword, salt);

        const { encrypted, iv, authTag } = encrypt(password, key);

        const newCredential = await prisma.credential.create({
            data: {
                serviceName,
                login,
                encryptedPassword: encrypted,
                iv,
                authTag
            }
        });

        res.status(201).json(newCredential);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to create password' });
    }
});

// POST /passwords/decrypt - Retrieve decrypted password
router.post('/decrypt', async (req, res) => {
    try {
        const { id, masterPassword } = req.body;

        if (!id || !masterPassword) {
            return res.status(400).json({ error: 'Missing id or masterPassword' });
        }

        // Verify Master Password
        try {
            await validateMasterPassword(masterPassword);
        } catch (e) {
            return res.status(401).json({ error: 'Invalid Master Password' });
        }

        const credential = await prisma.credential.findUnique({ where: { id: Number(id) } });
        if (!credential) {
            return res.status(404).json({ error: 'Credential not found' });
        }

        const salt = 'constant-salt-for-poc';
        const key = deriveKey(masterPassword, salt);

        const decrypted = decrypt(
            credential.encryptedPassword,
            credential.iv,
            credential.authTag,
            key
        );

        res.json({ password: decrypted });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to decrypt password' });
    }
});

export default router;
