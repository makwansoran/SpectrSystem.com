/**
 * Data Pack Detail Page
 * Detailed information about a specific data pack
 */

import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { 
  ArrowLeft, 
  ShoppingBag,
  Download, 
  Check,
  Database,
  Package,
  DollarSign,
  FileText,
  Calendar,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Users,
  BarChart3,
  Building2,
  Crown
} from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useUserStore } from '../stores/userStore';

interface DataPack {
  id: string;
  name: string;
  description: string;
  fullDescription: string;
  price: number;
  category: string;
  size: string;
  records: number;
  format: string[];
  lastUpdated: string;
  updateFrequency: string;
  dataQuality: string;
  license: string;
  features: string[];
  useCases: string[];
  icon: React.FC<{ className?: string }>;
}

const DataPackDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { packId } = useParams<{ packId: string }>();
  const { organization } = useUserStore();
  const [isPurchasing, setIsPurchasing] = useState(false);

  // Data pack database - in a real app, this would come from an API
  const dataPacks: Record<string, DataPack> = {
    '1': {
      id: '1',
      name: 'Global Business Database',
      description: 'Comprehensive database of 10M+ companies worldwide',
      fullDescription: 'Our Global Business Database is the most comprehensive collection of business information available. It includes detailed company profiles, contact information, revenue data, employee counts, industry classifications, and much more. Perfect for B2B marketing, sales prospecting, market research, and competitive analysis.',
      price: 299,
      category: 'business',
      size: '2.5 GB',
      records: 10000000,
      format: ['CSV', 'JSON', 'SQL'],
      lastUpdated: '2024-12-01',
      updateFrequency: 'Monthly',
      dataQuality: '98% verified',
      license: 'Commercial use allowed',
      features: [
        'Company names and legal entities',
        'Contact information (email, phone, address)',
        'Revenue and financial data',
        'Employee counts and company size',
        'Industry classifications (NAICS, SIC)',
        'Geographic location data',
        'Website URLs and social media links',
        'Company descriptions and tags'
      ],
      useCases: [
        'B2B lead generation and prospecting',
        'Market research and analysis',
        'Competitive intelligence',
        'Sales territory planning',
        'Business development',
        'Email marketing campaigns'
      ],
      icon: Building2,
    },
    '2': {
      id: '2',
      name: 'Consumer Email Database',
      description: 'Verified email addresses of 50M+ consumers',
      fullDescription: 'A massive collection of verified consumer email addresses with demographic data, interests, and purchase behavior. All emails are verified and opt-in compliant, making this perfect for legitimate marketing campaigns and customer acquisition.',
      price: 199,
      category: 'consumer',
      size: '1.8 GB',
      records: 50000000,
      format: ['CSV', 'JSON'],
      lastUpdated: '2024-12-10',
      updateFrequency: 'Weekly',
      dataQuality: '95% deliverable',
      license: 'Marketing use allowed',
      features: [
        'Verified email addresses',
        'Demographic information',
        'Geographic location',
        'Interest categories',
        'Purchase behavior indicators',
        'Age and gender data',
        'Opt-in status verification'
      ],
      useCases: [
        'Email marketing campaigns',
        'Customer acquisition',
        'Market segmentation',
        'Audience targeting',
        'Lead generation'
      ],
      icon: Users,
    },
    '3': {
      id: '3',
      name: 'Market Research Data',
      description: 'Industry reports and market trends from 2020-2024',
      fullDescription: 'Comprehensive market research data covering 50+ industries with detailed reports, trend analysis, market size data, growth projections, and competitive landscapes. Perfect for strategic planning and business intelligence.',
      price: 149,
      category: 'research',
      size: '850 MB',
      records: 5000000,
      format: ['CSV', 'JSON', 'PDF'],
      lastUpdated: '2024-11-15',
      updateFrequency: 'Quarterly',
      dataQuality: 'Research-grade',
      license: 'Commercial use allowed',
      features: [
        'Industry reports (2020-2024)',
        'Market size and growth data',
        'Trend analysis and forecasts',
        'Competitive landscape data',
        'Consumer behavior insights',
        'Regional market data',
        'PDF research reports',
        'Statistical datasets'
      ],
      useCases: [
        'Strategic planning',
        'Market entry analysis',
        'Competitive research',
        'Investment research',
        'Business intelligence',
        'Industry analysis'
      ],
      icon: BarChart3,
    },
    '4': {
      id: '4',
      name: 'Geographic Data Pack',
      description: 'Complete geographic datasets with coordinates and boundaries',
      fullDescription: 'Comprehensive geographic data including coordinates, postal codes, administrative boundaries, time zones, and geographic hierarchies. Essential for location-based services, mapping applications, and geographic analysis.',
      price: 99,
      category: 'geographic',
      size: '450 MB',
      records: 2000000,
      format: ['CSV', 'JSON', 'GeoJSON'],
      lastUpdated: '2024-12-05',
      updateFrequency: 'Monthly',
      dataQuality: '99% accurate',
      license: 'Commercial use allowed',
      features: [
        'Latitude/longitude coordinates',
        'Postal and ZIP codes',
        'Administrative boundaries',
        'Time zone data',
        'Geographic hierarchies',
        'GeoJSON format support',
        'Country, state, city data',
        'Distance calculations'
      ],
      useCases: [
        'Location-based services',
        'Mapping applications',
        'Geographic analysis',
        'Delivery route optimization',
        'Market territory planning',
        'Location intelligence'
      ],
      icon: Globe,
    },
    '5': {
      id: '5',
      name: 'Social Media Analytics',
      description: 'Aggregated social media metrics and trend analysis',
      fullDescription: 'Comprehensive social media analytics data including engagement metrics, follower counts, content performance, trend analysis, and sentiment data from major platforms. Perfect for social media strategy and competitive analysis.',
      price: 249,
      category: 'social',
      size: '1.2 GB',
      records: 15000000,
      format: ['CSV', 'JSON'],
      lastUpdated: '2024-12-08',
      updateFrequency: 'Daily',
      dataQuality: 'Real-time aggregated',
      license: 'Analytics use allowed',
      features: [
        'Engagement metrics',
        'Follower growth data',
        'Content performance',
        'Trend analysis',
        'Sentiment analysis',
        'Hashtag performance',
        'Influencer data',
        'Platform-specific metrics'
      ],
      useCases: [
        'Social media strategy',
        'Competitive analysis',
        'Influencer marketing',
        'Content optimization',
        'Trend identification',
        'Audience insights'
      ],
      icon: TrendingUp,
    },
    '6': {
      id: '6',
      name: 'Financial Market Data',
      description: 'Historical stock prices, forex rates, and cryptocurrency data',
      fullDescription: 'Comprehensive financial market data including historical stock prices, forex rates, cryptocurrency data, market indices, and economic indicators. Includes real-time updates and historical data going back 10+ years.',
      price: 399,
      category: 'financial',
      size: '3.1 GB',
      records: 25000000,
      format: ['CSV', 'JSON', 'Parquet'],
      lastUpdated: '2024-12-12',
      updateFrequency: 'Real-time',
      dataQuality: 'Exchange-verified',
      license: 'Trading and analysis use',
      features: [
        'Historical stock prices (10+ years)',
        'Forex rates and currency pairs',
        'Cryptocurrency data',
        'Market indices',
        'Economic indicators',
        'Real-time updates',
        'OHLCV data',
        'Volume and liquidity data'
      ],
      useCases: [
        'Algorithmic trading',
        'Financial analysis',
        'Risk management',
        'Portfolio optimization',
        'Market research',
        'Backtesting strategies'
      ],
      icon: Zap,
    },
  };

  const pack = packId ? dataPacks[packId] : null;

  if (!pack) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-900 mb-1">Data pack not found</p>
          <Link
            to="/store"
            className="text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            ← Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const Icon = pack.icon;

  const handlePurchase = async () => {
    setIsPurchasing(true);
    // TODO: Implement purchase flow
    setTimeout(() => {
      alert(`Purchase functionality for "${pack.name}" will be implemented soon!`);
      setIsPurchasing(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-slate-300/50 sticky top-0 z-10 backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link
                to="/store"
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Store</span>
              </Link>
              <div className="h-4 w-px bg-slate-300" />
              <div className="flex items-center gap-2">
                <Icon className="w-5 h-5 text-slate-900" />
                <h1 className="text-sm font-medium text-slate-900 tracking-tight uppercase">
                  {pack.name}
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-300/50 p-6"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-slate-900 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-slate-900 mb-2">{pack.name}</h2>
                  <p className="text-sm text-slate-600">{pack.description}</p>
                </div>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{pack.fullDescription}</p>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white border border-slate-300/50 p-6"
            >
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                What's Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pack.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Use Cases */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-slate-300/50 p-6"
            >
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-4">
                Use Cases
              </h3>
              <div className="space-y-2">
                {pack.useCases.map((useCase, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-slate-700">{useCase}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar - Purchase Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-slate-300/50 p-6 sticky top-20"
            >
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-semibold text-slate-900">${pack.price}</span>
                  <span className="text-sm text-slate-500">one-time</span>
                </div>
                <p className="text-xs text-slate-500">Instant download after purchase</p>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full px-4 py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isPurchasing ? 'Processing...' : 'Purchase Now'}
              </button>

              {/* Pack Details */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5" />
                    Records
                  </span>
                  <span className="font-mono font-medium text-slate-900">
                    {pack.records.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Size
                  </span>
                  <span className="font-mono font-medium text-slate-900">{pack.size}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Formats
                  </span>
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
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Last Updated
                  </span>
                  <span className="font-medium text-slate-900">{pack.lastUpdated}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    Updates
                  </span>
                  <span className="font-medium text-slate-900">{pack.updateFrequency}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" />
                    Quality
                  </span>
                  <span className="font-medium text-slate-900">{pack.dataQuality}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    License
                  </span>
                  <span className="font-medium text-slate-900 text-right max-w-[60%]">
                    {pack.license}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DataPackDetailPage;

