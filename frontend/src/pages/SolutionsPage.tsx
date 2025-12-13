/**
 * SPECTR SYSTEM Solutions Page
 * Sector-specific solutions page with Palantir-inspired design
 */

import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Menu, X, Check } from 'lucide-react';
import clsx from 'clsx';
import ScrollProgress from '../components/ScrollProgress';

interface SolutionContent {
  title: string;
  subtitle: string;
  description: string;
  keyFeatures: string[];
  useCases: string[];
  benefits: string[];
}

const SolutionsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Scroll to top when component mounts or slug changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const solutions: Record<string, SolutionContent> = {
    'defense-intelligence': {
      title: 'Defense & Intelligence',
      subtitle: 'Mission-Critical Operations',
      description: 'SPECTR SYSTEM enables defense and intelligence organizations to make sense of vast amounts of information, transforming data into actionable intelligence for mission-critical operations.',
      keyFeatures: [
        'Real-time data fusion and analysis',
        'Multi-source intelligence integration',
        'Threat detection and response automation',
        'Secure, compliant infrastructure',
        'Advanced pattern recognition',
      ],
      useCases: [
        'Operational intelligence gathering',
        'Threat assessment and monitoring',
        'Mission planning and execution',
        'Resource allocation optimization',
        'Cross-agency collaboration',
      ],
      benefits: [
        'Faster decision-making with real-time insights',
        'Enhanced situational awareness',
        'Reduced manual processing time',
        'Improved operational efficiency',
        'Scalable to handle massive data volumes',
      ],
    },
    'financial-services': {
      title: 'Financial Services',
      subtitle: 'Risk Management & Compliance',
      description: 'Transform how financial institutions detect fraud, manage risk, and ensure regulatory compliance at scale with SPECTR SYSTEM\'s powerful automation platform.',
      keyFeatures: [
        'Fraud detection and prevention',
        'Regulatory compliance automation',
        'Risk assessment and monitoring',
        'Transaction processing automation',
        'Real-time alerting systems',
      ],
      useCases: [
        'Anti-money laundering (AML) compliance',
        'Credit risk assessment',
        'Market analysis and trading automation',
        'Customer onboarding workflows',
        'Regulatory reporting automation',
      ],
      benefits: [
        'Reduced false positives in fraud detection',
        'Faster compliance reporting',
        'Lower operational costs',
        'Enhanced customer experience',
        'Real-time risk monitoring',
      ],
    },
    'healthcare': {
      title: 'Healthcare',
      subtitle: 'Patient Outcomes & Efficiency',
      description: 'Improve patient outcomes through integrated data and predictive analytics. SPECTR SYSTEM helps healthcare organizations automate processes and make data-driven decisions.',
      keyFeatures: [
        'Patient data integration',
        'Predictive analytics for outcomes',
        'Workflow automation',
        'Compliance and HIPAA adherence',
        'Resource optimization',
      ],
      useCases: [
        'Patient care coordination',
        'Appointment scheduling automation',
        'Medical record management',
        'Supply chain optimization',
        'Billing and claims processing',
      ],
      benefits: [
        'Improved patient outcomes',
        'Reduced administrative burden',
        'Better resource utilization',
        'Enhanced data security',
        'Faster decision-making',
      ],
    },
    'supply-chain-distribution': {
      title: 'Supply Chain & Distribution',
      subtitle: 'End-to-End Optimization',
      description: 'Optimize procurement, manage vendor relationships, automate inventory forecasting, and streamline warehouse operations with SPECTR SYSTEM\'s comprehensive automation platform.',
      keyFeatures: [
        'Inventory management automation',
        'Vendor relationship management',
        'Demand forecasting',
        'Warehouse operations optimization',
        'Logistics coordination',
      ],
      useCases: [
        'Automated procurement processes',
        'Real-time inventory tracking',
        'Supplier performance monitoring',
        'Order fulfillment automation',
        'Distribution route optimization',
      ],
      benefits: [
        'Reduced inventory costs',
        'Improved supplier relationships',
        'Faster order fulfillment',
        'Better demand forecasting',
        'Enhanced visibility across supply chain',
      ],
    },
  };

  const solution = solutions[slug || ''];

  if (!solution) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl mb-4">Solution Not Found</h1>
          <Link to="/" className="text-white/60 hover:text-white">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollProgress />
      {/* Navigation */}
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all',
          scrolled ? 'bg-black/80 backdrop-blur-sm border-b border-white/10' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <img src="/EyelogoWhite.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span>SPECTR SYSTEM</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm text-white/70 hover:text-white transition-colors">
                Home
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-sm">
            <div className="px-6 py-4 space-y-4">
              <Link to="/" className="block text-sm text-white/70 hover:text-white">
                Home
              </Link>
              <Link
                to="/signup"
                className="block px-6 py-2.5 bg-white text-black text-sm font-medium text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-white/60 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="text-sm tracking-widest text-white/60 mb-4">{solution.subtitle}</div>
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-6 leading-[1.1]">
              {solution.title}
            </h1>
            <p className="text-xl lg:text-2xl text-white/80 max-w-4xl leading-relaxed mb-12">
              {solution.description}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Key Features */}
      <section className="relative py-16 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-12">
              Key Capabilities
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {solution.keyFeatures.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border border-white/10 p-6 hover:border-white/20 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-white mt-0.5 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-16 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-12">
              Common Use Cases
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {solution.useCases.map((useCase, index) => (
                <motion.div
                  key={useCase}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-1.5 h-1.5 bg-white mt-2 flex-shrink-0" />
                  <span className="text-lg text-white/80">{useCase}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Benefits */}
      <section className="relative py-16 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-12">
              Benefits
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {solution.benefits.map((benefit, index) => (
                <motion.div
                  key={benefit}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="border-l-2 border-white/20 pl-6 py-2"
                >
                  <span className="text-white/80">{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Universal Capabilities */}
      <section className="relative py-16 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-6">
              Beyond {solution.title}
            </h2>
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              SPECTR SYSTEM is not limited to any single industry or sector. Our automation platform 
              can help organizations across <span className="font-medium text-white">any product sector or service</span>—from 
              supply chain and distribution to manufacturing, retail, energy, and beyond.
            </p>
            <p className="text-lg text-white/60 leading-relaxed mb-8">
              Whether you're managing complex supply chains, optimizing distribution networks, 
              automating customer service, or streamlining any business process, SPECTR SYSTEM 
              provides the tools to command, automate, and respond at global scale.
            </p>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact-sales"
                className="px-8 py-4 border border-white/20 text-white text-sm font-medium hover:border-white/40 transition-colors"
              >
                Contact Sales
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <span>SPECTR SYSTEM</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-white/60">
              <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
              <a href="#" className="hover:text-white transition-colors">Security</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-white/40">
            © {new Date().getFullYear()} SPECTR SYSTEM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SolutionsPage;

