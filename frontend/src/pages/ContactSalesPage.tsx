/**
 * SPECTR SYSTEM Contact Sales Page
 * Form for enterprise customers to contact sales
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Mail, User, Building2, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';

const ContactSalesPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Scroll to top when component mounts or when submission state changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [isSubmitted]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.contactSales(formData);
      setIsSubmitted(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
      });
    } catch (error: any) {
      alert(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
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
            className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center"
          >
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h1 className="text-3xl font-light tracking-tight mb-2">Message sent!</h1>
            <p className="text-white/60 mb-8">
              Thank you for your interest. Our sales team will contact you within 24 hours.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setIsSubmitted(false)}
                className="px-6 py-3 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Send Another Message
              </button>
              <Link
                to="/"
                className="px-6 py-3 border border-white/20 text-white text-sm font-medium hover:border-white/40 transition-colors text-center"
              >
                Back to Home
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 fixed top-0 left-0 right-0 bg-black/80 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <Link to="/" className="flex items-center text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <img src="/EyelogoWhite.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span>SPECTR SYSTEM</span>
            </Link>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 lg:px-8 pt-32 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="text-sm tracking-widest text-white/60 mb-6">CONTACT SALES</div>
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-8">
              Let's discuss your enterprise needs
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto">
              Fill out the form below and our sales team will get back to you within 24 hours.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-10 lg:p-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm text-white/80 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                    className={clsx(
                      'w-full pl-10 pr-4 py-4 rounded-lg text-base',
                      'bg-white/5 border border-white/10',
                      'text-white placeholder-white/40',
                      'focus:outline-none focus:border-white/30 focus:bg-white/10',
                      'transition-colors'
                    )}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm text-white/80 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    required
                    className={clsx(
                      'w-full pl-10 pr-4 py-4 rounded-lg text-base',
                      'bg-white/5 border border-white/10',
                      'text-white placeholder-white/40',
                      'focus:outline-none focus:border-white/30 focus:bg-white/10',
                      'transition-colors'
                    )}
                  />
                </div>
              </div>

              {/* Company and Phone Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Company */}
                <div>
                  <label htmlFor="company" className="block text-sm text-white/80 mb-2">
                    Company *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Company Name"
                      required
                      className={clsx(
                        'w-full pl-10 pr-4 py-4 rounded-lg text-base',
                        'bg-white/5 border border-white/10',
                        'text-white placeholder-white/40',
                        'focus:outline-none focus:border-white/30 focus:bg-white/10',
                        'transition-colors'
                      )}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm text-white/80 mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className={clsx(
                      'w-full px-4 py-4 rounded-lg text-base',
                      'bg-white/5 border border-white/10',
                      'text-white placeholder-white/40',
                      'focus:outline-none focus:border-white/30 focus:bg-white/10',
                      'transition-colors'
                    )}
                  />
                </div>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm text-white/80 mb-2">
                  Message *
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-white/40" />
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your requirements, use cases, and any questions you have..."
                    required
                    rows={6}
                    className={clsx(
                      'w-full pl-10 pr-4 py-4 rounded-lg text-base resize-none',
                      'bg-white/5 border border-white/10',
                      'text-white placeholder-white/40',
                      'focus:outline-none focus:border-white/30 focus:bg-white/10',
                      'transition-colors'
                    )}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={clsx(
                  'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-base',
                  'bg-white text-black font-medium',
                  'hover:bg-white/90 transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'group'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send Message</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Note */}
            <div className="mt-8 text-center text-sm text-white/40">
              <p>
                By submitting this form, you agree to our{' '}
                <Link to="/privacy" className="text-white/60 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
                {' '}and{' '}
                <Link to="/terms" className="text-white/60 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactSalesPage;

