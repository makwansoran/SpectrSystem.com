/**
 * SPECTR SYSTEM Reset Password Page
 * Reset password with token
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Lock, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';

const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'form' | 'verifying' | 'success' | 'error'>('form');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No reset token provided');
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    setIsLoading(true);
    setStatus('verifying');

    try {
      await api.resetPassword(token, password);
      setStatus('success');
      // Redirect to sign in after 2 seconds
      setTimeout(() => {
        navigate('/signin');
      }, 2000);
    } catch (err: any) {
      setStatus('error');
      setError(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

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

          {/* Status Display */}
          {status === 'success' && (
            <div className="text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h1 className="text-3xl font-light tracking-tight mb-2">Password reset!</h1>
              <p className="text-white/60 mb-4">Your password has been successfully reset.</p>
              <p className="text-white/40 text-sm">Redirecting to sign in...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h1 className="text-3xl font-light tracking-tight mb-2">Reset failed</h1>
              <p className="text-white/60 mb-6">{error}</p>
              <Link
                to="/forgot-password"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Request New Reset Link
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {status === 'form' && (
            <>
              {/* Title */}
              <div className="text-center mb-8">
                <h1 className="text-3xl font-light tracking-tight mb-2">Set new password</h1>
                <p className="text-white/60">Enter your new password below.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* New Password */}
                <div>
                  <label htmlFor="password" className="block text-sm text-white/80 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      className={clsx(
                        'w-full pl-10 pr-4 py-3 rounded-lg',
                        'bg-white/5 border border-white/10',
                        'text-white placeholder-white/40',
                        'focus:outline-none focus:border-white/30 focus:bg-white/10',
                        'transition-colors'
                      )}
                    />
                  </div>
                  <p className="text-xs text-white/40 mt-1">Must be at least 8 characters</p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm text-white/80 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={8}
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

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                    {error}
                  </div>
                )}

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
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {status === 'verifying' && (
            <div className="text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 text-white animate-spin" />
              <h1 className="text-3xl font-light tracking-tight mb-2">Resetting password</h1>
              <p className="text-white/60">Please wait...</p>
            </div>
          )}

          {/* Footer */}
          {status === 'form' && (
            <div className="mt-8 text-center text-sm text-white/60">
              <Link
                to="/signin"
                className="text-white hover:text-white/80 transition-colors inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

