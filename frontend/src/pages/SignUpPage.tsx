/**
 * SPECTR SYSTEM Sign Up Page
 * Palantir-inspired design
 */

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mail, Lock, User, Check, Eye, EyeOff } from 'lucide-react';
import clsx from 'clsx';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!name || !name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    
    if (!email || !email.trim()) {
      alert('Please enter your email address.');
      return;
    }
    
    if (!password || password.length < 8) {
      alert('Password must be at least 8 characters long.');
      return;
    }
    
    // Check if terms are agreed to
    if (!agreedToTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy to continue.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { useUserStore } = await import('../stores/userStore');
      const { register } = useUserStore.getState();
      
      const response = await register(email.trim(), password, name.trim());
      
      if (response.requiresVerification) {
        // Navigate to verification page with email
        navigate(`/verify-email?email=${encodeURIComponent(email.trim())}&pending=true`);
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || error.message || 'Registration failed. Please try again.';
      alert(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gray-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-100 blur-3xl" />
      </div>

      {/* Two Column Layout */}
      <div className="relative z-10 w-full flex">
        {/* Left Side - Pointers/Information */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-lg"
          >
            {/* Logo */}
            <div className="flex items-center mb-12">
              <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span className="text-2xl font-semibold tracking-wide text-gray-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>SPECTR SYSTEM</span>
            </div>

            {/* Title */}
            <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-6 text-gray-900">
              Join the intelligence platform
            </h1>
            <p className="text-xl text-gray-600 mb-12 leading-relaxed">
              Get started with SPECTR SYSTEM and transform how you work with data.
            </p>

            {/* Pointers Section */}
            <div className="space-y-8">
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium mb-2 text-gray-900">Integrate with Any Business</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">Connect seamlessly with your existing tools and systems</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium mb-2 text-gray-900">Seamless Workflow</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">Build and automate workflows that work exactly how you need them</p>
                </div>
              </div>
              <div className="flex items-start gap-5">
                <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                  <Check className="w-5 h-5 text-gray-900" />
                </div>
                <div>
                  <h3 className="text-2xl font-medium mb-2 text-gray-900">Endless Possibilities</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">Unlock the full potential of your data with unlimited customization</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Create Account Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-lg"
          >
            {/* Mobile Logo */}
            <div className="flex items-center justify-center mb-8 lg:hidden">
              <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span className="text-2xl font-semibold tracking-wide text-gray-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>SPECTR SYSTEM</span>
            </div>

            <div className="bg-gray-50 backdrop-blur-sm border border-gray-200 rounded-lg p-10 lg:p-12">
              {/* Title */}
              <div className="mb-10">
                <h1 className="text-3xl lg:text-4xl font-light tracking-tight mb-2 text-gray-900">Create an account</h1>
                <p className="text-gray-600 text-lg">Get started with SPECTR SYSTEM</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name || ''}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  required
                  className={clsx(
                    'w-full pl-10 pr-4 py-4 rounded-lg text-base',
                    'bg-white border border-gray-300',
                    'text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200',
                    'transition-colors'
                  )}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email || ''}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={clsx(
                    'w-full pl-10 pr-4 py-4 rounded-lg text-base',
                    'bg-white border border-gray-300',
                    'text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200',
                    'transition-colors'
                  )}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password || ''}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  className={clsx(
                    'w-full pl-10 pr-12 py-4 rounded-lg text-base',
                    'bg-white border border-gray-300',
                    'text-gray-900 placeholder-gray-400',
                    'focus:outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-200',
                    'transition-colors'
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                required
                className="mt-1 rounded border-gray-300 bg-white focus:ring-2 focus:ring-gray-200"
              />
              <label htmlFor="terms" className={clsx(
                'cursor-pointer',
                agreedToTerms ? 'text-gray-700' : 'text-gray-600'
              )}>
                I agree to the{' '}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700 transition-colors underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700 transition-colors underline">
                  Privacy Policy
                </Link>
                {' '}*
              </label>
            </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={isLoading || !agreedToTerms}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-base',
                  'bg-gray-900 text-white font-medium',
                  'hover:bg-gray-800 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'group'
                )}
              >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

              {/* Footer */}
              <div className="mt-8 text-center text-sm text-gray-600">
                <p>
                  Already have an account?{' '}
                  <Link to="/signin" className="text-gray-900 hover:text-gray-700 transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>

              {/* Back to home */}
              <div className="mt-6 text-center">
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  ← Back to home
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;

