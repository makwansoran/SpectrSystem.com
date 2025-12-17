/**
 * Login Modal
 * Modal for logging in when accessing the workflow editor
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    
    if (!password) {
      setError('Please enter your password.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { useUserStore } = await import('../stores/userStore');
      const { login } = useUserStore.getState();
      
      const response = await login(email.trim(), password);
      
      if (response.requiresVerification) {
        // Close modal and navigate to verification
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        window.location.href = `/verify-email?email=${encodeURIComponent(email.trim())}&pending=true`;
      } else {
        // Login successful
        onClose();
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      // Check if error is due to email verification requirement
      if (error.response?.data?.requiresVerification || error.message?.includes('verification')) {
        const emailFromError = error.response?.data?.email || email;
        onClose();
        if (onSuccess) {
          onSuccess();
        }
        window.location.href = `/verify-email?email=${encodeURIComponent(emailFromError)}&pending=true`;
      } else {
        const errorMessage = error.response?.data?.error || error.message || 'Login failed. Please check your credentials.';
        setError(errorMessage);
        setIsLoading(false);
      }
    }
  };

  const handleCreateAccount = () => {
    onClose();
    window.location.href = '/signup';
  };

  const handleClose = () => {
    if (!isLoading) {
      setEmail('');
      setPassword('');
      setShowPassword(false);
      setError(null);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl pointer-events-auto relative flex">

              {/* Left Side - Login Form */}
              <div className="flex-1 p-12">
                {/* Header */}
                <div className="mb-8">
                  <h2 className="text-3xl font-light tracking-tight text-gray-900 mb-2">
                    Sign In
                  </h2>
                  <p className="text-sm text-gray-600">
                    Welcome back to SPECTR SYSTEM
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5 uppercase tracking-wide">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="w-full pl-10 pr-10 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Forgot Password Link */}
                  <div className="text-right">
                    <a href="/forgot-password" className="text-xs text-gray-600 hover:text-gray-900 underline">
                      Forgot password?
                    </a>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={clsx(
                      'w-full py-3 px-4 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed',
                      isLoading && 'cursor-wait'
                    )}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Divider */}
              <div className="w-px bg-gray-200 my-8" />

              {/* Right Side - Create Account */}
              <div className="flex-1 p-12 flex flex-col items-center justify-center bg-white">
                <div className="text-center max-w-sm">
                  <h3 className="text-2xl font-light tracking-tight text-gray-900 mb-4">
                    Don't have an account?
                  </h3>
                  <p className="text-sm text-gray-600 mb-8">
                    Create a free account to start building workflows and automating your processes.
                  </p>
                  <button
                    onClick={handleCreateAccount}
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-white border-2 border-gray-900 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CreateAccountModal;

