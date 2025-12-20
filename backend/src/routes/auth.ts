/**
 * Authentication Routes
 * Handles user registration, login, email verification, and password reset
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, getUserByEmail, getUserById, createUser, createOrganization, linkUserToOrganization, createEmailVerificationToken, getEmailVerificationToken, markEmailVerificationTokenAsUsed, verifyUserEmail, getUserOrganization, createPasswordResetToken, getPasswordResetToken, markPasswordResetTokenAsUsed, updateUserPassword } from '../database';
import { convertQuery, pool } from '../database/postgresql';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/email';

// Import PostgreSQL functions if using PostgreSQL
const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input - check for existence and non-empty strings
    const emailTrimmed = email?.trim();
    const passwordTrimmed = password?.trim();
    const nameTrimmed = name?.trim();

    if (!emailTrimmed || !passwordTrimmed || !nameTrimmed) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and name are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrimmed)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format',
      });
    }

    // Validate password length
    if (passwordTrimmed.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    // Check if user already exists
    let existingUser;
    if (dbType === 'postgresql') {
      if (!getUserByEmail) {
        console.error('getUserByEmail is undefined! dbType:', dbType);
        return res.status(500).json({
          success: false,
          error: 'Database configuration error',
        });
      }
      existingUser = await getUserByEmail(emailTrimmed);
    } else {
      existingUser = db.prepare('SELECT id, email_verified FROM users WHERE email = ?').get(emailTrimmed) as any;
    }
    if (existingUser) {
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
      const message = isDevelopment 
        ? 'Email already registered. Note: Local and production databases are separate. If you created this account on the deployed website, you need to create a new account locally or use different credentials.'
        : 'Email already registered';
      
      return res.status(400).json({
        success: false,
        error: message,
        hint: isDevelopment ? 'Local database is separate from production. Create a new account or use different credentials.' : undefined,
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(passwordTrimmed, 10);

    // Create user
    const userId = uuidv4();
    const now = new Date().toISOString();

    if (dbType === 'postgresql' && createUser) {
      await createUser({
        id: userId,
        email: emailTrimmed,
        name: nameTrimmed,
        passwordHash,
        emailVerified: false
      });
    } else {
      db.prepare(`
        INSERT INTO users (id, email, name, password_hash, email_verified, created_at, updated_at)
        VALUES (?, ?, ?, ?, 0, ?, ?)
      `).run(userId, emailTrimmed, nameTrimmed, passwordHash, now, now);
    }

    // Create default organization for user
    const orgId = uuidv4();
    if (dbType === 'postgresql' && createOrganization) {
      await createOrganization({
        id: orgId,
        name: `${nameTrimmed}'s Organization`,
        plan: 'free'
      });
    } else {
      db.prepare(`
        INSERT INTO organizations (id, name, plan, created_at, updated_at)
        VALUES (?, ?, 'free', ?, ?)
      `).run(orgId, `${nameTrimmed}'s Organization`, now, now);
    }

    // Link user to organization
    if (dbType === 'postgresql' && linkUserToOrganization) {
      await linkUserToOrganization({
        userId,
        organizationId: orgId,
        role: 'admin'
      });
    } else {
      db.prepare(`
        INSERT INTO user_organizations (user_id, organization_id, role, created_at)
        VALUES (?, ?, 'admin', ?)
      `).run(userId, orgId, now);
    }

    // Generate verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    if (dbType === 'postgresql' && createEmailVerificationToken) {
      await createEmailVerificationToken({
        id: uuidv4(),
        userId,
        token,
        expiresAt
      });
    } else {
      db.prepare(`
        INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), userId, token, expiresAt, now);
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(emailTrimmed, nameTrimmed, token);
    
    // In development mode without email service, auto-verify the email
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
    if (!emailSent && isDevelopment) {
      console.warn('⚠️  Email service not configured. Auto-verifying email for development...');
      console.log('📧 Verification URL (for testing):', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
      
      // Auto-verify email in development
      try {
        if (dbType === 'postgresql' && markEmailVerificationTokenAsUsed && verifyUserEmail && getEmailVerificationToken) {
          const verification = await getEmailVerificationToken(token);
          if (verification) {
            await markEmailVerificationTokenAsUsed(verification.id);
            await verifyUserEmail(userId);
          }
        } else {
          db.prepare('UPDATE email_verification_tokens SET used = 1 WHERE token = ?').run(token);
          const now = new Date().toISOString();
          db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, userId);
        }
        console.log('✅ Email auto-verified for development');
      } catch (error) {
        console.error('Failed to auto-verify email:', error);
      }
    } else if (!emailSent) {
      console.warn('⚠️  Verification email not sent (email service may not be configured)');
      console.log('📧 Verification URL (for testing):', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
    }

    // Check if email was auto-verified in development
    let emailVerified = false;
    if (isDevelopment && !emailSent) {
      // Re-check user to see if they were auto-verified
      let userCheck;
      if (dbType === 'postgresql' && getUserById) {
        userCheck = await getUserById(userId);
      } else {
        userCheck = db.prepare('SELECT email_verified FROM users WHERE id = ?').get(userId) as any;
      }
      emailVerified = userCheck?.email_verified === 1 || userCheck?.email_verified === true || userCheck?.email_verified === '1';
    }

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId, email: emailTrimmed, emailVerified },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: userId,
          email: emailTrimmed,
          name: nameTrimmed,
          emailVerified,
          createdAt: now,
        },
        organization: {
          id: orgId,
          name: `${nameTrimmed}'s Organization`,
          plan: 'free',
          role: 'admin',
        },
        token: jwtToken,
        requiresVerification: !emailVerified,
        ...(isDevelopment && !emailSent ? { 
          verificationUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`,
          message: 'Email auto-verified for development. Use the verification URL if you need to verify manually.'
        } : {}),
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to register user',
    });
  }
});

/**
 * Verify email address
 */
router.post('/verify-email', async (req, res) => {
  try {
    const { token, email } = req.body;
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
    
    console.log('[Verify Email] Request received');
    console.log('[Verify Email] Token length:', token?.length);
    console.log('[Verify Email] Token preview:', token?.substring(0, 20) + '...');
    console.log('[Verify Email] Email:', email);
    console.log('[Verify Email] Development mode:', isDevelopment);
    
    // In development mode, just verify any user and return success
    if (isDevelopment) {
      console.log('[Verify Email] Development mode: Auto-verifying without token check...');
      
      // Find user by email if provided, otherwise find most recent user
      let user;
      if (email) {
        if (dbType === 'postgresql' && getUserByEmail) {
          user = await getUserByEmail(email);
        } else {
          user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
        }
      }
      
      // If no user found by email, get most recent user
      if (!user) {
        if (dbType === 'postgresql') {
          const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 1');
          user = result.rows[0];
        } else {
          user = db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 1').get() as any;
        }
      }
      
      if (user) {
        const userId = user.id;
        const now = new Date().toISOString();
        
        // Verify the user
        if (dbType === 'postgresql' && verifyUserEmail) {
          await verifyUserEmail(userId);
        } else {
          db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, userId);
        }
        
        // Get organization
        let userOrg;
        if (dbType === 'postgresql' && getUserOrganization) {
          userOrg = await getUserOrganization(userId);
        } else {
          userOrg = db.prepare(`
            SELECT o.*, uo.role
            FROM organizations o
            JOIN user_organizations uo ON o.id = uo.organization_id
            WHERE uo.user_id = ?
          `).get(userId) as any;
        }
        
        const jwtToken = jwt.sign(
          { userId: user.id, email: user.email, emailVerified: true },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        console.log('[Verify Email] Development mode: Auto-verified user', user.email);
        return res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: true,
              createdAt: user.created_at,
            },
            organization: userOrg ? {
              id: userOrg.id,
              name: userOrg.name,
              plan: userOrg.plan,
              role: userOrg.role,
            } : null,
            token: jwtToken,
          },
          message: 'Email verified (development mode - no token required)',
        });
      }
    }

    // In development mode, allow verification by email if no token
    if (isDevelopment && !token && email) {
      console.log('[Verify Email] Development mode: Verifying by email...');
      let user;
      if (dbType === 'postgresql' && getUserByEmail) {
        user = await getUserByEmail(email);
      } else {
        user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
      }
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }
      
      const userId = user.id;
      const emailVerified = user.email_verified === 1 || user.email_verified === true || user.email_verified === '1';
      
      if (!emailVerified) {
        console.log('[Verify Email] Verifying user by email in development mode...');
        const now = new Date().toISOString();
        if (dbType === 'postgresql' && verifyUserEmail) {
          await verifyUserEmail(userId);
        } else {
          db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, userId);
        }
      }
      
      let userOrg;
      if (dbType === 'postgresql' && getUserOrganization) {
        userOrg = await getUserOrganization(userId);
      } else {
        userOrg = db.prepare(`
          SELECT o.*, uo.role
          FROM organizations o
          JOIN user_organizations uo ON o.id = uo.organization_id
          WHERE uo.user_id = ?
        `).get(userId) as any;
      }
      
      const jwtToken = jwt.sign(
        { userId: user.id, email: user.email, emailVerified: true },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: true,
            createdAt: user.created_at,
          },
          organization: userOrg ? {
            id: userOrg.id,
            name: userOrg.name,
            plan: userOrg.plan,
            role: userOrg.role,
          } : null,
          token: jwtToken,
        },
        message: 'Email verified (development mode - verified by email)',
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }
    
    // Trim token in case of whitespace
    const trimmedToken = token.trim();

    // Find verification token (check both used and unused tokens)
    let verification;
    if (dbType === 'postgresql' && getEmailVerificationToken) {
      verification = await getEmailVerificationToken(trimmedToken);
    } else {
      // First try to find unused token
      console.log('[Verify Email] Searching for unused token...');
      verification = db.prepare(`
        SELECT evt.*, u.id as user_id, u.email, u.email_verified
        FROM email_verification_tokens evt
        JOIN users u ON evt.user_id = u.id
        WHERE evt.token = ? AND evt.used = 0
      `).get(trimmedToken) as any;
      
      // If not found, check if token exists but is already used (for already-verified users)
      if (!verification) {
        console.log('[Verify Email] Token not found unused, checking if used...');
        verification = db.prepare(`
          SELECT evt.*, u.id as user_id, u.email, u.email_verified
          FROM email_verification_tokens evt
          JOIN users u ON evt.user_id = u.id
          WHERE evt.token = ?
        `).get(trimmedToken) as any;
      }
      
      // Debug: Check all tokens for this user if still not found
      if (!verification) {
        console.log('[Verify Email] Token not found at all. Checking all tokens in database...');
        const allTokens = db.prepare('SELECT token, used, user_id FROM email_verification_tokens LIMIT 5').all() as any[];
        console.log('[Verify Email] Sample tokens in DB:', allTokens.map(t => ({
          tokenPreview: t.token?.substring(0, 20) + '...',
          used: t.used,
          userId: t.user_id
        })));
      }
    }

    console.log('[Verify Email] Lookup result:', verification ? `Found (used: ${verification.used}, user_id: ${verification.user_id})` : 'Not found');
    
    if (!verification) {
      console.log('[Verify Email] Token not found in database');
      const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
      
      // In development, find the most recent unverified user and verify them
      if (isDevelopment) {
        console.log('[Verify Email] Development mode: Finding most recent unverified user...');
        
        // Find the most recent user who isn't verified
        let user;
        if (dbType === 'postgresql') {
          // For PostgreSQL, use the pool directly
          const result = await pool.query(`
            SELECT * FROM users WHERE email_verified = 0 ORDER BY created_at DESC LIMIT 1
          `);
          user = result.rows[0];
        } else {
          user = db.prepare(`
            SELECT * FROM users 
            WHERE email_verified = 0 
            ORDER BY created_at DESC 
            LIMIT 1
          `).get() as any;
        }
        
        if (user) {
          console.log('[Verify Email] Found unverified user, auto-verifying in development mode...', user.email);
          const userId = user.id;
          const now = new Date().toISOString();
          
          if (dbType === 'postgresql' && verifyUserEmail) {
            await verifyUserEmail(userId);
          } else {
            db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, userId);
          }
          
          let userOrg;
          if (dbType === 'postgresql' && getUserOrganization) {
            userOrg = await getUserOrganization(userId);
          } else {
            userOrg = db.prepare(`
              SELECT o.*, uo.role
              FROM organizations o
              JOIN user_organizations uo ON o.id = uo.organization_id
              WHERE uo.user_id = ?
            `).get(userId) as any;
          }
          
          const jwtToken = jwt.sign(
            { userId: user.id, email: user.email, emailVerified: true },
            JWT_SECRET,
            { expiresIn: JWT_EXPIRES_IN }
          );

          return res.json({
            success: true,
            data: {
              user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: true,
                createdAt: user.created_at,
              },
              organization: userOrg ? {
                id: userOrg.id,
                name: userOrg.name,
                plan: userOrg.plan,
                role: userOrg.role,
              } : null,
              token: jwtToken,
            },
            message: 'Email verified (development mode - token not required)',
          });
        } else {
          console.log('[Verify Email] No unverified users found, checking if any user exists...');
          // If all users are verified, just return success for the most recent user
          let recentUser;
          if (dbType === 'postgresql') {
            const result = await pool.query(`
              SELECT * FROM users ORDER BY created_at DESC LIMIT 1
            `);
            recentUser = result.rows[0];
          } else {
            recentUser = db.prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 1').get() as any;
          }
          
          if (recentUser) {
            const userId = recentUser.id;
            let userOrg;
            if (dbType === 'postgresql' && getUserOrganization) {
              userOrg = await getUserOrganization(userId);
            } else {
              userOrg = db.prepare(`
                SELECT o.*, uo.role
                FROM organizations o
                JOIN user_organizations uo ON o.id = uo.organization_id
                WHERE uo.user_id = ?
              `).get(userId) as any;
            }
            
            const jwtToken = jwt.sign(
              { userId: recentUser.id, email: recentUser.email, emailVerified: true },
              JWT_SECRET,
              { expiresIn: JWT_EXPIRES_IN }
            );

            return res.json({
              success: true,
              data: {
                user: {
                  id: recentUser.id,
                  email: recentUser.email,
                  name: recentUser.name,
                  emailVerified: true,
                  createdAt: recentUser.created_at,
                },
                organization: userOrg ? {
                  id: userOrg.id,
                  name: userOrg.name,
                  plan: userOrg.plan,
                  role: userOrg.role,
                } : null,
                token: jwtToken,
              },
              message: 'Email already verified (development mode)',
            });
          }
        }
      }
      
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token. The link may have expired or is incorrect. Please request a new verification email.',
        ...(isDevelopment ? { hint: 'In development mode, you can also just log in directly - your account may already be auto-verified.' } : {}),
      });
    }
    
    // If token is already used, check if user is already verified
    if (verification.used === 1 || verification.used === true) {
      const userId = verification.user_id;
      let user;
      let userOrg;
      if (dbType === 'postgresql' && getUserById && getUserOrganization) {
        user = await getUserById(userId);
        userOrg = await getUserOrganization(userId);
      } else {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
        userOrg = db.prepare(`
          SELECT o.*, uo.role
          FROM organizations o
          JOIN user_organizations uo ON o.id = uo.organization_id
          WHERE uo.user_id = ?
        `).get(userId) as any;
      }
      
      const emailVerified = user?.email_verified === 1 || user?.email_verified === true || user?.email_verified === '1';
      if (emailVerified) {
        console.log('Token already used but user is verified, returning success');
        const jwtToken = jwt.sign(
          { userId: user.id, email: user.email, emailVerified: true },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRES_IN }
        );

        return res.json({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              emailVerified: true,
              createdAt: user.created_at,
            },
            organization: userOrg ? {
              id: userOrg.id,
              name: userOrg.name,
              plan: userOrg.plan,
              role: userOrg.role,
            } : null,
            token: jwtToken,
          },
          message: 'Email already verified',
        });
      }
    }

    // Check if token is expired
    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Verification token has expired',
      });
    }

    // Check if already verified
    // Handle both INTEGER (0/1) and boolean values from database
    const alreadyVerified = verification.email_verified === 1 || verification.email_verified === true || verification.email_verified === '1';
    if (alreadyVerified) {
      // If already verified, return success with user data instead of error
      const userId = verification.user_id;
      let user;
      let userOrg;
      if (dbType === 'postgresql' && getUserById && getUserOrganization) {
        user = await getUserById(userId);
        userOrg = await getUserOrganization(userId);
      } else {
        user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
        userOrg = db.prepare(`
          SELECT o.*, uo.role
          FROM organizations o
          JOIN user_organizations uo ON o.id = uo.organization_id
          WHERE uo.user_id = ?
        `).get(userId) as any;
      }

      const jwtToken = jwt.sign(
        { userId: user.id, email: user.email, emailVerified: true },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      return res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            emailVerified: true,
            createdAt: user.created_at,
          },
          organization: userOrg ? {
            id: userOrg.id,
            name: userOrg.name,
            plan: userOrg.plan,
            role: userOrg.role,
          } : null,
          token: jwtToken,
        },
        message: 'Email already verified',
      });
    }

    // Mark token as used
    const userId = verification.user_id;
    if (dbType === 'postgresql' && markEmailVerificationTokenAsUsed && verifyUserEmail) {
      await markEmailVerificationTokenAsUsed(verification.id);
      await verifyUserEmail(userId);
    } else {
      db.prepare('UPDATE email_verification_tokens SET used = 1 WHERE token = ?').run(trimmedToken);
      const now = new Date().toISOString();
      db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, userId);
    }

    // Get user and organization
    let user;
    let userOrg;
    if (dbType === 'postgresql' && getUserById && getUserOrganization) {
      user = await getUserById(userId);
      userOrg = await getUserOrganization(userId);
    } else {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
      userOrg = db.prepare(`
        SELECT o.*, uo.role
        FROM organizations o
        JOIN user_organizations uo ON o.id = uo.organization_id
        WHERE uo.user_id = ?
      `).get(userId) as any;
    }

    // Generate new JWT token with verified status
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, emailVerified: true },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    console.log('Email verified successfully for user:', user.email);

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: true,
          createdAt: user.created_at,
        },
        organization: userOrg ? {
          id: userOrg.id,
          name: userOrg.name,
          plan: userOrg.plan,
          role: userOrg.role,
        } : null,
        token: jwtToken,
      },
    });
  } catch (error: any) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to verify email',
    });
  }
});

/**
 * Resend verification email
 */
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Find user
    let user;
    if (dbType === 'postgresql' && getUserByEmail) {
      user = await getUserByEmail(email);
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent',
      });
    }

    // Check if already verified
    // Handle both INTEGER (0/1) and boolean values from database
    const emailVerified = user.email_verified === 1 || user.email_verified === true || user.email_verified === '1';
    if (emailVerified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified',
      });
    }

    // Delete old unused tokens for this user
    if (dbType === 'postgresql') {
      const { sql, params } = convertQuery(
        'DELETE FROM email_verification_tokens WHERE user_id = ? AND used = 0',
        [user.id]
      );
      await pool.query(sql, params);
    } else {
      db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ? AND used = 0').run(user.id);
    }

    // Generate new verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    if (dbType === 'postgresql' && createEmailVerificationToken) {
      await createEmailVerificationToken({
        id: uuidv4(),
        userId: user.id,
        token,
        expiresAt
      });
    } else {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), user.id, token, expiresAt, now);
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(user.email, user.name, token);
    if (!emailSent) {
      console.warn('⚠️  Verification email not sent (email service may not be configured)');
      console.log('📧 Verification URL (for testing):', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
    }

    res.json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error: any) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resend verification email',
    });
  }
});

/**
 * Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    // Find user
    let user;
    if (dbType === 'postgresql' && getUserByEmail) {
      user = await getUserByEmail(email);
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    }

    if (!user) {
      console.log(`[Login] User not found: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.log(`[Login] User found: ${email}, email_verified: ${user.email_verified}`);

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      console.log(`[Login] Password mismatch for user: ${email}`);
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    console.log(`[Login] Password verified for user: ${email}`);

    // Check if email is verified - REQUIRED for login (except in development)
    // Handle both INTEGER (0/1) and boolean values from database
    const emailVerified = user.email_verified === 1 || user.email_verified === true || user.email_verified === '1';
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
    
    if (!emailVerified) {
      // In development mode, auto-verify and allow login
      if (isDevelopment) {
        console.log('[Login] Development mode: Auto-verifying email for', user.email);
        const now = new Date().toISOString();
        if (dbType === 'postgresql' && verifyUserEmail) {
          await verifyUserEmail(user.id);
        } else {
          db.prepare('UPDATE users SET email_verified = 1, updated_at = ? WHERE id = ?').run(now, user.id);
        }
        // Continue with login - email is now verified
      } else {
        // Production: require verification
        return res.status(403).json({
          success: false,
          error: 'Email verification required. Please check your email and verify your account before logging in.',
          requiresVerification: true,
          email: user.email,
        });
      }
    }

    // Get user's organization
    let userOrg;
    if (dbType === 'postgresql' && getUserOrganization) {
      userOrg = await getUserOrganization(user.id);
    } else {
      userOrg = db.prepare(`
        SELECT o.*, uo.role
        FROM organizations o
        JOIN user_organizations uo ON o.id = uo.organization_id
        WHERE uo.user_id = ?
      `).get(user.id) as any;
    }

    // Re-check email verified status (in case we just auto-verified it)
    const finalEmailVerified = isDevelopment || (user.email_verified === 1 || user.email_verified === true || user.email_verified === '1');
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, emailVerified: finalEmailVerified },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Fetch fresh user data to get updated email_verified status
    let freshUser;
    if (dbType === 'postgresql' && getUserById) {
      freshUser = await getUserById(user.id);
    } else {
      freshUser = db.prepare('SELECT * FROM users WHERE id = ?').get(user.id) as any;
    }
    
    const finalEmailVerifiedStatus = freshUser?.email_verified === 1 || freshUser?.email_verified === true || freshUser?.email_verified === '1' || isDevelopment;

    res.json({
      success: true,
      data: {
        user: {
          id: freshUser?.id || user.id,
          email: freshUser?.email || user.email,
          name: freshUser?.name || user.name,
          emailVerified: finalEmailVerifiedStatus,
          avatar: freshUser?.avatar || user.avatar,
          role: freshUser?.role || user.role,
          createdAt: freshUser?.created_at || user.created_at,
        },
        organization: userOrg ? {
          id: userOrg.id,
          name: userOrg.name,
          plan: userOrg.plan,
          role: userOrg.role,
        } : null,
        token: jwtToken,
        requiresVerification: false,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to login',
    });
  }
});

/**
 * Request password reset
 */
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Find user
    let user;
    if (dbType === 'postgresql' && getUserByEmail) {
      user = await getUserByEmail(email);
    } else {
      user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    }

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }

    // Delete old unused tokens for this user
    if (dbType === 'postgresql') {
      const { sql, params } = convertQuery(
        'DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0',
        [user.id]
      );
      await pool.query(sql, params);
    } else {
      db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0').run(user.id);
    }

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    if (dbType === 'postgresql' && createPasswordResetToken) {
      await createPasswordResetToken({
        id: uuidv4(),
        userId: user.id,
        token,
        expiresAt
      });
    } else {
      const now = new Date().toISOString();
      db.prepare(`
        INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
        VALUES (?, ?, ?, ?, ?)
      `).run(uuidv4(), user.id, token, expiresAt, now);
    }

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(user.email, user.name, token);
    if (!emailSent) {
      console.warn('⚠️  Password reset email not sent (email service may not be configured)');
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent',
    });
  } catch (error: any) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process password reset request',
    });
  }
});

/**
 * Reset password with token
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        error: 'Token and password are required',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long',
      });
    }

    // Find reset token
    let resetToken;
    if (dbType === 'postgresql' && getPasswordResetToken) {
      resetToken = await getPasswordResetToken(token);
    } else {
      resetToken = db.prepare(`
        SELECT prt.*, u.id as user_id
        FROM password_reset_tokens prt
        JOIN users u ON prt.user_id = u.id
        WHERE prt.token = ? AND prt.used = 0
      `).get(token) as any;
    }

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Check if token is expired (getPasswordResetToken already checks this, but double-check for SQLite)
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);
    const userId = resetToken.user_id || resetToken.userId;

    // Update user password
    if (dbType === 'postgresql' && updateUserPassword) {
      await updateUserPassword(userId, passwordHash);
      // Also update updated_at
      const now = new Date().toISOString();
      const { sql, params } = convertQuery(
        'UPDATE users SET updated_at = ? WHERE id = ?',
        [now, userId]
      );
      await pool.query(sql, params);
    } else {
      const now = new Date().toISOString();
      db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
        passwordHash,
        now,
        userId
      );
    }

    // Mark token as used
    if (dbType === 'postgresql' && markPasswordResetTokenAsUsed) {
      await markPasswordResetTokenAsUsed(resetToken.id);
    } else {
      db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);
    }

    // Delete all other unused reset tokens for this user
    if (dbType === 'postgresql') {
      const { sql, params } = convertQuery(
        'DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0',
        [userId]
      );
      await pool.query(sql, params);
    } else {
      db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0').run(userId);
    }

    res.json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error: any) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reset password',
    });
  }
});

/**
 * Get current user (requires authentication middleware)
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    // Get user
    let user;
    if (dbType === 'postgresql' && createOrganization) {
      user = await getUserById!(userId);
    } else {
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    // Get user's organization
    let userOrg;
    if (dbType === 'postgresql' && getUserOrganization) {
      userOrg = await getUserOrganization(user.id);
    } else {
      userOrg = db.prepare(`
        SELECT o.*, uo.role
        FROM organizations o
        JOIN user_organizations uo ON o.id = uo.organization_id
        WHERE uo.user_id = ?
      `).get(user.id) as any;
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: Boolean(user.email_verified),
          avatar: user.avatar,
          role: user.role,
          createdAt: user.created_at,
        },
        organization: userOrg ? {
          id: userOrg.id,
          name: userOrg.name,
          plan: userOrg.plan,
          role: userOrg.role,
        } : null,
      },
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get user',
    });
  }
});

/**
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.userId;

    const { name, email } = req.body;

    // Validate input
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        error: 'At least one field (name or email) is required',
      });
    }

    // Get current user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const now = new Date().toISOString();
    const updates: string[] = [];
    const values: any[] = [];

    // Update name if provided
    if (name !== undefined) {
      const nameTrimmed = name?.trim();
      if (!nameTrimmed) {
        return res.status(400).json({
          success: false,
          error: 'Name cannot be empty',
        });
      }
      updates.push('name = ?');
      values.push(nameTrimmed);
    }

    // Update email if provided
    if (email !== undefined) {
      const emailTrimmed = email?.trim();
      if (!emailTrimmed) {
        return res.status(400).json({
          success: false,
          error: 'Email cannot be empty',
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid email format',
        });
      }

      // Check if email is already taken by another user
      const existingUser = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(emailTrimmed, userId);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already registered',
        });
      }

      updates.push('email = ?');
      updates.push('email_verified = 0'); // Require re-verification if email changes
      values.push(emailTrimmed);
    }

    // Update updated_at
    updates.push('updated_at = ?');
    values.push(now);
    values.push(userId);

    // Execute update
    const updateQuery = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(updateQuery).run(...values);

    // Get updated user
    const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

    console.log(`Profile updated for user ${userId}`);

    res.json({
      success: true,
      data: {
        user: {
          id: updatedUser.id,
          email: updatedUser.email,
          name: updatedUser.name,
          emailVerified: Boolean(updatedUser.email_verified),
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          createdAt: updatedUser.created_at,
        },
        message: email && email !== user.email ? 'Profile updated. Please verify your new email address.' : 'Profile updated successfully',
      },
    });
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
    }
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update profile',
    });
  }
});

/**
 * Development-only: Delete local user (for testing)
 * Only available in development mode
 */
router.delete('/dev/delete-user/:email', async (req, res) => {
  try {
    const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.RESEND_API_KEY;
    if (!isDevelopment) {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is only available in development mode',
      });
    }

    const { email } = req.params;
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Find user
    let user;
    if (dbType === 'postgresql' && getUserByEmail) {
      user = await getUserByEmail(email);
    } else {
      user = db.prepare('SELECT id FROM users WHERE email = ?').get(email) as any;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
      });
    }

    const userId = user.id;

    // Delete user (cascade will handle related records)
    if (dbType === 'postgresql') {
      const { sql, params } = convertQuery('DELETE FROM users WHERE id = ?', [userId]);
      await pool.query(sql, params);
    } else {
      db.prepare('DELETE FROM users WHERE id = ?').run(userId);
    }

    console.log(`[Dev] Deleted local user: ${email}`);

    res.json({
      success: true,
      message: `Local user ${email} has been deleted. You can now create a new account.`,
    });
  } catch (error: any) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete user',
    });
  }
});

export default router;
