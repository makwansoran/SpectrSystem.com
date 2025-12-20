/**
 * SPECTR SYSTEM Email Verification Page
 * Handles email verification via token
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Mail, Loader2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';

const VerifyEmailPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const email = searchParams.get('email');
  const isPending = searchParams.get('pending') === 'true';
  const initialToken = searchParams.get('token');
  
  // Set initial status based on URL params
  const getInitialStatus = (): 'verifying' | 'success' | 'error' | 'pending' => {
    if (initialToken) return 'verifying';
    if (isPending) return 'pending';
    return 'error';
  };
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'pending'>(getInitialStatus());
  const [error, setError] = useState<string>('');
  const [isResending, setIsResending] = useState(false);
  const [hasVerified, setHasVerified] = useState(false);
  const verificationAttemptedRef = useRef<string | null>(null); // Track which token we've already tried
  const isProcessingRef = useRef(false); // Track if we're currently processing

  useEffect(() => {
    // If already verified or success, don't redirect immediately - let the success message show
    // The redirect will happen from the verifyEmail function after showing success
    if ((hasVerified || status === 'success') && verificationAttemptedRef.current) {
      // Success state is already set, just wait for the timeout in verifyEmail
      return;
    }
    
    // If currently processing, don't do anything
    if (isProcessingRef.current) {
      console.log('Already processing verification, skipping...');
      return;
    }
    
    // Get token from URL
    const urlToken = searchParams.get('token');
    
    // PRIORITY: If token exists, verify it (but only once per token)
    if (urlToken && urlToken.trim() !== '') {
      const trimmedToken = urlToken.trim();
      
      // Check if we've already tried this exact token
      if (verificationAttemptedRef.current === trimmedToken) {
        console.log('Token already attempted, skipping duplicate call...');
        return;
      }
      
      // Mark as processing and attempted BEFORE making the call
      isProcessingRef.current = true;
      verificationAttemptedRef.current = trimmedToken;
      console.log('Token found, starting verification...', trimmedToken.substring(0, 10) + '...');
      setStatus('verifying');
      
      // Call verifyEmail
      verifyEmail(trimmedToken).finally(() => {
        // Reset processing flag after completion
        isProcessingRef.current = false;
      });
      return;
    }
    
    // If currently verifying, don't change anything
    if (status === 'verifying') {
      return;
    }
    
    // If pending state (after signup) and no token, show pending message
    if (isPending && !urlToken) {
      if (status !== 'pending') {
        setStatus('pending');
      }
      return;
    }
    
    // No token and not pending - show error
    if (!urlToken && !isPending && status !== 'error') {
      setStatus('error');
      setError('No verification token provided. Please click the verification link in your email.');
    }
  }, [searchParams, hasVerified, status, isPending, navigate]);

  const verifyEmail = async (verificationToken: string): Promise<void> => {
    if (!verificationToken || verificationToken.trim() === '') {
      console.error('Empty token provided to verifyEmail');
      setStatus('error');
      setError('Invalid verification token');
      isProcessingRef.current = false;
      return;
    }
    
    const trimmedToken = verificationToken.trim();
    const emailParam = email || searchParams.get('email');
    console.log('Calling verifyEmail API with token:', trimmedToken.substring(0, 20) + '...', 'email:', emailParam);
    
    try {
      const response = await api.verifyEmail(trimmedToken, emailParam || undefined);
      console.log('Verification response:', response);
      if (response.success) {
        // Mark as verified and store token FIRST
        setHasVerified(true);
        setStatus('success');
        
        // Store token immediately
        if (response.data?.token) {
          localStorage.setItem('token', response.data.token);
          console.log('Token stored in localStorage');
        }
        
        // Update user store to reflect verified status BEFORE redirecting
        try {
          const { useUserStore } = await import('../stores/userStore');
          const { fetchUser, fetchOrganization } = useUserStore.getState();
          
          // Immediately update the user store with verified status from the response
          // This ensures the store is updated before any redirects
          if (response.data?.user) {
            useUserStore.setState({ 
              user: { ...response.data.user, emailVerified: true },
              isAuthenticated: true 
            });
          }
          
          // Also fetch fresh user data to ensure everything is in sync
          await fetchUser();
          await fetchOrganization();
          
          // Double-check the user is marked as verified
          const updatedUser = useUserStore.getState().user;
          if (!updatedUser?.emailVerified) {
            console.warn('User email not marked as verified after fetch, retrying...');
            // Retry once more
            await fetchUser();
          }
          
          // Verify token is still in localStorage before redirecting
          const tokenCheck = localStorage.getItem('token');
          if (!tokenCheck) {
            console.error('Token was lost! Re-storing...');
            if (response.data?.token) {
              localStorage.setItem('token', response.data.token);
            }
          }
        } catch (fetchError) {
          console.warn('Could not fetch user after verification:', fetchError);
        }
        
        // Show success message for 2 seconds, then redirect to plan selection
        // The user store should now be updated with emailVerified = true
        // Add verified=true parameter so SelectPlanPage knows we just verified
        setTimeout(() => {
          // Double-check token one more time before navigating
          const finalTokenCheck = localStorage.getItem('token');
          if (!finalTokenCheck && response.data?.token) {
            localStorage.setItem('token', response.data.token);
          }
          console.log('Navigating to select-plan, token exists:', !!localStorage.getItem('token'));
          navigate('/select-plan?verified=true');
        }, 2000);
      } else {
        setStatus('error');
        setError(response.error || 'Verification failed');
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        tokenUsed: trimmedToken.substring(0, 20) + '...'
      });
      
      // Get the actual error message from backend
      const backendError = err.response?.data?.error;
      
      // If token was already used, it means verification succeeded before (duplicate call)
      // This is OK - show success and redirect
      if (backendError && (backendError.includes('already been used') || backendError.includes('already verified'))) {
        console.log('Token already used - verification succeeded, showing success...');
        setHasVerified(true);
        setStatus('success');
        // Try to get user token if not in localStorage
        const existingToken = localStorage.getItem('token');
        if (!existingToken) {
          try {
            const { useUserStore } = await import('../stores/userStore');
            const { fetchUser } = useUserStore.getState();
            await fetchUser();
          } catch (fetchError) {
            console.warn('Could not fetch user after verification');
          }
        }
        // Show success message for 2 seconds, then redirect to plan selection
        // Add verified=true parameter so SelectPlanPage knows we just verified
        setTimeout(() => {
          navigate('/select-plan?verified=true');
        }, 2000);
        isProcessingRef.current = false;
        return;
      }
      
      setStatus('error');
      let errorMessage = 'Failed to verify email';
      
      if (backendError) {
        errorMessage = backendError;
      } else if (err.response?.status === 400) {
        errorMessage = 'Invalid or expired verification token. Please request a new verification email.';
      } else if (err.message && (err.message.includes('Network Error') || err.message.includes('timeout'))) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else {
        errorMessage = err.message || 'Failed to verify email';
      }
      
      setError(errorMessage);
      isProcessingRef.current = false;
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    try {
      const emailToResend = email || searchParams.get('email');
      if (!emailToResend) {
        setError('Email address is required to resend verification');
        setIsResending(false);
        return;
      }
      
      await api.resendVerification(emailToResend);
      setError('');
      setStatus('pending');
      // Show success message
      alert('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gray-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-100 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
            <span className="text-2xl font-semibold tracking-wide text-gray-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>SPECTR SYSTEM</span>
          </div>

          {/* Status Display */}
          <div className="text-center mb-8">
            {status === 'pending' && (
              <>
                <Mail className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <h1 className="text-3xl font-light tracking-tight mb-2 text-gray-900">Check your email</h1>
                <p className="text-gray-600 mb-4">
                  We've sent a verification link to <strong className="text-gray-900">{email}</strong>
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  Click the link in the email to verify your account. The link will expire in 24 hours.
                </p>
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className={clsx(
                    'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base',
                    'bg-gray-900 text-white font-medium',
                    'hover:bg-gray-800 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>
              </>
            )}

            {status === 'verifying' && (
              <>
                <Loader2 className="w-16 h-16 mx-auto mb-4 text-gray-900 animate-spin" />
                <h1 className="text-3xl font-light tracking-tight mb-2 text-gray-900">Verifying your email</h1>
                <p className="text-gray-600">Please wait...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-600" />
                </motion.div>
                <h1 className="text-3xl font-light tracking-tight mb-2 text-gray-900">Email verified!</h1>
                <p className="text-gray-600">Your email address has been successfully verified.</p>
                <p className="text-gray-500 text-sm mt-2">Redirecting to plan selection...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 mx-auto mb-4 text-red-600" />
                <h1 className="text-3xl font-light tracking-tight mb-2 text-gray-900">Verification failed</h1>
                <p className="text-gray-600 mb-4">{error}</p>
                
                {(error.includes('expired') || error.includes('Invalid')) && email && (
                  <div className="mt-6">
                    <button
                      onClick={handleResend}
                      disabled={isResending}
                      className={clsx(
                        'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-base',
                        'bg-gray-900 text-white font-medium',
                        'hover:bg-gray-800 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      {isResending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          <span>Resend Verification Email</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-gray-600">
            <Link
              to="/signin"
              className="text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center gap-1"
            >
              Back to Sign In
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;

