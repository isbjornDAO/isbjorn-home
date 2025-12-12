import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { workingAuthRoutes } from '../src/routes/working-auth';
import { User } from '../src/models/User.model';

// Mock dependencies
jest.mock('../src/models/User.model');
jest.mock('../src/utils/logger', () => ({
    logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
    }
}));

const app = express();
app.use(express.json());
app.use('/auth', workingAuthRoutes);

const JWT_SECRET = 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = 'dev-refresh-secret';

describe('Auth API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /auth/register', () => {
        it('should register a new user successfully', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);
            (User.create as jest.Mock).mockResolvedValue({
                dataValues: {
                    id: 'user-123',
                    email: 'test@example.com',
                    companyName: 'Test Company',
                    role: 'user'
                }
            });

            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'test@example.com',
                    password: 'password123',
                    companyName: 'Test Company'
                });

            expect(res.status).toBe(201);
            expect(res.body.user.email).toBe('test@example.com');
            expect(res.body.token).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
        });

        it('should return 400 if email already exists', async () => {
            (User.findOne as jest.Mock).mockResolvedValue({ id: 'existing-user' });

            const res = await request(app)
                .post('/auth/register')
                .send({
                    email: 'existing@example.com',
                    password: 'password123',
                    companyName: 'Test Company'
                });

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Email already registered');
        });

        it('should return 400 if required fields missing', async () => {
            const res = await request(app)
                .post('/auth/register')
                .send({ email: 'test@example.com' });

            expect(res.status).toBe(400);
            expect(res.body.message).toContain('required');
        });
    });

    describe('POST /auth/login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                dataValues: {
                    id: 'user-123',
                    email: 'test@example.com',
                    companyName: 'Test Company',
                    role: 'user'
                },
                validatePassword: jest.fn().mockResolvedValue(true)
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'correctpassword'
                });

            expect(res.status).toBe(200);
            expect(res.body.user.email).toBe('test@example.com');
            expect(res.body.token).toBeDefined();
            expect(res.body.refreshToken).toBeDefined();
        });

        it('should return 401 for invalid email', async () => {
            (User.findOne as jest.Mock).mockResolvedValue(null);

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'password'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });

        it('should return 401 for invalid password', async () => {
            const mockUser = {
                dataValues: { id: 'user-123' },
                validatePassword: jest.fn().mockResolvedValue(false)
            };
            (User.findOne as jest.Mock).mockResolvedValue(mockUser);

            const res = await request(app)
                .post('/auth/login')
                .send({
                    email: 'test@example.com',
                    password: 'wrongpassword'
                });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid email or password');
        });
    });

    describe('GET /auth/me', () => {
        it('should return current user with valid token', async () => {
            const mockUser = {
                dataValues: {
                    id: 'user-123',
                    email: 'test@example.com',
                    companyName: 'Test Company',
                    role: 'user',
                    walletAddress: null
                }
            };
            (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

            const token = jwt.sign({ id: 'user-123' }, JWT_SECRET);

            const res = await request(app)
                .get('/auth/me')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.email).toBe('test@example.com');
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/auth/me');

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Not authenticated');
        });

        it('should return 401 with invalid token', async () => {
            const res = await request(app)
                .get('/auth/me')
                .set('Authorization', 'Bearer invalid-token');

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid token');
        });
    });

    describe('POST /auth/refresh', () => {
        it('should refresh token successfully', async () => {
            const mockUser = {
                dataValues: {
                    id: 'user-123',
                    email: 'test@example.com',
                    role: 'user',
                    isActive: true
                }
            };
            (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

            const refreshToken = jwt.sign({ id: 'user-123' }, JWT_REFRESH_SECRET);

            const res = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.token).toBeDefined();
        });

        it('should return 400 without refresh token', async () => {
            const res = await request(app)
                .post('/auth/refresh')
                .send({});

            expect(res.status).toBe(400);
            expect(res.body.message).toBe('Refresh token is required');
        });

        it('should return 401 for expired refresh token', async () => {
            const expiredToken = jwt.sign(
                { id: 'user-123' },
                JWT_REFRESH_SECRET,
                { expiresIn: '-1h' }
            );

            const res = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken: expiredToken });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Invalid or expired refresh token');
        });

        it('should return 401 for deactivated user', async () => {
            const mockUser = {
                dataValues: {
                    id: 'user-123',
                    isActive: false
                }
            };
            (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

            const refreshToken = jwt.sign({ id: 'user-123' }, JWT_REFRESH_SECRET);

            const res = await request(app)
                .post('/auth/refresh')
                .send({ refreshToken });

            expect(res.status).toBe(401);
            expect(res.body.message).toBe('Account is deactivated');
        });
    });
});
