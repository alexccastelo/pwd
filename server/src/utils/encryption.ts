import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

export const encrypt = (text: string, key: Buffer): { encrypted: string; iv: string; authTag: string } => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return {
        encrypted,
        iv: iv.toString('hex'),
        authTag
    };
};

export const decrypt = (encrypted: string, iv: string, authTag: string, key: Buffer): string => {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'hex'));
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
};

// Start 0
// Helper to derive a key from a master password using a salt
export const deriveKey = (password: string, salt: string): Buffer => {
    return crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
};
// End 0
