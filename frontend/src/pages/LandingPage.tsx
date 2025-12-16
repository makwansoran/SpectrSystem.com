/**
 * SPECTR SYSTEM Landing Page
 * Palantir-inspired design
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight,
  Zap,
  Globe,
  Brain,
  Search,
  Database,
  GitBranch,
  Play,
  BarChart3,
  Webhook,
  FileText
} from 'lucide-react';
import clsx from 'clsx';
import { useUserStore } from '../stores/userStore';

// Slideshow Component
// Helper function to calculate equal spacing for nodes
const calculateNodePositions = (count: number): number[] => {
  const start = 15; // Start position (15% from left)
  const end = 85; // End position (85% from left)
  const totalWidth = end - start;
  const spacing = totalWidth / (count - 1);
  
  return Array.from({ length: count }, (_, i) => start + (spacing * i));
};

const slides = [
  {
    title: "Competitive Intelligence Monitor",
    description: "Automatically track competitor pricing, product launches, and marketing changes across the web with real-time monitoring and AI-powered analysis. Web scraping requires ongoing maintenance as sites change, and legal considerations apply. Best for tracking public data rather than deep competitive intelligence.",
    nodes: [
      { id: 1, label: "Web Scraper", type: "scraper" },
      { id: 2, label: "AI Analysis", type: "ai" },
      { id: 3, label: "Data Store", type: "database" },
      { id: 4, label: "Dashboard", type: "dashboard" }
    ]
  },
  {
    title: "Automated Due Diligence Workflow",
    description: "Complete OSINT research pipeline with sanctions checks, corporate registry lookups, and social footprint analysis for automated risk assessment. Excellent fit with reliable data sources and a core use case for intelligence nodes. Effectiveness depends on data quality and freshness.",
    nodes: [
      { id: 1, label: "Entity Input", type: "trigger" },
      { id: 2, label: "Sanctions Check", type: "intelligence" },
      { id: 3, label: "Registry Lookup", type: "intelligence" },
      { id: 4, label: "Social Analysis", type: "intelligence" },
      { id: 5, label: "Risk Score", type: "decision" }
    ]
  },
  {
    title: "Dynamic Pricing Engine",
    description: "Automatically adjust prices based on real-time market data, inventory levels, and competitor pricing using AI-powered optimization. Works well with reliable data feeds but requires careful safeguards to prevent revenue loss from bad data or flawed logic.",
    nodes: [
      { id: 1, label: "Market Data", type: "database" },
      { id: 2, label: "Competitor Prices", type: "scraper" },
      { id: 3, label: "AI Pricing Logic", type: "ai" },
      { id: 4, label: "Update Prices", type: "action" }
    ]
  },
  {
    title: "Automated Customer Onboarding",
    description: "Streamlined onboarding workflow where entity signup triggers automated verification, risk scoring, and approval or rejection decisions. Strong use case matching the platform's trigger and decision nodes, though human oversight is still needed for edge cases and exceptions.",
    nodes: [
      { id: 1, label: "Signup Trigger", type: "trigger" },
      { id: 2, label: "Verification", type: "action" },
      { id: 3, label: "Risk Scoring", type: "ai" },
      { id: 4, label: "Decision Gate", type: "decision" },
      { id: 5, label: "Approve/Reject", type: "action" }
    ]
  },
  {
    title: "Supply Chain Anomaly Detection",
    description: "Monitor shipping data in real-time to detect delays and flag unusual patterns with automated alerts for supply chain disruptions. Effective with reliable APIs, though may produce false positives without proper training data. Best used for alerts rather than full automation.",
    nodes: [
      { id: 1, label: "Shipping API", type: "database" },
      { id: 2, label: "Pattern Analysis", type: "ai" },
      { id: 3, label: "Anomaly Detection", type: "decision" },
      { id: 4, label: "Alert System", type: "action" }
    ]
  },
  {
    title: "Content Aggregation & Summarization",
    description: "Collect content from news feeds and RSS sources, then automatically summarize and categorize using AI with results displayed in dashboards. AI summarization works excellently, though web scraping can be fragile. More reliable when using RSS feeds or official APIs.",
    nodes: [
      { id: 1, label: "RSS/API Feed", type: "scraper" },
      { id: 2, label: "AI Summarize", type: "ai" },
      { id: 3, label: "Categorize", type: "ai" },
      { id: 4, label: "Dashboard", type: "dashboard" }
    ]
  },
  {
    title: "Automated Compliance Reporting",
    description: "Pull data from multiple sources, merge and format automatically, then generate compliance reports in a streamlined workflow. Strong use case when data sources are stable, though manual review is still recommended for accuracy. Provides significant time savings but isn't fully automated.",
    nodes: [
      { id: 1, label: "Data Sources", type: "database" },
      { id: 2, label: "Data Merge", type: "action" },
      { id: 3, label: "Format Report", type: "ai" },
      { id: 4, label: "Generate PDF", type: "action" }
    ]
  },
  {
    title: "Lead Qualification & Enrichment",
    description: "Automatically enrich incoming leads with company data, score them using AI, and route qualified leads to the sales team. Enrichment APIs are reliable and effective, though scoring logic requires tuning for best results. Clear ROI and time savings.",
    nodes: [
      { id: 1, label: "Lead Input", type: "trigger" },
      { id: 2, label: "Data Enrichment", type: "intelligence" },
      { id: 3, label: "Lead Scoring", type: "ai" },
      { id: 4, label: "Route to Sales", type: "action" }
    ]
  },
  {
    title: "Market Research Automation",
    description: "Track social media sentiment, news mentions, and market trends automatically to generate insights and detect emerging patterns. Sentiment analysis can be noisy and imperfect, so it's best used for identifying trends rather than making precise predictions.",
    nodes: [
      { id: 1, label: "Social Media", type: "scraper" },
      { id: 2, label: "News Feeds", type: "scraper" },
      { id: 3, label: "Sentiment Analysis", type: "ai" },
      { id: 4, label: "Trend Detection", type: "ai" },
      { id: 5, label: "Insights Dashboard", type: "dashboard" }
    ]
  },
  {
    title: "Automated Document Processing",
    description: "Receive documents, extract data using OCR and AI, validate the information, and automatically store in your database. Works best with structured documents, while PDFs and images are more challenging. OCR combined with AI extraction improves accuracy but isn't perfect.",
    nodes: [
      { id: 1, label: "Document Input", type: "trigger" },
      { id: 2, label: "OCR/Extract", type: "ai" },
      { id: 3, label: "Validate Data", type: "decision" },
      { id: 4, label: "Store in DB", type: "database" }
    ]
  }
].map(slide => ({
  ...slide,
  nodes: slide.nodes.map((node, index) => ({
    ...node,
    x: calculateNodePositions(slide.nodes.length)[index]
  }))
}));

const nodeColors: Record<string, { bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  trigger: { 
    bg: "bg-gradient-to-br from-blue-50/50 to-blue-50", 
    border: "border-blue-200", 
    text: "text-blue-700",
    icon: Webhook
  },
  scraper: { 
    bg: "bg-gradient-to-br from-purple-50/50 to-purple-50", 
    border: "border-purple-200", 
    text: "text-purple-700",
    icon: Globe
  },
  ai: { 
    bg: "bg-gradient-to-br from-emerald-50/50 to-emerald-50", 
    border: "border-emerald-200", 
    text: "text-emerald-700",
    icon: Brain
  },
  intelligence: { 
    bg: "bg-gradient-to-br from-amber-50/50 to-amber-50", 
    border: "border-amber-200", 
    text: "text-amber-700",
    icon: Search
  },
  database: { 
    bg: "bg-gradient-to-br from-slate-50/50 to-slate-50", 
    border: "border-slate-200", 
    text: "text-slate-700",
    icon: Database
  },
  decision: { 
    bg: "bg-gradient-to-br from-orange-50/50 to-orange-50", 
    border: "border-orange-200", 
    text: "text-orange-700",
    icon: GitBranch
  },
  action: { 
    bg: "bg-gradient-to-br from-red-50/50 to-red-50", 
    border: "border-red-200", 
    text: "text-red-700",
    icon: Play
  },
  dashboard: { 
    bg: "bg-gradient-to-br from-indigo-50/50 to-indigo-50", 
    border: "border-indigo-200", 
    text: "text-indigo-700",
    icon: BarChart3
  }
};

const SlideshowComponent: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const totalSlides = slides.length;

  useEffect(() => {
    if (!isAutoPlaying) return;
    
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
    setIsAutoPlaying(false);
  };

  const currentSlideData = slides[currentSlide];

  return null;
};

// Resources Carousel Component
const ResourcesCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const resources = [
    {
      category: 'Research',
      title: 'Advanced Intelligence Research',
      description: 'Deep dive into cutting-edge research methodologies and intelligence gathering techniques.',
    },
    {
      category: 'Investments',
      title: 'Investment Analysis & Strategy',
      description: 'Comprehensive investment research and market analysis using advanced data platforms.',
    },
    {
      category: 'Finance',
      title: 'Financial Intelligence Systems',
      description: 'Real-time financial data analysis and risk assessment for enterprise operations.',
    },
    {
      category: 'News',
      title: 'News & Media Intelligence',
      description: 'Automated news aggregation and analysis for staying ahead of market trends.',
    },
    {
      category: 'Blog',
      title: 'Industry Insights & Updates',
      description: 'Latest insights, tutorials, and updates from the SPECTR SYSTEM platform.',
    },
  ];

  const itemsPerSlide = 3;
  const totalSlides = Math.ceil(resources.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const currentResources = resources.slice(
    currentIndex * itemsPerSlide,
    currentIndex * itemsPerSlide + itemsPerSlide
  );

  return (
    <div className="relative">
      <div className="relative overflow-hidden">
        <div className="grid md:grid-cols-3 gap-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            {currentResources.map((resource, index) => (
              <motion.a
                key={`${resource.title}-${currentIndex}`}
                href="#"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut"
                }}
                className="block border border-gray-200 p-8 hover:border-gray-300 hover:shadow-sm transition-all group h-full flex flex-col"
              >
                <div className="text-xs tracking-widest text-gray-500 mb-3">{resource.category}</div>
                <h3 className="text-xl font-medium mb-4 text-gray-900 group-hover:text-gray-700 transition-colors">
                  {resource.title}
                </h3>
                <p className="text-gray-600 leading-relaxed flex-grow">{resource.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                  Read More
                  <ArrowRight className="w-4 h-4" />
                </div>
              </motion.a>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col items-center gap-4 mt-8">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={prevSlide}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <span className="text-sm text-gray-500 font-mono">
            {currentIndex + 1} / {totalSlides}
          </span>
          <button
            onClick={nextSlide}
            className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:border-gray-300 hover:bg-gray-50 transition-all"
            aria-label="Next slide"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
        <a
          href="#"
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          Research Area
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [productsDropdownOpen, setProductsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Canvas animation effect
  useEffect(() => {
    const canvas = document.getElementById('hero-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;
    const pixels: Array<{x: number; y: number; z: number}> = [];

    // Initialize pixels
    for (let x = -400; x < 400; x += 5) {
      for (let z = -250; z < 250; z += 5) {
        pixels.push({x: x, y: 100, z: z});
      }
    }

    function render(ts: number) {
      // Clear canvas (transparent background)
      ctx.clearRect(0, 0, W, H);
      
      const imageData = ctx.createImageData(W, H);
      const len = pixels.length;
      const fov = 250;

      for (let i = 0; i < len; i++) {
        const pixel = pixels[i];
        const scale = fov / (fov + pixel.z);
        const x2d = pixel.x * scale + W / 2;
        const y2d = pixel.y * scale + H / 2;
        
        if (x2d >= 0 && x2d <= W && y2d >= 0 && y2d <= H) {
          const c = (Math.round(y2d) * imageData.width + Math.round(x2d)) * 4;
          imageData.data[c] = 0;
          imageData.data[c + 1] = 255;
          imageData.data[c + 2] = 80;
          imageData.data[c + 3] = 255;
        }
        
        pixel.z -= 0.4;
        pixel.y = H / 14 + Math.sin(i / len * 15 + (ts / 450)) * 10;
        if (pixel.z < -fov) pixel.z += 2 * fov;
      }
      ctx.putImageData(imageData, 0, 0);
    }

    function drawFrame(ts: number) {
      requestAnimationFrame(drawFrame);
      render(ts);
    }

    drawFrame(0);

    // Handle window resize
    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all',
          scrolled ? 'bg-white/95 backdrop-blur-sm border-b border-gray-200' : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span className="text-gray-900">SPECTR SYSTEM</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <Link to="/solutions" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Solutions
              </Link>
              <a href="#platform" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Platform
              </a>
              <a href="#resources" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Resources
              </a>
              <Link
                to="/pricing"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </Link>
              <Link
                to="/signin"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-6 py-4 space-y-4">
              <Link to="/solutions" className="block text-sm text-gray-600 hover:text-gray-900">
                Solutions
              </Link>
              <a href="#platform" className="block text-sm text-gray-600 hover:text-gray-900">
                Platform
              </a>
              <a href="#resources" className="block text-sm text-gray-600 hover:text-gray-900">
                Resources
              </a>
              <Link to="/pricing" className="block text-sm text-gray-600 hover:text-gray-900">
                Pricing
              </Link>
              <Link to="/signin" className="block text-sm text-gray-600 hover:text-gray-900">
                Sign In
              </Link>
              <Link
                to="/signup"
                className="block px-6 py-2.5 bg-gray-900 text-white text-sm font-medium text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden min-h-[90vh] flex items-center">
        {/* Canvas Animation Background */}
        <canvas
          id="hero-canvas"
          className="absolute inset-0 w-full h-full z-0"
          style={{ display: 'block' }}
        />
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <div className="max-w-4xl mx-auto text-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-sm tracking-widest text-gray-500 mb-6">INTELLIGENCE PLATFORM</div>
              <h1 className="text-4xl lg:text-5xl font-light tracking-tight mb-8 leading-[1.1] text-gray-900">
                Decision engine for businesses operating under risk
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/signup"
                  className="px-8 py-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#platform"
                  className="px-8 py-4 border border-gray-300 text-gray-900 text-sm font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors inline-flex items-center gap-2"
                >
                  Learn More
                  <ChevronDown className="w-4 h-4" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Platform Section */}
      <section id="platform" className="relative py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-sm tracking-widest text-gray-500 mb-4">PLATFORM</div>
              <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6 text-gray-900">
                One platform, infinite possibilities
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
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
                    <div className="w-1.5 h-1.5 bg-gray-900 mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* 9 Identical Nodes with Z-pattern connections */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="grid grid-cols-3 gap-8 relative z-10">
                {Array.from({ length: 9 }).map((_, index) => {
                  // Skip nodes 3 (index 2) and 7 (index 6)
                  if (index === 2 || index === 6) {
                    return <div key={index} />; // Empty space
                  }
                  
                  const colors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#64748b', '#06b6d4', '#a855f7', '#ec4899'];
                  const nodeColor = colors[index % colors.length];
                  return (
                    <div
                      key={index}
                      className="relative min-w-[180px] rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all duration-200"
                    >
                      {/* Header */}
                      <div className="flex items-center gap-3 px-3.5 py-3">
                        {/* Icon box */}
                        <div 
                          className="flex items-center justify-center w-9 h-9 rounded-lg border"
                          style={{
                            backgroundColor: `${nodeColor}08`,
                            borderColor: `${nodeColor}20`,
                          }}
                        >
                          {index !== 0 && (
                            <span className="text-sm font-semibold" style={{ color: nodeColor }}>
                              {index + 1}
                            </span>
                          )}
                        </div>
                        {/* Label */}
                        <div className="flex-1 min-w-0">
                          {index === 0 ? (
                            <span className="text-sm font-medium text-slate-700">Data Source</span>
                          ) : (
                            <div className="h-3 bg-slate-200 rounded w-20" />
                          )}
                        </div>
                      </div>
                      {/* Connection handles */}
                      <div 
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-slate-300 rounded-full z-20"
                        id={`handle-left-${index}`}
                      />
                      <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3.5 h-3.5 bg-white border-2 border-slate-300 rounded-full z-20"
                        id={`handle-right-${index}`}
                      />
                      
                    </div>
                  );
                })}
              </div>
              
              {/* Connection lines */}
              <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 5 }}>
                {/* Connection from Node 1 to Node 2 */}
                <div 
                  className="absolute top-1/2 -translate-y-1/2" 
                  style={{ 
                    left: 'calc(33.33% - 90px + 7px)', 
                    width: 'calc(33.33% + 180px - 14px)', 
                    height: '3px', 
                    background: 'linear-gradient(to right, transparent, #3b82f680, #3b82f680, transparent)' 
                  }}
                >
                  {/* Arrow head */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-l-[10px] border-l-[#3b82f6] border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent" />
                  {/* Animated data flow particles */}
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" style={{ animation: 'move-right 2s linear infinite', animationDelay: '0s', left: '0%' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" style={{ animation: 'move-right 2s linear infinite', animationDelay: '0.7s', left: '0%' }} />
                  <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" style={{ animation: 'move-right 2s linear infinite', animationDelay: '1.4s', left: '0%' }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Integrations Section */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-4 text-gray-900">
              Integrations
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Connect with the tools and services your organization already uses
            </p>
          </motion.div>

          {/* Integration logos mapping */}
          {(() => {
            const carousel1Integrations = [
              { name: 'Stripe', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/stripe.svg', color: '#635bff' },
              { name: 'PayPal', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/paypal.svg', color: '#003087' },
              { name: 'Square', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/square.svg', color: '#3E4348' },
              { name: 'Shopify', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/shopify.svg', color: '#7AB55C' },
              { name: 'WooCommerce', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/woocommerce.svg', color: '#96588A' },
              { name: 'Salesforce', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/salesforce.svg', color: '#00A1E0' },
              { name: 'HubSpot', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/hubspot.svg', color: '#FF7A59' },
              { name: 'Slack', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/slack.svg', color: '#4A154B' },
              { name: 'Microsoft Teams', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftteams.svg', color: '#6264A7' },
              { name: 'Google Workspace', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/google.svg', color: '#4285F4' },
              { name: 'AWS', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/amazonaws.svg', color: '#232F3E' },
              { name: 'Azure', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/microsoftazure.svg', color: '#0078D4' },
              { name: 'GitHub', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/github.svg', color: '#181717' },
              { name: 'Jira', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jira.svg', color: '#0052CC' },
            ];

            const carousel2Integrations = [
              { name: 'MongoDB', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mongodb.svg', color: '#47A248' },
              { name: 'PostgreSQL', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/postgresql.svg', color: '#4169E1' },
              { name: 'MySQL', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mysql.svg', color: '#4479A1' },
              { name: 'Redis', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/redis.svg', color: '#DC382D' },
              { name: 'Elasticsearch', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/elasticsearch.svg', color: '#005571' },
              { name: 'Docker', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/docker.svg', color: '#2496ED' },
              { name: 'Kubernetes', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/kubernetes.svg', color: '#326CE5' },
              { name: 'Terraform', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/terraform.svg', color: '#7B42BC' },
              { name: 'Jenkins', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/jenkins.svg', color: '#D24939' },
              { name: 'Datadog', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/datadog.svg', color: '#632CA6' },
              { name: 'Sentry', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sentry.svg', color: '#362D59' },
              { name: 'Twilio', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/twilio.svg', color: '#F22F46' },
              { name: 'SendGrid', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/sendgrid.svg', color: '#1A82E2' },
              { name: 'Mailchimp', logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/mailchimp.svg', color: '#FFE01B' },
            ];

            const LogoCard = ({ integration, index, carousel }: { integration: typeof carousel1Integrations[0], index: number, carousel: number }) => {
              const [imgError, setImgError] = useState(false);
              const [imgLoaded, setImgLoaded] = useState(false);
              
              return (
                <div
                  key={`carousel${carousel}-${index}`}
                  className="flex-shrink-0 px-8 py-6 bg-white border border-gray-200 rounded-lg mx-3 flex items-center justify-center min-w-[180px] h-24 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  {!imgError ? (
                    <>
                      {!imgLoaded && (
                        <div className="absolute w-12 h-12 bg-gray-100 rounded animate-pulse" />
                      )}
                      <img
                        src={integration.logo}
                        alt={integration.name}
                        className={`h-10 w-auto object-contain transition-all ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                        style={{ 
                          filter: 'grayscale(100%)',
                          transition: 'filter 0.3s ease'
                        }}
                        onLoad={() => setImgLoaded(true)}
                        onError={() => {
                          setImgError(true);
                          setImgLoaded(false);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.filter = 'grayscale(0%)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.filter = 'grayscale(100%)';
                        }}
                        crossOrigin="anonymous"
                      />
                    </>
                  ) : (
                    <div 
                      className="flex items-center justify-center w-16 h-16 rounded-lg"
                      style={{ backgroundColor: `${integration.color}15` }}
                    >
                      <span 
                        className="text-xs font-semibold"
                        style={{ color: integration.color }}
                      >
                        {integration.name.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              );
            };

            return (
              <>
                {/* First Carousel */}
                <div className="mb-12">
                  <div className="overflow-hidden">
                    <div className="flex animate-scroll-left">
                      {[...carousel1Integrations, ...carousel1Integrations].map((integration, index) => (
                        <LogoCard key={`carousel1-${index}`} integration={integration} index={index} carousel={1} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Second Carousel (reverse direction) */}
                <div>
                  <div className="overflow-hidden">
                    <div className="flex animate-scroll-right">
                      {[...carousel2Integrations, ...carousel2Integrations].map((integration, index) => (
                        <LogoCard key={`carousel2-${index}`} integration={integration} index={index} carousel={2} />
                      ))}
                    </div>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Data Store Section */}
      <section className="relative py-24 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="text-sm tracking-widest text-gray-500 mb-4">DATA STORE</div>
              <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-6 text-gray-900">
                Premium data sets and live feeds
              </h2>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Access curated data sets and real-time data feeds directly in your workflows. 
                Subscribe to premium data sources including commodity trading data, world trade statistics, 
                financial market feeds, and more. All data is delivered in real-time and seamlessly 
                integrates with your automation workflows.
              </p>
              <div className="space-y-6">
                {[
                  'Live data feeds and real-time updates',
                  'Premium data sets for purchase',
                  'Commodity trading data',
                  'World trade statistics',
                  'Financial market feeds (NYSE, NASDAQ)',
                  'Multiple formats: API, WebSocket, CSV, JSON',
                ].map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 bg-gray-900 mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                <div className="space-y-6">
                  {/* Data Store Visual */}
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Available Data Sets</h3>
                    <div className="px-3 py-1 bg-green-100 rounded-full text-xs text-green-700 font-medium">
                      Live
                    </div>
                  </div>
                  
                  {/* Sample data entries */}
                  {[
                    { name: 'Commodity Trade Data', price: '$199/mo', status: 'Live Stream', format: 'API, WebSocket' },
                    { name: 'World Trade Data', price: '$299/mo', status: 'Live Stream', format: 'API, CSV, JSON' },
                    { name: 'NYSE Live Data', price: '$399/mo', status: 'Live Stream', format: 'WebSocket, API' },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        </div>
                        <div className="text-xs text-gray-500 mb-2">{item.format}</div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">{item.status}</span>
                          <span className="text-xs font-medium text-gray-900">{item.price}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => {
                        if (isAuthenticated) {
                          navigate('/store');
                        } else {
                          navigate('/signup');
                        }
                      }}
                      className="inline-flex items-center gap-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                    >
                      Browse all data sets
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="relative py-32 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="text-xs tracking-widest text-gray-500 mb-3">WHAT YOU CAN BUILD</div>
            <h2 className="text-2xl lg:text-3xl font-light tracking-tight mb-6 text-gray-900">
              Forbidding is forbidden, anything is possible
            </h2>
          </div>

          <ResourcesCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl lg:text-6xl font-light tracking-tight mb-6 text-gray-900">
              Ready to get started?
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-2xl mx-auto">
              Join organizations around the world using SPECTR SYSTEM to transform their operations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/signup"
                className="px-8 py-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/pricing"
                className="px-8 py-4 border border-gray-300 text-gray-900 text-sm font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-2xl font-semibold tracking-wide text-gray-900" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <span>SPECTR SYSTEM</span>
            </div>
            <div className="flex items-center gap-8 text-sm text-gray-600">
              <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
              <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
              <a href="#" className="hover:text-gray-900 transition-colors">Security</a>
              <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} SPECTR SYSTEM. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
