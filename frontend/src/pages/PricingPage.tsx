/**
 * SPECTR SYSTEM Pricing Page
 * Palantir-inspired design
 */

import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check } from 'lucide-react';
import clsx from 'clsx';

const PricingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('yearly');
  const monthlyRef = useRef<HTMLButtonElement>(null);
  const annuallyRef = useRef<HTMLButtonElement>(null);
  const [boxWidth, setBoxWidth] = useState(0);
  const [boxLeft, setBoxLeft] = useState(0);

  useEffect(() => {
    const updateBoxPosition = () => {
      if (monthlyRef.current && annuallyRef.current) {
        const monthlyButton = monthlyRef.current;
        const annuallyButton = annuallyRef.current;
        const gap = 32; // gap-8 = 2rem = 32px
        
        if (billingPeriod === 'monthly') {
          setBoxWidth(monthlyButton.offsetWidth);
          setBoxLeft(0);
        } else {
          setBoxWidth(annuallyButton.offsetWidth);
          setBoxLeft(monthlyButton.offsetWidth + gap);
        }
      }
    };

    updateBoxPosition();
    window.addEventListener('resize', updateBoxPosition);
    return () => window.removeEventListener('resize', updateBoxPosition);
  }, [billingPeriod]);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm border-b border-white/10">
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
            <Link
              to="/signup"
              className="px-6 py-2.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-sm tracking-widest text-white/60 mb-6">PRICING</div>
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-8">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-white/60 max-w-2xl mx-auto mb-12">
              Choose the plan that fits your organization. All plans include core features 
              with the flexibility to scale as you grow.
            </p>

            {/* Billing Toggle */}
            <div className="relative inline-flex items-center gap-8 p-1">
              {/* Animated background box */}
              {boxWidth > 0 && (
                <motion.div
                  className="absolute top-0 bottom-0 bg-white rounded-lg"
                  initial={false}
                  animate={{
                    left: `${boxLeft}px`,
                    width: `${boxWidth}px`,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                  }}
                />
              )}
              
              {/* Buttons */}
              <button
                ref={monthlyRef}
                onClick={() => setBillingPeriod('monthly')}
                className={clsx(
                  'relative px-6 py-2.5 text-sm font-medium transition-colors z-10',
                  billingPeriod === 'monthly' ? 'text-black' : 'text-white/60 hover:text-white'
                )}
              >
                Monthly
              </button>
              <button
                ref={annuallyRef}
                onClick={() => setBillingPeriod('yearly')}
                className={clsx(
                  'relative px-6 py-2.5 text-sm font-medium transition-colors z-10',
                  billingPeriod === 'yearly' ? 'text-black' : 'text-white/60 hover:text-white'
                )}
              >
                Annually
                <span className={clsx(
                  'ml-2 px-2 py-0.5 text-xs rounded transition-colors',
                  billingPeriod === 'yearly' 
                    ? 'bg-black/20 text-black' 
                    : 'bg-white/20 text-white'
                )}>
                  Save 20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="relative pb-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Top Row: Free, Standard, Professional */}
          <div className="grid lg:grid-cols-3 gap-8 mb-8">
            {pricingTiers.filter(tier => tier.name !== 'ENTERPRISE').map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={clsx(
                  'relative p-8 border transition-all',
                  tier.featured
                    ? 'border-white/30 bg-white/5'
                    : 'border-white/10 hover:border-white/20'
                )}
              >
                {/* Header */}
                <div className="mb-8">
                  <div className="text-xs tracking-widest text-white/40 mb-4">{tier.name}</div>
                  
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-5xl font-light">
                      ${billingPeriod === 'yearly' ? Math.floor(tier.price * 0.8) : tier.price}
                    </span>
                    {tier.price > 0 && <span className="text-white/40">/month</span>}
                  </div>
                  
                  <p className="text-sm text-white/60">{tier.description}</p>
                </div>

                {/* CTA */}
                <Link
                  to="/signup"
                  className={clsx(
                    'block w-full py-4 text-center text-sm font-medium transition-all mb-8',
                    tier.featured
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'border border-white/20 text-white hover:border-white/40'
                  )}
                >
                  {tier.cta}
                </Link>

                {/* Features */}
                <div className="space-y-4">
                  <div className="text-xs tracking-widest text-white/30 mb-4">INCLUDES</div>
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/40" />
                      <span className="text-sm text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row: Enterprise (Full Width) */}
          {pricingTiers.filter(tier => tier.name === 'ENTERPRISE').map((tier) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative p-8 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Header and Description */}
                <div>
                  <div className="text-xs tracking-widest text-white/40 mb-4">{tier.name}</div>
                  <p className="text-lg text-white/60 mb-8">{tier.description}</p>
                  
                  <Link
                    to={tier.name === 'ENTERPRISE' ? '/contact-sales' : '/signup'}
                    className="inline-block px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
                  >
                    {tier.cta}
                  </Link>
                </div>

                {/* Right: Features */}
                <div className="space-y-4">
                  <div className="text-xs tracking-widest text-white/30 mb-4">INCLUDES</div>
                  <div className="grid grid-cols-2 gap-4">
                    {tier.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-white/40" />
                        <span className="text-sm text-white/70">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-sm tracking-widest text-white/60 mb-4">ENTERPRISE</div>
              <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-6">
                Built for scale
              </h2>
              <p className="text-lg text-white/60 mb-8">
                For organizations with complex requirements. Custom pricing, 
                dedicated support, and enterprise-grade features.
              </p>
              <div className="space-y-6 mb-10">
                {enterpriseFeatures.map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white mt-2 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium mb-1">{feature.title}</div>
                      <div className="text-xs text-white/40">{feature.description}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                to="/contact-sales"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Contact Sales
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            
            <div className="hidden lg:block">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: '99.99%', label: 'Uptime SLA' },
                  { value: '24/7', label: 'Support' },
                  { value: 'SOC 2', label: 'Certified' },
                  { value: '<1hr', label: 'Response' },
                ].map((stat) => (
                  <div key={stat.label} className="p-6 border border-white/10">
                    <div className="text-3xl font-light mb-2">{stat.value}</div>
                    <div className="text-xs text-white/40 tracking-wide">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-white/60">
              Everything you need to know about our pricing
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-light tracking-tight mb-6">
            Ready to get started?
          </h2>
          <p className="text-lg text-white/60 mb-10">
            Start with our free plan and upgrade when you need more power.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-black font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
            >
              Start Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact-sales"
              className="px-8 py-4 border border-white/20 text-white hover:border-white/40 transition-colors"
            >
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} SPECTR SYSTEM. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-white/40">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

// FAQ Item Component
const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/10">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-white/[0.02] transition-colors"
      >
        <span className="font-medium pr-4">{question}</span>
        <span className={clsx(
          'text-xl text-white/40 transition-transform',
          isOpen && 'rotate-45'
        )}>+</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-white/60 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

// Data
const pricingTiers = [
  {
    name: 'STARTER',
    price: 0,
    description: 'For individuals exploring intelligence platforms',
    cta: 'Start Free',
    featured: false,
    features: [
      '1,000 operations/month',
      '5 active workflows',
      'Core integrations',
      'Community support',
      '7-day execution history',
      'Basic analytics'
    ]
  },
  {
    name: 'STANDARD',
    price: 29,
    description: 'For growing teams and small businesses',
    cta: 'Start 14-Day Trial',
    featured: false,
    features: [
      '10,000 operations/month',
      '20 active workflows',
      'All core integrations',
      'Email support',
      '30-day execution history',
      'Standard analytics',
      'Basic team collaboration',
      'API access'
    ]
  },
  {
    name: 'PROFESSIONAL',
    price: 99,
    description: 'For teams building intelligence at scale',
    cta: 'Start 14-Day Trial',
    featured: true,
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
    ]
  },
  {
    name: 'ENTERPRISE',
    price: 499,
    description: 'For organizations with mission-critical needs',
    cta: 'Contact Sales',
    featured: false,
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
    ]
  }
];

const enterpriseFeatures = [
  {
    title: 'Enterprise Security',
    description: 'SOC 2, HIPAA, GDPR compliant'
  },
  {
    title: '99.99% Uptime SLA',
    description: 'Guaranteed availability'
  },
  {
    title: 'Dedicated Support',
    description: '24/7 priority assistance'
  },
  {
    title: 'On-Premise Option',
    description: 'Deploy in your infrastructure'
  },
  {
    title: 'Global Deployment',
    description: 'Multi-region availability'
  },
  {
    title: 'Custom Security',
    description: 'VPC, SSO, audit logs'
  }
];

const faqs = [
  {
    question: 'What counts as an operation?',
    answer: 'An operation is counted each time a workflow runs from start to finish. If a workflow has 10 nodes, it still counts as 1 operation. Failed operations are also counted.'
  },
  {
    question: 'Can I upgrade or downgrade at any time?',
    answer: 'Yes, you can change your plan at any time. When upgrading, you\'ll be charged the prorated difference. When downgrading, the new rate applies at your next billing cycle.'
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes, the Professional plan includes a 14-day free trial with full access to all features. No credit card required to start.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express), as well as ACH bank transfers for annual Enterprise plans.'
  },
  {
    question: 'Do you offer discounts for startups or non-profits?',
    answer: 'Yes, we offer special pricing for qualified startups, educational institutions, and non-profit organizations. Contact our sales team for details.'
  },
  {
    question: 'What happens if I exceed my operation limit?',
    answer: 'We\'ll notify you when you reach 80% of your limit. If you exceed it, your workflows will continue to run, and we\'ll work with you to find the right plan.'
  }
];

export default PricingPage;
