/**
 * SPECTR SYSTEM Solutions Index Page
 * Decision infrastructure for businesses operating under risk
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, X, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface Solution {
  name: string;
  problem: string;
  outcome: string;
  usedBy?: string;
}

interface SolutionPillar {
  title: string;
  description: string;
  solutions: Solution[];
}

const SolutionsIndexPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const pillars: SolutionPillar[] = [
    {
      title: 'Risk & Compliance',
      description: 'Automate risk decisions while preserving full auditability, human oversight, and regulatory compliance.',
      solutions: [
        {
          name: 'Risk-Driven Customer & Partner Onboarding',
          problem: 'Automate onboarding decisions while preserving full auditability, human oversight, and regulatory compliance.',
          outcome: 'Faster onboarding without hidden liability',
          usedBy: 'Fintech, marketplaces, regulated B2B platforms',
        },
        {
          name: 'Continuous Risk Monitoring & Compliance',
          problem: 'Risk does not stop at onboarding. SPECTR continuously reassesses entities as conditions change.',
          outcome: 'No blind spots between audits',
          usedBy: 'Compliance, risk, legal teams',
        },
        {
          name: 'Fraud & Anomaly Exposure Management',
          problem: 'Detect systemic fraud patterns across customers, transactions, and operations before losses escalate.',
          outcome: 'Early detection with controlled intervention',
          usedBy: 'Payments, marketplaces, operations',
        },
      ],
    },
    {
      title: 'Operational Resilience',
      description: 'Respond to incidents and disruptions with speed, control, and full visibility.',
      solutions: [
        {
          name: 'Incident Response & Decision Automation',
          problem: 'When incidents occur, speed matters—but only with control.',
          outcome: 'Faster response, fewer mistakes',
          usedBy: 'Security, operations, SOC teams',
        },
        {
          name: 'End-to-End Supply Chain Risk Intelligence',
          problem: 'Understand and manage systemic supply-chain exposure across suppliers, carriers, and regions.',
          outcome: 'Fewer surprises, better contingency planning',
          usedBy: 'Procurement, operations, leadership',
        },
        {
          name: 'Distribution Network Disruption Management',
          problem: 'Identify and respond to risks across logistics hubs, routes, and last-mile networks.',
          outcome: 'Reduced downtime and cascading failures',
          usedBy: 'Logistics, operations teams',
        },
      ],
    },
    {
      title: 'Strategic & Financial Exposure',
      description: 'See and manage exposure across counterparties, jurisdictions, and geopolitical scenarios.',
      solutions: [
        {
          name: 'Portfolio Counterparty Exposure Management',
          problem: 'See and manage financial exposure across all counterparties—not one by one, but as a system.',
          outcome: 'Controlled exposure, informed capital decisions',
          usedBy: 'Finance, risk, treasury',
        },
        {
          name: 'Geopolitical Exposure & Scenario Awareness',
          problem: 'Translate global instability into concrete business impact.',
          outcome: 'Decisions grounded in reality, not headlines',
          usedBy: 'Strategy, leadership, global ops',
        },
      ],
    },
  ];

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
            <Link to="/" className="flex items-center text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <img src="/EyelogoBlack.png" alt="SPECTR SYSTEM" className="h-16 w-auto" />
              <span className="text-gray-900">SPECTR SYSTEM</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Home
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                Get Started
              </Link>
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white/95 backdrop-blur-sm">
            <div className="px-6 py-4 space-y-4">
              <Link to="/" className="block text-sm text-gray-600 hover:text-gray-900">
                Home
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
      <section className="relative pt-32 pb-24 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl lg:text-6xl font-light tracking-tight mb-6 leading-[1.1] text-gray-900">
              Decision infrastructure for businesses operating under risk
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl leading-relaxed mb-8">
              Automated workflows, live intelligence, and auditable AI. SPECTR enables organizations to make faster decisions while maintaining control, compliance, and full traceability.
            </p>
            <Link
              to="/signup"
              className="inline-block px-8 py-4 bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Get Started
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Solution Pillars */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16 mb-24">
            {pillars.map((pillar, pillarIndex) => (
              <motion.div
                key={pillar.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: pillarIndex * 0.1 }}
              >
                <h2 className="text-2xl font-medium mb-4 text-gray-900">
                  {pillar.title}
                </h2>
                <p className="text-gray-600 leading-relaxed mb-8">
                  {pillar.description}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Individual Solutions */}
          <div className="space-y-16">
            {pillars.map((pillar, pillarIndex) => (
              <div key={pillar.title} className="space-y-12">
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-xl font-medium text-gray-700 mb-2">{pillar.title}</h3>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {pillar.solutions.map((solution, solutionIndex) => (
                    <motion.div
                      key={solution.name}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, delay: (pillarIndex * 0.1) + (solutionIndex * 0.05) }}
                      className="border border-gray-200 p-6 hover:border-gray-300 hover:shadow-sm transition-all"
                    >
                      <h4 className="text-lg font-medium mb-3 text-gray-900">
                        {solutionIndex + 1}. {solution.name}
                      </h4>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {solution.problem}
                      </p>
                      <div className="pt-4 border-t border-gray-200">
                        <div className="text-xs text-gray-500 mb-2">Outcome</div>
                        <p className="text-gray-700 text-sm mb-3">
                          {solution.outcome}
                        </p>
                        {solution.usedBy && (
                          <>
                            <div className="text-xs text-gray-500 mb-2 mt-4">Used by</div>
                            <p className="text-gray-600 text-xs">
                              {solution.usedBy}
                            </p>
                          </>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Consistency Section */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-6 text-gray-900">
              Built on a single decision platform
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-12 max-w-2xl mx-auto">
              All solutions share the same workflow engine, intelligence layer, audit trail, and control model. One platform, consistent governance.
            </p>
            
            {/* Platform Stack Diagram */}
            <div className="space-y-4 max-w-md mx-auto">
              <div className="border border-gray-200 p-6 text-left">
                <div className="text-sm font-medium text-gray-900 mb-2">Workflow Engine</div>
                <div className="text-xs text-gray-600">Automated decision workflows</div>
              </div>
              <div className="border border-gray-200 p-6 text-left">
                <div className="text-sm font-medium text-gray-900 mb-2">Intelligence Layer</div>
                <div className="text-xs text-gray-600">Live data fusion and enrichment</div>
              </div>
              <div className="border border-gray-200 p-6 text-left">
                <div className="text-sm font-medium text-gray-900 mb-2">Audit Trail</div>
                <div className="text-xs text-gray-600">Immutable decision records</div>
              </div>
              <div className="border border-gray-200 p-6 text-left">
                <div className="text-sm font-medium text-gray-900 mb-2">Control Model</div>
                <div className="text-xs text-gray-600">Human oversight and governance</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust & Control Section */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-light tracking-tight mb-8 text-gray-900">
              Trust and control, by design
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Explainable AI</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every decision includes clear reasoning and evidence. No black boxes.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Human-in-the-loop</h3>
                <p className="text-gray-600 leading-relaxed">
                  Critical decisions require human approval. Automation serves, never replaces.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Full auditability</h3>
                <p className="text-gray-600 leading-relaxed">
                  Immutable records of every decision, enrichment, and action. Complete traceability.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-3 text-gray-900">Compliance-ready</h3>
                <p className="text-gray-600 leading-relaxed">
                  Built for regulatory environments. GDPR, SOC2, and industry-specific requirements.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Closing Section */}
      <section className="relative py-24 px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xl lg:text-2xl text-gray-700 leading-relaxed mb-10 max-w-2xl mx-auto">
              SPECTR is decision infrastructure, not tooling. Built for risk officers, operators, and executives who need control, not convenience.
            </p>
            <Link
              to="/contact-sales"
              className="inline-block px-8 py-4 border border-gray-300 text-gray-900 text-sm font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors"
            >
              Talk to us
            </Link>
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

export default SolutionsIndexPage;
