/**
 * Subscription Detail Page
 * Detailed information about a specific data subscription
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

  // Subscription database - in a real app, this would come from an API
  const dataPacks: Record<string, DataPack> = {
    '1': {
      id: '1',
      name: 'Commodity Trade Data',
      description: 'Real-time and historical commodity trading data',
      fullDescription: 'Access comprehensive commodity trading data including real-time prices, volumes, market trends, and historical data for all major commodities. Perfect for traders, analysts, and businesses that need up-to-date commodity market intelligence. Includes data for energy commodities (oil, gas), metals (gold, silver, copper), agricultural products (wheat, corn, soybeans), and more.',
      price: 199,
      category: 'commodity',
      size: 'Live Stream',
      records: 0,
      format: ['API', 'WebSocket', 'CSV', 'JSON'],
      lastUpdated: '2024-12-15',
      updateFrequency: 'Real-time',
      dataQuality: 'Exchange-verified',
      license: 'Trading and analysis use',
      features: [
        'Real-time commodity prices',
        'Historical price data (10+ years)',
        'Volume and trading activity',
        'Market depth and order book',
        'Futures and options data',
        'Commodity indices',
        'Supply and demand metrics',
        'WebSocket streaming API'
      ],
      useCases: [
        'Commodity trading',
        'Price forecasting',
        'Risk management',
        'Supply chain planning',
        'Market analysis',
        'Investment research'
      ],
      icon: TrendingUp,
    },
    '2': {
      id: '2',
      name: 'World Trade Data',
      description: 'Comprehensive global trade data and analytics',
      fullDescription: 'Get access to comprehensive global trade data including import/export statistics, trade flows, international commerce analytics, and customs data. Track trade patterns, identify market opportunities, and analyze global supply chains. Includes data from major trading nations, commodity classifications, and detailed shipment information.',
      price: 299,
      category: 'world-trade',
      size: 'Live Stream',
      records: 0,
      format: ['API', 'WebSocket', 'CSV', 'JSON'],
      lastUpdated: '2024-12-15',
      updateFrequency: 'Daily',
      dataQuality: 'Government-verified',
      license: 'Commercial use allowed',
      features: [
        'Import/export statistics',
        'Trade flow analysis',
        'Country-to-country trade data',
        'Commodity classifications (HS codes)',
        'Customs and shipping data',
        'Trade balance information',
        'Historical trade trends',
        'Real-time trade updates'
      ],
      useCases: [
        'Market research',
        'Supply chain analysis',
        'Trade compliance',
        'Market entry planning',
        'Competitive intelligence',
        'Economic analysis'
      ],
      icon: Globe,
    },
    '3': {
      id: '3',
      name: 'NYSE Live Data',
      description: 'Real-time New York Stock Exchange data',
      fullDescription: 'Access real-time New York Stock Exchange data including live quotes, trades, order book, market depth, and historical data. Perfect for traders, financial analysts, and algorithmic trading systems. Includes Level 2 market data, tick-by-tick trade information, and comprehensive market analytics.',
      price: 399,
      category: 'nyse',
      size: 'Live Stream',
      records: 0,
      format: ['API', 'WebSocket', 'CSV', 'JSON'],
      lastUpdated: '2024-12-15',
      updateFrequency: 'Real-time',
      dataQuality: 'NYSE-verified',
      license: 'Trading and analysis use',
      features: [
        'Real-time stock quotes',
        'Live trade data',
        'Level 2 order book',
        'Market depth information',
        'Historical price data',
        'Volume and liquidity metrics',
        'Market indices (NYSE Composite)',
        'WebSocket streaming API'
      ],
      useCases: [
        'Algorithmic trading',
        'Real-time market analysis',
        'High-frequency trading',
        'Portfolio management',
        'Market research',
        'Risk assessment'
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
          <p className="text-sm font-medium text-slate-900 mb-1">Subscription not found</p>
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
                  <span className="text-sm text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500">Subscription-based access</p>
              </div>

              <button
                onClick={handlePurchase}
                disabled={isPurchasing}
                className="w-full px-4 py-3 bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {isPurchasing ? 'Processing...' : 'Subscribe Now'}
              </button>

              {/* Subscription Details */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5" />
                    Delivery
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

