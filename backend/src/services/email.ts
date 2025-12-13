/**
 * Email Service
 * Handles sending verification emails and other email notifications
 */

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

// Email configuration from environment variables
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER || 'noreply@spectrsystems.io';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Create transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: SMTP_USER && SMTP_PASS ? {
    user: SMTP_USER,
    pass: SMTP_PASS,
  } : undefined,
});

/**
 * Verify email transporter configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('⚠️  Email service not configured. SMTP_USER and SMTP_PASS environment variables are required.');
      return false;
    }
    await transporter.verify();
    console.log('✅ Email service configured successfully');
    return true;
  } catch (error) {
    console.error('❌ Email service configuration failed:', error);
    return false;
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('⚠️  Email service not configured. Skipping email send.');
      return false;
    }

    const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;

    // Try to load logo as base64 for embedding
    let logoDataUri = '';
    try {
      const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'EyelogoWhite.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (error) {
      console.warn('Could not load logo for email, using text only');
    }

    const mailOptions: any = {
      from: `"SPECTR SYSTEMS" <${SMTP_FROM}>`,
      to: email,
      subject: 'Verify your SPECTR SYSTEMS account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #fff; background: #000; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #000; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #000;">
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 40px 0 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                      <div style="display: inline-flex; align-items: center; gap: 12px;">
                        ${logoDataUri ? `<img src="${logoDataUri}" alt="SPECTR SYSTEMS" style="height: 48px; width: auto;" />` : ''}
                        <span style="font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #fff;">SPECTR SYSTEMS</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="margin: 0 0 20px; font-size: 32px; font-weight: 300; letter-spacing: -0.02em; color: #fff;">Verify your email address</h1>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                        Hi ${name},
                      </p>
                      
                      <p style="margin: 0 0 30px; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                        Thank you for signing up for SPECTR SYSTEMS. Please verify your email address by clicking the button below:
                      </p>
                      
                      <!-- Verify Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${verificationUrl}" 
                               target="_self"
                               rel="noopener noreferrer"
                               style="display: inline-block; background: #fff; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; letter-spacing: 0.01em; -webkit-user-select: none; user-select: none;">
                              Verify Email Address
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <p style="margin: 30px 0 10px; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0 0 30px; font-size: 12px; color: rgba(255, 255, 255, 0.4); word-break: break-all; font-family: monospace;">
                        ${verificationUrl}
                      </p>
                      
                      <!-- Expiration Notice -->
                      <p style="margin: 30px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
                        This link will expire in 24 hours. If you didn't create an account with SPECTR SYSTEMS, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                      <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                        © ${new Date().getFullYear()} SPECTR SYSTEMS. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
      text: `
        Verify your SPECTR SYSTEMS account
        
        Hi ${name},
        
        Thank you for signing up for SPECTR SYSTEMS. Please verify your email address by visiting this link:
        
        ${verificationUrl}
        
        This link will expire in 24 hours. If you didn't create an account with SPECTR SYSTEMS, you can safely ignore this email.
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send verification email:', error);
    return false;
  }
}

/**
 * Send contact sales email notification
 */
export async function sendContactSalesEmail(data: {
  name: string;
  email: string;
  company: string;
  phone: string;
  message: string;
}): Promise<boolean> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('⚠️  Email service not configured. Skipping email send.');
      return false;
    }

    const salesEmail = process.env.SALES_EMAIL || SMTP_USER;
    const subject = `New Enterprise Sales Inquiry from ${data.company}`;

    // Try to load logo as base64 for embedding
    let logoDataUri = '';
    try {
      const logoPath = path.join(process.cwd(), '..', 'frontend', 'public', 'EyelogoWhite.png');
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        logoDataUri = `data:image/png;base64,${logoBuffer.toString('base64')}`;
      }
    } catch (error) {
      console.warn('Could not load logo for email, using text only');
    }

    const mailOptions: any = {
      from: `"SPECTR SYSTEMS" <${SMTP_FROM}>`,
      to: salesEmail,
      replyTo: data.email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #fff; background: #000; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #000; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #000;">
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 40px 0 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                      <div style="display: inline-flex; align-items: center; gap: 12px;">
                        <img src="${FRONTEND_URL}/EyelogoWhite.png" alt="SPECTR SYSTEMS" style="height: 48px; width: auto;" />
                        <span style="font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #fff;">SPECTR SYSTEMS</span>
                      </div>
                      <p style="margin: 10px 0 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.6);">New Enterprise Sales Inquiry</p>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h2 style="margin: 0 0 30px; font-size: 24px; font-weight: 300; letter-spacing: -0.02em; color: #fff;">Contact Information</h2>
                      
                      <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 12px 0; font-weight: 500; width: 120px; color: rgba(255, 255, 255, 0.7); font-size: 14px;">Name:</td>
                          <td style="padding: 12px 0; color: #fff; font-size: 14px;">${data.name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-weight: 500; color: rgba(255, 255, 255, 0.7); font-size: 14px;">Email:</td>
                          <td style="padding: 12px 0;"><a href="mailto:${data.email}" style="color: #fff; text-decoration: underline;">${data.email}</a></td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-weight: 500; color: rgba(255, 255, 255, 0.7); font-size: 14px;">Company:</td>
                          <td style="padding: 12px 0; color: #fff; font-size: 14px;">${data.company}</td>
                        </tr>
                        <tr>
                          <td style="padding: 12px 0; font-weight: 500; color: rgba(255, 255, 255, 0.7); font-size: 14px;">Phone:</td>
                          <td style="padding: 12px 0; color: #fff; font-size: 14px;">${data.phone}</td>
                        </tr>
                      </table>
                      
                      <h3 style="font-size: 18px; font-weight: 400; margin: 30px 0 15px; color: #fff;">Message</h3>
                      <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 4px; border-left: 3px solid #fff;">
                        <p style="margin: 0; white-space: pre-wrap; color: rgba(255, 255, 255, 0.8); font-size: 14px; line-height: 1.6;">${data.message}</p>
                      </div>
                      
                      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <a href="mailto:${data.email}" style="display: inline-block; padding: 12px 24px; background: #fff; color: #000; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px;">
                          Reply to ${data.name}
                        </a>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                      <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                        © ${new Date().getFullYear()} SPECTR SYSTEMS. All rights reserved.
                      </p>
                    </td>
                  </tr>
        </body>
        </html>
      `,
      text: `
        New Enterprise Sales Inquiry
        
        Contact Information:
        Name: ${data.name}
        Email: ${data.email}
        Company: ${data.company}
        Phone: ${data.phone}
        
        Message:
        ${data.message}
        
        ---
        Reply to: ${data.email}
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Contact sales email sent to ${salesEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send contact sales email:', error);
    return false;
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  token: string
): Promise<boolean> {
  try {
    if (!SMTP_USER || !SMTP_PASS) {
      console.warn('⚠️  Email service not configured. Skipping email send.');
      return false;
    }

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;

    const mailOptions = {
      from: `"SPECTR SYSTEMS" <${SMTP_FROM}>`,
      to: email,
      subject: 'Reset your SPECTR SYSTEMS password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #fff; background: #000; margin: 0; padding: 0;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background: #000; min-height: 100vh;">
            <tr>
              <td align="center" style="padding: 40px 20px;">
                <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: #000;">
                  <!-- Header with Logo -->
                  <tr>
                    <td style="padding: 40px 0 30px; text-align: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                      <div style="display: inline-flex; align-items: center; gap: 12px;">
                        ${logoDataUri ? `<img src="${logoDataUri}" alt="SPECTR SYSTEMS" style="height: 48px; width: auto;" />` : ''}
                        <span style="font-size: 24px; font-weight: 600; letter-spacing: -0.02em; color: #fff;">SPECTR SYSTEMS</span>
                      </div>
                    </td>
                  </tr>
                  
                  <!-- Main Content -->
                  <tr>
                    <td style="padding: 40px 30px;">
                      <h1 style="margin: 0 0 20px; font-size: 32px; font-weight: 300; letter-spacing: -0.02em; color: #fff;">Reset your password</h1>
                      
                      <p style="margin: 0 0 20px; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                        Hi ${name},
                      </p>
                      
                      <p style="margin: 0 0 30px; font-size: 16px; color: rgba(255, 255, 255, 0.7); line-height: 1.6;">
                        We received a request to reset your password. Click the button below to create a new password:
                      </p>
                      
                      <!-- Reset Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" 
                               target="_self"
                               style="display: inline-block; background: #fff; color: #000; padding: 14px 32px; text-decoration: none; border-radius: 4px; font-weight: 500; font-size: 14px; letter-spacing: 0.01em;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>
                      
                      <!-- Alternative Link -->
                      <p style="margin: 30px 0 10px; font-size: 14px; color: rgba(255, 255, 255, 0.5);">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 0 0 30px; font-size: 12px; color: rgba(255, 255, 255, 0.4); word-break: break-all; font-family: monospace;">
                        ${resetUrl}
                      </p>
                      
                      <!-- Expiration Notice -->
                      <p style="margin: 30px 0 0; font-size: 14px; color: rgba(255, 255, 255, 0.5); line-height: 1.6;">
                        This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                      <p style="margin: 0; font-size: 12px; color: rgba(255, 255, 255, 0.4);">
                        © ${new Date().getFullYear()} SPECTR SYSTEMS. All rights reserved.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send password reset email:', error);
    return false;
  }
}

