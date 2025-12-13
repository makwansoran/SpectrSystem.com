/**
 * Contact Routes
 * Handles contact form submissions
 */

import express from 'express';
import { db } from '../database';
import { sendContactSalesEmail } from '../services/email';

const router = express.Router();

/**
 * Contact sales form submission
 */
router.post('/sales', async (req, res) => {
  try {
    const { name, email, company, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !company || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, company, and message are required',
      });
    }

    // Store contact submission in database (optional - for tracking)
    // You could create a contacts table if you want to track submissions
    
    // Send email notification to sales team
    const emailSent = await sendContactSalesEmail({
      name,
      email,
      company,
      phone: phone || 'Not provided',
      message,
    });

    if (!emailSent) {
      console.warn('⚠️  Contact sales email not sent (email service may not be configured)');
      // Still return success - the submission was received
    }

    res.json({
      success: true,
      message: 'Thank you for your interest. Our sales team will contact you within 24 hours.',
    });
  } catch (error: any) {
    console.error('Contact sales error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit contact form',
    });
  }
});

export default router;

