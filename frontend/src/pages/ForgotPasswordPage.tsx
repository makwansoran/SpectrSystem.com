/**
 * SPECTR SYSTEM Forgot Password Page
 * Request password reset
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await api.requestPasswordReset(email);
      setIsSuccess(true);
    } catch (error: any) {
      alert(error.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-3xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-md px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8"
          >
            {/* Logo */}
            <div className="flex items-center justify-center mb-8">
              <img src="/EyelogoWhite.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span className="text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>SPECTR SYSTEM</span>
            </div>

            {/* Success Message */}
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-3xl font-light tracking-tight mb-2">Check your email</h1>
              <p className="text-white/60 mb-6">
                If an account exists with <strong>{email}</strong>, we've sent a password reset link.
              </p>
              <p className="text-white/40 text-sm mb-8">
                The link will expire in 1 hour. If you don't see the email, check your spam folder.
              </p>
              
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmail('');
                    setIsSuccess(false);
                  }}
                  className="w-full px-6 py-3 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Send Another Email
                </button>
                <Link
                  to="/signin"
                  className="block w-full px-6 py-3 border border-white/20 text-white text-sm font-medium hover:border-white/40 transition-colors text-center"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/EyelogoWhite.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
            <span className="text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>SPECTR SYSTEM</span>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light tracking-tight mb-2">Reset your password</h1>
            <p className="text-white/60">Enter your email address and we'll send you a link to reset your password.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-white/80 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={clsx(
                    'w-full pl-10 pr-4 py-3 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder-white/40',
                    'focus:outline-none focus:border-white/30 focus:bg-white/10',
                    'transition-colors'
                  )}
                />
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className={clsx(
                'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg',
                'bg-white text-black font-medium',
                'hover:bg-white/90 transition-colors',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'group'
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-white/60">
            <Link
              to="/signin"
              className="text-white hover:text-white/80 transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

