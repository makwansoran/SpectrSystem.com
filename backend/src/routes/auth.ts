/**
 * Authentication Routes
 * Handles user registration, login, email verification, and password reset
 */

import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { db, getUserByEmail, getUserById, createUser, createOrganization, linkUserToOrganization, createEmailVerificationToken, getEmailVerificationToken, markEmailVerificationTokenAsUsed, verifyUserEmail, getUserOrganization, createPasswordResetToken, getPasswordResetToken, markPasswordResetTokenAsUsed, updateUserPassword } from '../database';
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
      existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(emailTrimmed);
    }
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered',
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
    if (!emailSent) {
      console.warn('⚠️  Verification email not sent (email service may not be configured)');
      console.log('📧 Verification URL (for testing):', `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`);
    }

    // Generate JWT token (user can use this but will need to verify email for full access)
    const jwtToken = jwt.sign(
      { userId, email, emailVerified: false },
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
          emailVerified: false,
          createdAt: now,
        },
        organization: {
          id: orgId,
          name: `${name}'s Organization`,
          plan: 'free',
          role: 'admin',
        },
        token: jwtToken,
        requiresVerification: true,
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
    const { token } = req.body;
    console.log('Verification request received for token:', token?.substring(0, 10) + '...');

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Verification token is required',
      });
    }

    // Find verification token
    let verification;
    if (dbType === 'postgresql' && getEmailVerificationToken) {
      verification = await getEmailVerificationToken(token);
    } else {
      verification = db.prepare(`
        SELECT evt.*, u.id as user_id, u.email, u.email_verified
        FROM email_verification_tokens evt
        JOIN users u ON evt.user_id = u.id
        WHERE evt.token = ? AND evt.used = 0
      `).get(token) as any;
    }

    console.log('Verification lookup result:', verification ? 'Found' : 'Not found');
    
    if (!verification) {
      console.log('Token not found in database');
      return res.status(400).json({
        success: false,
        error: 'Invalid verification token. The link may have expired or is incorrect. Please request a new verification email.',
      });
    }

    // Check if token is expired
    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Verification token has expired',
      });
    }

    // Check if already verified
    if (verification.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified',
      });
    }

    // Mark token as used
    const userId = verification.user_id;
    if (dbType === 'postgresql' && markEmailVerificationTokenAsUsed && verifyUserEmail) {
      await markEmailVerificationTokenAsUsed(verification.id);
      await verifyUserEmail(userId);
    } else {
      db.prepare('UPDATE email_verification_tokens SET used = 1 WHERE token = ?').run(token);
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
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a verification link has been sent',
      });
    }

    // Check if already verified
    if (user.email_verified) {
      return res.status(400).json({
        success: false,
        error: 'Email already verified',
      });
    }

    // Delete old unused tokens for this user
    db.prepare('DELETE FROM email_verification_tokens WHERE user_id = ? AND used = 0').run(user.id);

    // Generate new verification token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO email_verification_tokens (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), user.id, token, expiresAt, now);

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
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
    }

    // Check if email is verified - REQUIRED for login
    const emailVerified = dbType === 'postgresql' ? Boolean(user.email_verified) : Boolean(user.email_verified);
    if (!emailVerified) {
      return res.status(403).json({
        success: false,
        error: 'Email verification required',
        requiresVerification: true,
        email: user.email,
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

    // Generate JWT token (only if email is verified)
    const jwtToken = jwt.sign(
      { userId: user.id, email: user.email, emailVerified: true },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: true,
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
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    }

    // Delete old unused tokens for this user
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0').run(user.id);

    // Generate reset token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO password_reset_tokens (id, user_id, token, expires_at, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(uuidv4(), user.id, token, expiresAt, now);

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
    const resetToken = db.prepare(`
      SELECT prt.*, u.id as user_id
      FROM password_reset_tokens prt
      JOIN users u ON prt.user_id = u.id
      WHERE prt.token = ? AND prt.used = 0
    `).get(token) as any;

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired reset token',
      });
    }

    // Check if token is expired
    if (new Date(resetToken.expires_at) < new Date()) {
      return res.status(400).json({
        success: false,
        error: 'Reset token has expired',
      });
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    const now = new Date().toISOString();
    db.prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?').run(
      passwordHash,
      now,
      resetToken.user_id
    );

    // Mark token as used
    db.prepare('UPDATE password_reset_tokens SET used = 1 WHERE token = ?').run(token);

    // Delete all other unused reset tokens for this user
    db.prepare('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0').run(resetToken.user_id);

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

export default router;
