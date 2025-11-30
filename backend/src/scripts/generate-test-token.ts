import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

const token = jwt.sign(
    {
        id: 'd139f010-4408-41ef-b1a1-60c21587dad7',
        email: 'demo@example.com',
        role: 'user'
    },
    JWT_SECRET,
    { expiresIn: '1h' }
);

console.log('TEST_TOKEN=' + token);
