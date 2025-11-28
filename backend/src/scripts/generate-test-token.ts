import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

const token = jwt.sign(
    {
        id: 'demo-user-123',
        email: 'demo@example.com',
        role: 'user'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
);

console.log('TEST_TOKEN=' + token);
