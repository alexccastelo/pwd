import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

import authRoutes from './routes/auth';
import passwordRoutes from './routes/passwords';

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/passwords', passwordRoutes);

app.get('/', (req, res) => {
    res.send('Password Manager API is running');
});

// Basic health check
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok', db: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', db: 'disconnected', error: String(error) });
    }
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
