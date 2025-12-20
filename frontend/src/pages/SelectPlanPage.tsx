/**
 * SPECTR SYSTEM Plan Selection Page
 * Shown after email verification to choose a subscription plan
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader2, ArrowRight } from 'lucide-react';
import clsx from 'clsx';
import * as api from '../services/api';
import { useUserStore } from '../stores/userStore';

const SelectPlanPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const justVerified = searchParams.get('verified') === 'true';
  const { user, organization, fetchOrganization } = useUserStore();
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        // If we just verified, wait a moment for token to be set
        if (justVerified) {
          await new Promise(resolve => setTimeout(resolve, 300)); // Wait 300ms
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
          // If we just verified but no token, wait a bit more
          if (justVerified) {
            await new Promise(resolve => setTimeout(resolve, 500));
            const retryToken = localStorage.getItem('token');
            if (!retryToken) {
              console.error('No token found after verification, redirecting to signin');
              navigate('/signin');
              return;
            }
          } else {
            // Not authenticated, redirect to sign in
            navigate('/signin');
            return;
          }
        }

        // Fetch user and organization
        const { fetchUser, fetchOrganization } = useUserStore.getState();
        await fetchUser();
        await fetchOrganization();
        
        // If we just verified, give it a moment and retry once more
        if (justVerified) {
          await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
          await fetchUser(); // Fetch again to ensure we have the latest data
          await fetchOrganization();
        }
        
        const currentUser = useUserStore.getState().user;
        const currentOrg = useUserStore.getState().organization;

        // Check if email is verified (but be lenient if we just verified)
        if (!currentUser?.emailVerified && !justVerified) {
          // Email not verified, redirect to verification
          navigate('/verify-email?pending=true');
          return;
        }
        
        // If we just verified but still not showing as verified, wait a bit more
        if (!currentUser?.emailVerified && justVerified) {
          console.warn('User just verified but emailVerified not set yet, waiting...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          await fetchUser();
          const retryUser = useUserStore.getState().user;
          if (!retryUser?.emailVerified) {
            console.warn('User still not verified after retry, but continuing anyway since verification just succeeded');
            // Still show the page - don't redirect back since we just verified
            // The backend has already marked the user as verified, so this is likely a timing issue
          }
        }

        // If user already has a paid plan, redirect to home
        // (Free plan users can still select a plan)
        if (currentOrg && currentOrg.plan && currentOrg.plan !== 'free') {
          navigate('/home');
          return;
        }

        setIsChecking(false);
      } catch (error) {
        console.error('Error checking auth:', error);
        // If we just verified and there's an error, still show the page
        if (justVerified) {
          console.warn('Error after verification, but continuing to show plan selection');
          setIsChecking(false);
        } else {
          // If error and not just verified, redirect to signin
          navigate('/signin');
        }
      }
    };

    checkAuth();
  }, [fetchOrganization, navigate, justVerified]);

  const handleSelectPlan = async (plan: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setSelectedPlan(plan);
    try {
      console.log('Selecting plan:', plan);
      await api.updateOrganizationPlan(plan);
      console.log('Plan updated successfully:', plan);
      
      // Refresh organization data and user data
      const { fetchUser, fetchOrganization } = useUserStore.getState();
      await fetchUser();
      await fetchOrganization();
      
      // Verify the plan was saved
      const updatedOrg = useUserStore.getState().organization;
      console.log('Organization after update:', updatedOrg);
      
      if (updatedOrg?.plan !== plan) {
        console.warn('Plan mismatch! Expected:', plan, 'Got:', updatedOrg?.plan);
      }
      
      // Redirect to home
      navigate('/home');
    } catch (error: any) {
      console.error('Failed to update plan:', error);
      alert(error.message || 'Failed to update plan. Please try again.');
      setIsLoading(false);
      setSelectedPlan('');
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white text-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
      </div>
    );
  }

  const plans = [
    {
      id: 'free',
      name: 'STARTER',
      price: 0,
      description: 'For individuals exploring intelligence platforms',
      features: [
        '1,000 operations/month',
        '5 active workflows',
        'Core integrations',
        'Community support',
        '7-day execution history',
        'Basic analytics'
      ],
      popular: false,
    },
    {
      id: 'standard',
      name: 'STANDARD',
      price: 29,
      description: 'For growing teams and small businesses',
      features: [
        '10,000 operations/month',
        '20 active workflows',
        'All core integrations',
        'Email support',
        '30-day execution history',
        'Standard analytics',
        'Basic team collaboration',
        'API access'
      ],
      popular: false,
    },
    {
      id: 'pro',
      name: 'PROFESSIONAL',
      price: 99,
      description: 'For teams building intelligence at scale',
      features: [
        '50,000 operations/month',
        'Unlimited workflows',
        'All integrations',
        'Priority support',
        '90-day execution history',
        'Advanced analytics',
        'Team collaboration',
        'Custom webhooks',
        'API access'
      ],
      popular: true,
    },
    {
      id: 'enterprise',
      name: 'ENTERPRISE',
      price: 499,
      description: 'For organizations with mission-critical needs',
      features: [
        'Unlimited operations',
        'Unlimited everything',
        'Custom integrations',
        'Dedicated support',
        'Unlimited history',
        'SSO & SAML',
        'SLA guarantee',
        'On-premise option',
        'Custom contracts'
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gray-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gray-100 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
            <span className="text-2xl font-semibold tracking-wide text-gray-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>SPECTR SYSTEM</span>
          </div>

          <div className="text-sm tracking-widest text-gray-600 mb-6">CHOOSE YOUR PLAN</div>
          <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-8 text-gray-900">
            Select your plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
            Choose the plan that fits your needs. You can upgrade or downgrade at any time.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-7xl mx-auto">
          {/* Top Row: Free, Standard, Professional */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {plans.filter(plan => plan.id !== 'enterprise').map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={clsx(
                  'relative p-8 border transition-all cursor-pointer bg-white',
                  plan.popular
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-gray-200 hover:border-gray-300',
                  selectedPlan === plan.id && 'border-gray-900 bg-gray-50'
                )}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gray-900 text-white text-xs font-medium">
                    MOST POPULAR
                  </div>
                )}

                {/* Header */}
                <div className="mb-8">
                  <div className="text-xs tracking-widest text-gray-500 mb-4">{plan.name}</div>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-light text-gray-900">
                      ${plan.price}
                    </span>
                    {plan.price > 0 && <span className="text-gray-600">/month</span>}
                  </div>
                  
                  <p className="text-sm text-gray-600">{plan.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPlan(plan.id);
                  }}
                  disabled={isLoading}
                  className={clsx(
                    'w-full py-4 text-center text-sm font-medium transition-all',
                    plan.popular || selectedPlan === plan.id
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'border border-gray-300 text-gray-900 hover:border-gray-900',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isLoading && selectedPlan === plan.id ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : plan.price === 0 ? (
                    'Start Free'
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Select Plan
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  )}
                </button>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row: Enterprise (Full Width) */}
          {plans.filter(plan => plan.id === 'enterprise').map((plan) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className={clsx(
                'relative p-8 border transition-all cursor-pointer bg-white',
                'border-gray-200 hover:border-gray-300',
                selectedPlan === plan.id && 'border-gray-900 bg-gray-50'
              )}
              onClick={() => setSelectedPlan(plan.id)}
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Header and Description */}
                <div>
                  <div className="text-xs tracking-widest text-gray-500 mb-4">{plan.name}</div>
                  <p className="text-lg text-gray-600 mb-8">{plan.description}</p>
                  
                  <Link
                    to="/contact-sales"
                    onClick={(e) => e.stopPropagation()}
                    className="px-8 py-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                  >
                    Contact Sales
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>

                {/* Right: Features */}
                <div className="space-y-4">
                  <div className="text-xs tracking-widest text-gray-500 mb-4">INCLUDES</div>
                  <div className="grid grid-cols-2 gap-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SelectPlanPage;

