/**
 * SPECTR SYSTEM Public Store Page
 * Public-facing data store marketplace
 * Palantir-inspired design
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, Check, Database, TrendingUp, Globe, Zap, BarChart3, Download, Package, Building2, Ship, DollarSign, Activity, Users, MapPin, Calendar, FileText, CreditCard, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';

interface DataProduct {
  id: string;
  name: string;
  category: string;
  type: 'live' | 'dataset';
  description: string;
  price: number;
  featured: boolean;
  icon: React.FC<{ className?: string }>;
  features: string[];
  formats: string[];
  size: string;
}

const PublicStorePage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'datasets', name: 'Data Sets' },
    { id: 'live', name: 'Live Data' },
  ];

  const dataProducts: DataProduct[] = [
    {
      id: '1',
      name: 'Commodity Trade Data',
      category: 'trade',
      type: 'live',
      description: 'Real-time and historical commodity trading data including prices, volumes, and market trends',
      price: 29,
      featured: true,
      icon: TrendingUp,
      features: [
        'Real-time commodity prices',
        'Historical data (10+ years)',
        'Volume and trading activity',
        'Market depth and order book',
        'Futures and options data',
        'WebSocket streaming API'
      ],
      formats: ['API', 'WebSocket', 'CSV', 'JSON'],
      size: 'Live Stream'
    },
    {
      id: '2',
      name: 'World Trade Data',
      category: 'trade',
      type: 'dataset',
      description: 'Comprehensive global trade data including import/export statistics and trade flows',
      price: 39,
      featured: false,
      icon: Globe,
      features: [
        'Import/export statistics',
        'Trade flow analytics',
        'Country-level data',
        'Commodity classifications',
        'Historical trends',
        'Custom reports'
      ],
      formats: ['API', 'CSV', 'JSON', 'Excel'],
      size: '10M+ records'
    },
    {
      id: '3',
      name: 'NYSE Live Data',
      category: 'financial',
      type: 'live',
      description: 'Real-time New York Stock Exchange data including live quotes, trades, and order book',
      price: 49,
      featured: true,
      icon: Zap,
      features: [
        'Live stock quotes',
        'Real-time trades',
        'Order book depth',
        'Market indicators',
        'Historical tick data',
        'Low-latency WebSocket'
      ],
      formats: ['API', 'WebSocket', 'CSV', 'JSON'],
      size: 'Live Stream'
    },
    {
      id: '4',
      name: 'Market Analytics Dataset',
      category: 'market',
      type: 'dataset',
      description: 'Comprehensive market analytics including sentiment, trends, and predictive indicators',
      price: 34,
      featured: false,
      icon: BarChart3,
      features: [
        'Market sentiment analysis',
        'Trend indicators',
        'Predictive analytics',
        'Risk metrics',
        'Correlation data',
        'Custom dashboards'
      ],
      formats: ['API', 'JSON', 'CSV'],
      size: '5M+ records'
    },
    {
      id: '5',
      name: 'Global Shipping Data',
      category: 'shipping',
      type: 'live',
      description: 'Real-time vessel tracking, port data, and shipping routes worldwide',
      price: 44,
      featured: false,
      icon: Ship,
      features: [
        'Vessel tracking (AIS)',
        'Port arrivals/departures',
        'Shipping routes',
        'Cargo information',
        'Port congestion data',
        'Historical shipping records'
      ],
      formats: ['API', 'WebSocket', 'CSV', 'JSON'],
      size: 'Live Stream'
    },
    {
      id: '6',
      name: 'Cryptocurrency Market Data',
      category: 'financial',
      type: 'live',
      description: 'Real-time cryptocurrency prices, trading volumes, and market data',
      price: 24,
      featured: false,
      icon: DollarSign,
      features: [
        'Real-time crypto prices',
        'Trading volumes',
        'Market cap data',
        'Exchange rates',
        'Historical price data',
        'DeFi metrics'
      ],
      formats: ['API', 'WebSocket', 'CSV', 'JSON'],
      size: 'Live Stream'
    },
    {
      id: '7',
      name: 'Economic Indicators',
      category: 'economic',
      type: 'dataset',
      description: 'Global economic indicators including GDP, inflation, unemployment, and more',
      price: 29,
      featured: false,
      icon: Activity,
      features: [
        'GDP data by country',
        'Inflation rates',
        'Unemployment statistics',
        'Interest rates',
        'Currency exchange rates',
        'Economic forecasts'
      ],
      formats: ['API', 'CSV', 'JSON', 'Excel'],
      size: '2M+ records'
    },
    {
      id: '8',
      name: 'Company Financial Data',
      category: 'financial',
      type: 'dataset',
      description: 'Comprehensive financial data for public companies worldwide',
      price: 59,
      featured: true,
      icon: Building2,
      features: [
        'Financial statements',
        'Earnings reports',
        'Balance sheets',
        'Cash flow data',
        'Stock performance',
        'Analyst ratings'
      ],
      formats: ['API', 'CSV', 'JSON', 'Excel'],
      size: '50K+ companies'
    },
    {
      id: '9',
      name: 'Consumer Spending Data',
      category: 'economic',
      type: 'dataset',
      description: 'Consumer spending patterns, retail sales, and purchasing behavior',
      price: 36,
      featured: false,
      icon: ShoppingCart,
      features: [
        'Retail sales data',
        'Consumer spending trends',
        'Category breakdowns',
        'Regional analysis',
        'Seasonal patterns',
        'Demographic insights'
      ],
      formats: ['API', 'CSV', 'JSON'],
      size: '5M+ records'
    },
    {
      id: '10',
      name: 'Supply Chain Data',
      category: 'trade',
      type: 'dataset',
      description: 'Supply chain visibility, logistics, and inventory data',
      price: 42,
      featured: false,
      icon: Package,
      features: [
        'Supply chain mapping',
        'Logistics tracking',
        'Inventory levels',
        'Supplier data',
        'Transportation costs',
        'Risk indicators'
      ],
      formats: ['API', 'CSV', 'JSON'],
      size: '3M+ records'
    },
    {
      id: '11',
      name: 'Real Estate Data',
      category: 'market',
      type: 'dataset',
      description: 'Property prices, sales data, and real estate market trends',
      price: 33,
      featured: false,
      icon: Building2,
      features: [
        'Property prices',
        'Sales transactions',
        'Market trends',
        'Rental rates',
        'Property listings',
        'Market forecasts'
      ],
      formats: ['API', 'CSV', 'JSON'],
      size: '20M+ properties'
    },
    {
      id: '12',
      name: 'Social Media Analytics',
      category: 'market',
      type: 'live',
      description: 'Social media trends, sentiment analysis, and engagement metrics',
      price: 26,
      featured: false,
      icon: Users,
      features: [
        'Trending topics',
        'Sentiment analysis',
        'Engagement metrics',
        'Influencer data',
        'Hashtag tracking',
        'Brand mentions'
      ],
      formats: ['API', 'JSON', 'CSV'],
      size: 'Live Stream'
    },
    {
      id: '13',
      name: 'Geographic Data',
      category: 'economic',
      type: 'dataset',
      description: 'Geographic and demographic data including population, boundaries, and locations',
      price: 19,
      featured: false,
      icon: MapPin,
      features: [
        'Population data',
        'Geographic boundaries',
        'Location coordinates',
        'Demographic statistics',
        'Administrative regions',
        'Geospatial data'
      ],
      formats: ['API', 'GeoJSON', 'CSV', 'JSON'],
      size: 'Global coverage'
    },
    {
      id: '14',
      name: 'News & Media Data',
      category: 'market',
      type: 'dataset',
      description: 'News articles, press releases, and media content from global sources',
      price: 24,
      featured: false,
      icon: FileText,
      features: [
        'News articles',
        'Press releases',
        'Media sentiment',
        'Topic extraction',
        'Source tracking',
        'Historical archive'
      ],
      formats: ['API', 'RSS', 'JSON', 'CSV'],
      size: '10M+ articles'
    },
    {
      id: '15',
      name: 'Payment Transaction Data',
      category: 'financial',
      type: 'live',
      description: 'Payment processing data, transaction volumes, and financial flows',
      price: 49,
      featured: false,
      icon: CreditCard,
      features: [
        'Transaction volumes',
        'Payment methods',
        'Geographic distribution',
        'Fraud indicators',
        'Processing times',
        'Success rates'
      ],
      formats: ['API', 'CSV', 'JSON'],
      size: 'Anonymized aggregates'
    },
    {
      id: '16',
      name: 'Weather & Climate Data',
      category: 'economic',
      type: 'dataset',
      description: 'Historical and forecast weather data, climate patterns, and environmental metrics',
      price: 21,
      featured: false,
      icon: Calendar,
      features: [
        'Weather forecasts',
        'Historical weather',
        'Climate patterns',
        'Temperature data',
        'Precipitation records',
        'Environmental metrics'
      ],
      formats: ['API', 'CSV', 'JSON'],
      size: 'Global coverage'
    },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? dataProducts 
    : dataProducts.filter(product => product.type === selectedCategory);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to="/" className="flex items-center gap-3 text-gray-600 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm">Back to Home</span>
            </Link>
            <Link to="/" className="flex items-center text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span className="text-gray-900">SPECTR SYSTEM</span>
            </Link>
            <Link
              to="/signup"
              className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
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
            <div className="text-sm tracking-widest text-gray-500 mb-6">STORE</div>
            <h1 className="text-5xl lg:text-7xl font-light tracking-tight mb-8 text-gray-900">
              Premium data products
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Access high-quality datasets and real-time data feeds to power your intelligence workflows. 
              All data products are free to use on our platform.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-20 bottom-0 w-64 pt-12 px-8">
          <nav className="space-y-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={clsx(
                  'relative w-full text-left py-3 px-4 transition-all duration-300',
                  selectedCategory === category.id
                    ? 'text-gray-900'
                    : 'text-gray-400 hover:text-gray-600'
                )}
              >
                <span className="relative z-10 text-sm font-medium tracking-widest uppercase">
                  {category.name}
                </span>
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="sidebarIndicator"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-900"
                    initial={false}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  />
                )}
                {selectedCategory === category.id && (
                  <motion.span
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{ opacity: 1, scaleX: 1 }}
                    className="absolute left-0 top-0 bottom-0 w-full origin-left"
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <span className="absolute inset-0 bg-gray-900/5" />
                  </motion.span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Data Products */}
        <section className="relative pb-24 px-6 lg:px-8 ml-64 flex-1">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 pt-8">
              <p className="text-sm text-gray-600">
                Showing {filteredProducts.length} data products
              </p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
            {filteredProducts.map((product, index) => {
              const Icon = product.icon;
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className={clsx(
                    'relative p-8 border transition-all',
                    product.featured
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                  )}
                >
                  {/* Header */}
                  <div className="mb-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 flex-shrink-0">
                        <Icon className="w-6 h-6 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs tracking-widest text-gray-500 mb-2">{product.category.toUpperCase()}</div>
                        <h3 className="text-2xl font-light text-gray-900 mb-2">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-light text-gray-900">
                        ${product.price}
                      </span>
                      <span className="text-sm text-gray-500">/month</span>
                      <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                        Free on Platform
                      </span>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Database className="w-3.5 h-3.5" />
                      <span>{product.size}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {product.formats.map((format) => (
                        <span
                          key={format}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link
                    to="/signup"
                    className={clsx(
                      'block w-full py-4 text-center text-sm font-medium transition-all mb-6',
                      product.featured
                        ? 'bg-gray-900 text-white hover:bg-gray-800'
                        : 'border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50'
                    )}
                  >
                    Get Started Free
                  </Link>

                  {/* Features */}
                  <div className="space-y-3">
                    <div className="text-xs tracking-widest text-gray-500 mb-3">INCLUDES</div>
                    {product.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
        </section>
      </div>

      {/* Features Section */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-light tracking-tight mb-6 text-gray-900">
              Why choose our data store?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              All data products are completely free to use on our platform. No subscriptions, no hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Download,
                title: 'Instant Access',
                description: 'Access all data products immediately after signing up. No credit card required.'
              },
              {
                icon: Package,
                title: 'Multiple Formats',
                description: 'Get data in the format you need: API, WebSocket, CSV, JSON, and more.'
              },
              {
                icon: Database,
                title: 'High Quality',
                description: 'All datasets are verified, cleaned, and updated regularly for accuracy.'
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 mx-auto mb-4">
                    <Icon className="w-6 h-6 text-gray-600" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-light tracking-tight mb-4 text-gray-900">
              Frequently Asked Questions
            </h2>
            <p className="text-gray-600">
              Everything you need to know about our data store
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                question: 'Are the data products really free?',
                answer: 'Yes! All data products in our store are completely free to use on the SPECTR SYSTEM platform. There are no subscription fees or hidden costs.'
              },
              {
                question: 'What formats are available?',
                answer: 'Most products support multiple formats including REST API, WebSocket streaming, CSV downloads, and JSON. Check each product page for specific format availability.'
              },
              {
                question: 'How often is the data updated?',
                answer: 'Update frequency varies by product. Real-time data streams are updated continuously, while historical datasets are updated daily or weekly depending on the source.'
              },
              {
                question: 'Can I use the data for commercial purposes?',
                answer: 'Yes, all data products can be used for commercial purposes within the SPECTR SYSTEM platform. Data cannot be resold or redistributed outside the platform.'
              },
              {
                question: 'Do I need to sign up to access the data?',
                answer: 'Yes, you need to create a free account to access the data products. Signing up is free and takes less than a minute.'
              },
              {
                question: 'Can I request custom datasets?',
                answer: 'Yes! Contact us through the platform and we can work with you to provide custom datasets tailored to your specific needs.'
              }
            ].map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-light tracking-tight mb-6 text-gray-900">
            Ready to get started?
          </h2>
          <p className="text-lg text-gray-600 mb-10">
            Sign up for free and start using premium data products today. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-4 bg-gray-900 text-white font-medium hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact-sales"
              className="px-8 py-4 border border-gray-300 text-gray-900 hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} SPECTR SYSTEM. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <a href="#" className="hover:text-gray-900 transition-colors">Security</a>
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
    <div className="border border-gray-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium pr-4 text-gray-900">{question}</span>
        <span className={clsx(
          'text-xl text-gray-500 transition-transform',
          isOpen && 'rotate-45'
        )}>+</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export default PublicStorePage;

