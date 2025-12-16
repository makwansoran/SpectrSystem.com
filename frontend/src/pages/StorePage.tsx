/**
 * Store Page
 * Subscription marketplace for purchasing data subscriptions
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, 
  ArrowLeft, 
  Database, 
  Download, 
  Check,
  Zap,
  TrendingUp,
  Globe,
  Users,
  BarChart3,
  Package,
  Crown,
  Building2,
  Search,
  Mail,
  Clock,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { useUserStore } from '../stores/userStore';
import Sidebar from '../components/Sidebar';

interface DataPack {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  size: string;
  records: number;
  format: string[];
      featured?: boolean;
  icon: React.FC<{ className?: string }>;
}

const StorePage: React.FC = () => {
  const navigate = useNavigate();
  const { organization, isAuthenticated } = useUserStore();

  // Redirect to signup if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signup');
    }
  }, [isAuthenticated, navigate]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    datasetDescription: ''
  });

  const dataPacks: DataPack[] = [
    {
      id: '1',
      name: 'Commodity Trade Data',
      description: 'Real-time and historical commodity trading data including prices, volumes, and market trends for all major commodities',
      price: 199,
      category: 'commodity',
      size: 'Live Stream',
      records: 0,
      format: ['API', 'WebSocket', 'CSV', 'JSON'],
      featured: true,
      icon: TrendingUp,
    },
    {
      id: '2',
      name: 'World Trade Data',
      description: 'Comprehensive global trade data including import/export statistics, trade flows, and international commerce analytics',
      price: 299,
      category: 'world-trade',
      size: 'Live Stream',
      records: 0,
      format: ['API', 'WebSocket', 'CSV', 'JSON'],
      featured: true,
      icon: Globe,
    },
    {
      id: '3',
      name: 'NYSE Live Data',
      description: 'Real-time New York Stock Exchange data including live quotes, trades, order book, and market depth information',
      price: 399,
      category: 'nyse',
      size: 'Live Stream',
      records: 0,
      format: ['API', 'WebSocket', 'CSV', 'JSON'],
      featured: true,
      icon: Zap,
    },
  ];

  const categories = [
    { id: 'all', name: 'All Subscriptions' },
    { id: 'commodity', name: 'Commodity' },
    { id: 'world-trade', name: 'World Trade' },
    { id: 'nyse', name: 'NYSE' },
  ];

  const filteredPacks = dataPacks.filter(pack => {
    const matchesCategory = selectedCategory === 'all' || pack.category === selectedCategory;
    const matchesSearch = pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pack.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handlePackClick = (packId: string) => {
    navigate(`/store/${packId}`);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement contact form submission
    console.log('Contact form submitted:', contactForm);
    alert('Thank you for your request! We will contact you within 24 hours.');
    setIsContactModalOpen(false);
    setContactForm({ name: '', email: '', datasetDescription: '' });
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar activePage="store" />
      <div className="flex-1 ml-[64px]">
      {/* Header */}
      <header className="bg-white border-b border-slate-300/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                to="/home"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back</span>
              </Link>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-slate-900" />
                <h1 className="text-sm font-medium text-slate-900 tracking-tight uppercase">
                  Data Store
                </h1>
              </div>
            </div>
            {organization && organization.plan !== 'free' && (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <span className="capitalize">{organization.plan} Plan</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-slate-900 mb-2">Data Subscriptions</h2>
          <p className="text-sm text-slate-600">
            Subscribe to premium data feeds to power your workflows and intelligence projects
          </p>
        </div>

        {/* Custom Dataset Service Box */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            boxShadow: [
              '0 0 0px rgba(0, 0, 0, 0)',
              '0 0 20px rgba(15, 23, 42, 0.3)',
              '0 0 0px rgba(0, 0, 0, 0)'
            ]
          }}
          transition={{ 
            duration: 0.3,
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }
          }}
          className="mb-8 p-4 border-2 border-slate-300/50 bg-gradient-to-br from-slate-50 to-white hover:border-slate-400 hover:shadow-md transition-all cursor-pointer max-w-2xl relative"
          onClick={() => setIsContactModalOpen(true)}
        >
          {/* Animated glow effect */}
          <motion.div
            className="absolute inset-0 rounded border-2 border-slate-400/50 pointer-events-none"
            animate={{
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-900">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-slate-900 mb-1.5 uppercase tracking-wide">
                Need a Custom Dataset?
              </h3>
              <p className="text-sm text-slate-600 mb-2">
                Need a specific dataset not available in our store? Contact us and we'll deliver within <span className="font-semibold text-slate-900">24 hours</span>.
              </p>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Clock className="w-4 h-4" />
                <span>24-hour delivery guarantee</span>
              </div>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsContactModalOpen(true);
              }}
              className="px-5 py-2.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors flex-shrink-0"
            >
              Contact Us
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Category Filter */}
          <div className="flex items-center gap-8 flex-wrap">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={clsx(
                  'text-sm font-medium transition-colors relative pb-1.5',
                  selectedCategory === category.id
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                {category.name}
                {selectedCategory === category.id && (
                  <motion.div
                    layoutId="categoryUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                    initial={false}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search subscriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300/50 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>

        {/* Subscriptions Grid */}
        {filteredPacks.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-900 mb-1">No subscriptions found</p>
            <p className="text-xs text-slate-500">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPacks.map((pack) => {
              const Icon = pack.icon;
              return (
                <motion.div
                  key={pack.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  onClick={() => handlePackClick(pack.id)}
                  className="relative p-4 border border-slate-300/50 hover:border-slate-400 hover:shadow-lg transition-all cursor-pointer bg-white"
                >
                  
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-slate-100">
                      <Icon className="w-5 h-5 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 mb-1 uppercase tracking-wide">
                        {pack.name}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {pack.description}
                      </p>
                    </div>
                  </div>

                  {/* Subscription Details */}
                  <div className="space-y-2 mb-4 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Delivery</span>
                      <span className="font-mono font-medium text-slate-900">{pack.size}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Formats</span>
                      <div className="flex items-center gap-1">
                        {pack.format.map((fmt, idx) => (
                          <span
                            key={idx}
                            className="px-1.5 py-0.5 bg-slate-100 text-slate-700 font-mono text-xs"
                          >
                            {fmt}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Price and Purchase */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div>
                      <div className="text-lg font-semibold text-slate-900">${pack.price}<span className="text-xs font-normal">/mo</span></div>
                      <div className="text-xs text-slate-500">Subscription</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePackClick(pack.id);
                      }}
                      className="px-4 py-2 text-xs font-medium bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Contact Modal */}
      <AnimatePresence>
        {isContactModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsContactModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-300/50 w-full max-w-md p-6 relative"
              onClick={(e) => e.stopPropagation()}
            >
            <button
              onClick={() => setIsContactModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-2 uppercase tracking-wide">
                Request Custom Dataset
              </h2>
              <p className="text-sm text-slate-600">
                Tell us about the dataset you need and we'll deliver it within 24 hours.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-slate-900 mb-1.5 uppercase tracking-wide">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300/50 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-medium text-slate-900 mb-1.5 uppercase tracking-wide">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300/50 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="datasetDescription" className="block text-xs font-medium text-slate-900 mb-1.5 uppercase tracking-wide">
                  Dataset Description
                </label>
                <textarea
                  id="datasetDescription"
                  required
                  rows={5}
                  value={contactForm.datasetDescription}
                  onChange={(e) => setContactForm({ ...contactForm, datasetDescription: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-white border border-slate-300/50 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-mono resize-none"
                  placeholder="Describe the dataset you need, including data types, sources, format, and any specific requirements..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                >
                  Submit Request
                </button>
                <button
                  type="button"
                  onClick={() => setIsContactModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium bg-white text-slate-900 border border-slate-900 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
};

export default StorePage;

