/**
 * SPECTR SYSTEM Landing Page
 * Palantir-inspired design
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Menu, X, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const LandingPage: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all',
          scrolled ? 'bg-black/80 backdrop-blur-sm border-b border-white/10' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <img src="/EyelogoWhite.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span>SPECTR SYSTEM</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {/* Products Dropdown */}
              <div
                className="relative"
                onMouseEnter={() => setProductsDropdownOpen(true)}
                onMouseLeave={() => setProductsDropdownOpen(false)}
              >
                <button className="text-sm text-white/70 hover:text-white transition-colors flex items-center gap-1">
                  Products
                  <ChevronDown className={clsx('w-4 h-4 transition-transform duration-200', productsDropdownOpen && 'rotate-180')} />
                </button>
                
                {/* Dropdown Menu */}
                {productsDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 mt-2 w-56 bg-black/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-xl overflow-hidden"
                  >
                    <div className="py-2">
                      <div className="px-4 py-3 text-sm text-white/40 hover:bg-white/5 transition-colors cursor-not-allowed flex items-center justify-between">
                        <span>Torpedo</span>
                        <span className="text-xs text-white/30">Coming Soon</span>
                      </div>
                      <div className="px-4 py-3 text-sm text-white/40 hover:bg-white/5 transition-colors cursor-not-allowed flex items-center justify-between">
                        <span>Archer</span>
                        <span className="text-xs text-white/30">Coming Soon</span>
                      </div>
                      <div className="px-4 py-3 text-sm text-white/40 hover:bg-white/5 transition-colors cursor-not-allowed flex items-center justify-between">
                        <span>Jammer</span>
                        <span className="text-xs text-white/30">Coming Soon</span>
                      </div>
                      <div className="px-4 py-3 text-sm text-white/40 hover:bg-white/5 transition-colors cursor-not-allowed flex items-center justify-between">
                        <span>Robo</span>
                        <span className="text-xs text-white/30">Coming Soon</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              
              <a href="#solutions" className="text-sm text-white/70 hover:text-white transition-colors">
                Solutions
              </a>
              <a href="#platform" className="text-sm text-white/70 hover:text-white transition-colors">
                Platform
              </a>
              <a href="#resources" className="text-sm text-white/70 hover:text-white transition-colors">
                Resources
              </a>
              <Link
                to="/pricing"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/signin"
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-black/95 backdrop-blur-sm">
            <div className="px-6 py-4 space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-white/70 font-medium mb-2">Products</div>
                <Link to="/products/system" className="block pl-4 text-sm text-white/60 hover:text-white">
                  System
                </Link>
                <div className="block pl-4 text-sm text-white/40 flex items-center justify-between">
                  <span>Torpedo</span>
                  <span className="text-xs text-white/30">Coming Soon</span>
                </div>
                <div className="block pl-4 text-sm text-white/40 flex items-center justify-between">
                  <span>Archer</span>
                  <span className="text-xs text-white/30">Coming Soon</span>
                </div>
                <div className="block pl-4 text-sm text-white/40 flex items-center justify-between">
                  <span>Jammer</span>
                  <span className="text-xs text-white/30">Coming Soon</span>
                </div>
                <div className="block pl-4 text-sm text-white/40 flex items-center justify-between">
                  <span>Robo</span>
                  <span className="text-xs text-white/30">Coming Soon</span>
                </div>
              </div>
              <a href="#solutions" className="block text-sm text-white/70 hover:text-white">
                Solutions
              </a>
              <a href="#platform" className="block text-sm text-white/70 hover:text-white">
                Platform
              </a>
              <a href="#resources" className="block text-sm text-white/70 hover:text-white">
                Resources
              </a>
              <Link to="/pricing" className="block text-sm text-white/70 hover:text-white">
                Pricing
              </Link>
              <Link to="/signin" className="block text-sm text-white/70 hover:text-white">
                Sign In
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
      <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-sm tracking-widest text-white/80 mb-6">INTELLIGENCE PLATFORM</div>
              <h1 className="text-6xl lg:text-8xl font-light tracking-tight mb-8 leading-[1.1] text-white">
                Automation With <span style={{ fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace', fontWeight: 400 }}>Spectr</span>
              </h1>
              <p className="text-xl lg:text-2xl text-white/80 mb-12 max-w-3xl leading-relaxed">
                Command. Automate. Respond. At <span className="font-bold">global scale</span>.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#platform"
                  className="px-8 py-4 border border-white/40 text-white text-sm font-medium hover:border-white/60 hover:bg-white/10 transition-colors inline-flex items-center gap-2"
                >
                  Learn More
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </motion.div>

            {/* Right Column - Montage/Video Space */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full flex items-center justify-center"
            >
              <div className="relative w-full max-w-[650px] aspect-video">
                {/* Border with glow effect */}
                <div className="absolute inset-0 rounded-lg border-2 border-white/20 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm">
                  {/* Corner accents */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-lg" />
                  
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 blur-sm" />
                </div>
                
                {/* Video container */}
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-black/20">
                  <video
                    className="w-full h-full object-cover"
                    autoPlay
                    loop
                    muted
                    playsInline
                  >
                    {/* Video source will be added here */}
                    <source src="" type="video/mp4" />
                  </video>
                  
                  {/* Placeholder if no video */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="text-white/40 text-sm">Video content</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="relative py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="text-sm tracking-widest text-white/60 mb-4">SOLUTIONS</div>
            <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
              Built for the world's most important institutions
            </h2>
            <p className="text-lg text-white/60 max-w-2xl mx-auto">
              Organizations across industries rely on SPECTR SYSTEM to make critical decisions
            </p>
          </motion.div>

          {/* Solutions Carousel */}
          <div className="relative">
            <div className="relative overflow-hidden">
              <motion.div
                className="flex"
                animate={{
                  x: `-${currentSlide * 100}%`,
                }}
                transition={{
                  duration: 0.5,
                  ease: 'easeInOut',
                }}
              >
                {[
                  {
                    title: 'Defense & Intelligence',
                    description: 'Enable mission-critical operations with real-time data fusion and analysis.',
                    slug: 'defense-intelligence',
                  },
                  {
                    title: 'Financial Services',
                    description: 'Detect fraud, manage risk, and ensure regulatory compliance at scale.',
                    slug: 'financial-services',
                  },
                  {
                    title: 'Healthcare',
                    description: 'Improve patient outcomes through integrated data and predictive analytics.',
                    slug: 'healthcare',
                  },
                  {
                    title: 'Supply Chain & Distribution',
                    description: 'Optimize procurement, manage vendor relationships, automate inventory forecasting, and streamline warehouse operations.',
                    slug: 'supply-chain-distribution',
                  },
                ].map((solution, index) => (
                  <div
                    key={solution.title}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="max-w-5xl mx-auto border border-white/10 p-6 lg:p-8 hover:border-white/20 transition-colors">
                      <h3 className="text-2xl lg:text-3xl font-medium mb-4">{solution.title}</h3>
                      <p className="text-base lg:text-lg text-white/60 leading-relaxed mb-6">{solution.description}</p>
                      
                      {/* Video Container */}
                      <div className="relative w-full aspect-[21/9] bg-black/20 rounded-lg overflow-hidden border border-white/10 mb-6">
                        <video
                          className="w-full h-full object-cover"
                          autoPlay
                          loop
                          muted
                          playsInline
                        >
                          {/* Video source will be added here */}
                          <source src="" type="video/mp4" />
                        </video>
                        
                        {/* Placeholder if no video */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="text-white/40 text-sm">Video content</div>
                        </div>
                      </div>
                      
                      {/* Learn More Link */}
                      <Link
                        to={`/solutions/${solution.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white transition-colors border-b border-white/20 hover:border-white/40 pb-1"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                onClick={() => setCurrentSlide((prev) => (prev === 0 ? 3 : prev - 1))}
                className="p-3 border border-white/20 hover:border-white/40 hover:bg-white/10 transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Dot Indicators */}
              <div className="flex items-center gap-2 mx-8">
                {[0, 1, 2, 3].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={clsx(
                      'w-2 h-2 rounded-full transition-all',
                      currentSlide === index
                        ? 'bg-white w-8'
                        : 'bg-white/30 hover:bg-white/50'
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => (prev === 3 ? 0 : prev + 1))}
                className="p-3 border border-white/20 hover:border-white/40 hover:bg-white/10 transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="relative py-32 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-sm tracking-widest text-white/60 mb-4">PLATFORM</div>
              <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
                One platform, infinite possibilities
              </h2>
              <p className="text-lg text-white/60 mb-8 leading-relaxed">
                SPECTR SYSTEM provides a unified environment where data, models, and applications 
                work together seamlessly. Build, deploy, and scale intelligence applications 
                that transform how your organization operates.
              </p>
              <div className="space-y-6">
                {[
                  'Connect to any data source',
                  'Build custom applications',
                  'Deploy at enterprise scale',
                  'Ensure security and compliance',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-white mt-2 flex-shrink-0" />
                    <span className="text-white/80">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative h-[500px] bg-white/5 border border-white/10"
            >
              {/* Placeholder for platform visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white/40 text-sm">Platform Visualization</div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="relative py-32 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <div className="text-sm tracking-widest text-white/60 mb-4">RESOURCES</div>
            <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
              Learn how organizations use SPECTR SYSTEM
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                category: 'Case Study',
                title: 'Transforming Defense Operations',
                description: 'How a leading defense organization uses SPECTR SYSTEM for real-time intelligence.',
              },
              {
                category: 'White Paper',
                title: 'The Future of Data Platforms',
                description: 'Exploring the next generation of enterprise data infrastructure.',
              },
              {
                category: 'Webinar',
                title: 'Getting Started with SPECTR SYSTEM',
                description: 'Learn the fundamentals of building intelligence applications.',
              },
            ].map((resource, index) => (
              <motion.a
                key={resource.title}
                href="#"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="block border border-white/10 p-8 hover:border-white/20 transition-colors group"
              >
                <div className="text-xs tracking-widest text-white/40 mb-3">{resource.category}</div>
                <h3 className="text-xl font-medium mb-4 group-hover:text-white transition-colors">
                  {resource.title}
                </h3>
                <p className="text-white/60 leading-relaxed">{resource.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm text-white/60 group-hover:text-white transition-colors">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 lg:px-8 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6">
              Ready to get started?
            </h2>
            <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto">
              Join organizations around the world using SPECTR SYSTEM to transform their operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 border border-white/20 text-white text-sm font-medium hover:border-white/40 transition-colors"
              >
                View Pricing
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

export default LandingPage;
