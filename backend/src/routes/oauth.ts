import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import { IUser } from '../models/User.mongoose';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

/**
 * Generate JWT tokens for authenticated user
 */
function generateTokens(user: IUser) {
  const payload = {
    id: user._id,
    email: user.email,
    walletAddress: user.walletAddress,
    role: user.role,
  };

  const tokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
  const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: tokenExpiry,
  } as jwt.SignOptions);

  const refreshToken = jwt.sign(
    { id: user._id },
    JWT_REFRESH_SECRET,
    { expiresIn: refreshTokenExpiry } as jwt.SignOptions
  );

  return { token, refreshToken };
}

/**
 * Google OAuth Routes
 */

// Initiate Google OAuth
router.get('/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false
  })
);

// Google OAuth callback
router.get('/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/register?error=google_auth_failed`
  }),
  (req, res) => {
    try {
      const user = req.user as IUser;
      const { token, refreshToken } = generateTokens(user);

      // Redirect to frontend with tokens in URL hash
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}&provider=google`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/register?error=token_generation_failed`);
    }
  }
);

/**
 * Twitter/X OAuth Routes
 */

// Initiate Twitter OAuth
router.get('/twitter',
  passport.authenticate('twitter', {
    session: false
  })
);

// Twitter OAuth callback
router.get('/twitter/callback',
  passport.authenticate('twitter', {
    session: false,
    failureRedirect: `${FRONTEND_URL}/register?error=twitter_auth_failed`
  }),
  (req, res) => {
    try {
      const user = req.user as IUser;
      const { token, refreshToken } = generateTokens(user);

      // Redirect to frontend with tokens
      res.redirect(`${FRONTEND_URL}/auth/callback?token=${token}&refreshToken=${refreshToken}&provider=twitter`);
    } catch (error) {
      res.redirect(`${FRONTEND_URL}/register?error=token_generation_failed`);
    }
  }
);

/**
 * Proton Mail - Note: Proton doesn't have official OAuth
 * This is a placeholder for potential future integration
 * For now, users can use email/password registration with Proton email
 */
router.get('/proton', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Proton Mail OAuth is not yet available. Please use email/password registration with your Proton email address.',
    recommendation: 'Use the email signup form with your Proton Mail address'
  });
});

export default router;
