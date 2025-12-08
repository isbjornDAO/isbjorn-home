import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { User, IUser } from '../models/User.mongoose';
import { logger } from '../utils/logger';

// OAuth Configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback';

const TWITTER_CONSUMER_KEY = process.env.TWITTER_CONSUMER_KEY || '';
const TWITTER_CONSUMER_SECRET = process.env.TWITTER_CONSUMER_SECRET || '';
const TWITTER_CALLBACK_URL = process.env.TWITTER_CALLBACK_URL || 'http://localhost:5000/api/auth/twitter/callback';

interface OAuthProfile {
  id: string;
  displayName?: string;
  emails?: Array<{ value: string; verified?: boolean }>;
  photos?: Array<{ value: string }>;
  username?: string;
}

/**
 * Initialize Passport with OAuth strategies
 */
export function initializePassport() {
  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  // Google OAuth Strategy
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: GOOGLE_CLIENT_ID,
          clientSecret: GOOGLE_CLIENT_SECRET,
          callbackURL: GOOGLE_CALLBACK_URL,
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'));
            }

            // Check if user exists with this email or Google ID
            let user = await User.findOne({
              $or: [
                { email: email.toLowerCase() },
                { 'oauth.google.id': profile.id }
              ]
            });

            if (user) {
              // Update Google OAuth info if not set
              if (!user.oauth?.google?.id) {
                user.oauth = {
                  ...user.oauth,
                  google: {
                    id: profile.id,
                    email: email,
                    displayName: profile.displayName,
                    photo: profile.photos?.[0]?.value,
                  }
                };
                await user.save();
              }

              logger.info(`User logged in via Google: ${email}`);
              return done(null, user);
            }

            // Create new user
            const companyName = profile.displayName || email.split('@')[0];
            user = await User.create({
              email: email.toLowerCase(),
              companyName,
              emailVerified: true, // Google emails are verified
              oauth: {
                google: {
                  id: profile.id,
                  email: email,
                  displayName: profile.displayName,
                  photo: profile.photos?.[0]?.value,
                }
              },
              preferences: {
                receiveNewsletter: true,
                receiveImpactReports: true,
                publicProfile: false,
                defaultCurrency: 'nzd',
              },
            });

            logger.info(`New user registered via Google: ${email}`);
            return done(null, user);
          } catch (error: any) {
            logger.error('Google OAuth error:', error);
            return done(error);
          }
        }
      )
    );
    logger.info('Google OAuth strategy initialized');
  } else {
    logger.warn('Google OAuth not configured - missing credentials');
  }

  // Twitter/X OAuth Strategy
  if (TWITTER_CONSUMER_KEY && TWITTER_CONSUMER_SECRET) {
    passport.use(
      new TwitterStrategy(
        {
          consumerKey: TWITTER_CONSUMER_KEY,
          consumerSecret: TWITTER_CONSUMER_SECRET,
          callbackURL: TWITTER_CALLBACK_URL,
          includeEmail: true,
        },
        async (token, tokenSecret, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            const username = profile.username;

            // Check if user exists with this Twitter ID or email
            let user = await User.findOne({
              $or: [
                { 'oauth.twitter.id': profile.id },
                ...(email ? [{ email: email.toLowerCase() }] : [])
              ]
            });

            if (user) {
              // Update Twitter OAuth info if not set
              if (!user.oauth?.twitter?.id) {
                user.oauth = {
                  ...user.oauth,
                  twitter: {
                    id: profile.id,
                    username: username,
                    displayName: profile.displayName,
                    photo: profile.photos?.[0]?.value,
                  }
                };
                await user.save();
              }

              logger.info(`User logged in via Twitter: ${username}`);
              return done(null, user);
            }

            // Create new user
            const companyName = profile.displayName || username || `X User ${profile.id.slice(0, 6)}`;
            user = await User.create({
              ...(email ? { email: email.toLowerCase(), emailVerified: true } : {}),
              companyName,
              oauth: {
                twitter: {
                  id: profile.id,
                  username: username,
                  displayName: profile.displayName,
                  photo: profile.photos?.[0]?.value,
                }
              },
              preferences: {
                receiveNewsletter: true,
                receiveImpactReports: true,
                publicProfile: false,
                defaultCurrency: 'nzd',
              },
            });

            logger.info(`New user registered via Twitter: ${username}`);
            return done(null, user);
          } catch (error: any) {
            logger.error('Twitter OAuth error:', error);
            return done(error);
          }
        }
      )
    );
    logger.info('Twitter/X OAuth strategy initialized');
  } else {
    logger.warn('Twitter/X OAuth not configured - missing credentials');
  }

  return passport;
}

export default passport;
