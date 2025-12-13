/**
 * SPECTR SYSTEM Privacy Policy Page
 * Palantir-inspired design
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollProgress from '../components/ScrollProgress';

const PrivacyPolicyPage: React.FC = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <ScrollProgress />
      {/* Header */}
      <header className="relative border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center gap-2 text-2xl font-semibold tracking-wide" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', letterSpacing: '-0.02em' }}>
              <span>SPECTR SYSTEM</span>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 lg:px-8 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-light tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-white/60 text-lg mb-12">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">1. Introduction</h2>
              <p className="mb-4">
                SPECTR SYSTEM ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our visual workflow automation platform and related services (the "Service").
              </p>
              <p className="mb-4">
                Please read this Privacy Policy carefully. By using the Service, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">2. Information We Collect</h2>
              
              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">2.1 Information You Provide</h3>
              <p className="mb-4">We collect information that you provide directly to us, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong>Account Information:</strong> Name, email address, password, and other registration details</li>
                <li><strong>Profile Information:</strong> Profile picture, organization details, and preferences</li>
                <li><strong>Workflow Data:</strong> Workflows you create, configure, and execute through the Service</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed through secure third-party payment processors)</li>
                <li><strong>Communication Data:</strong> Messages, support requests, and other communications with us</li>
              </ul>

              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">2.2 Automatically Collected Information</h3>
              <p className="mb-4">When you use the Service, we automatically collect certain information, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong>Usage Data:</strong> How you interact with the Service, features used, and time spent</li>
                <li><strong>Device Information:</strong> Device type, operating system, browser type, and device identifiers</li>
                <li><strong>Log Data:</strong> IP address, access times, pages viewed, and referring website addresses</li>
                <li><strong>Cookies and Tracking Technologies:</strong> Information collected through cookies, web beacons, and similar technologies</li>
              </ul>

              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">2.3 Third-Party Integrations</h3>
              <p className="mb-4">
                When you connect third-party services to the Service, we may receive information from those services in accordance with their privacy policies and your authorization.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">3. How We Use Your Information</h2>
              <p className="mb-4">We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Send technical notices, updates, security alerts, and support messages</li>
                <li>Respond to your comments, questions, and requests</li>
                <li>Monitor and analyze trends, usage, and activities</li>
                <li>Detect, prevent, and address technical issues and security threats</li>
                <li>Personalize and improve your experience</li>
                <li>Send marketing communications (with your consent, where required)</li>
                <li>Comply with legal obligations and enforce our agreements</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">4. How We Share Your Information</h2>
              <p className="mb-4">We may share your information in the following circumstances:</p>
              
              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">4.1 Service Providers</h3>
              <p className="mb-4">
                We may share information with third-party service providers who perform services on our behalf, such as hosting, payment processing, analytics, and customer support. These providers are contractually obligated to protect your information.
              </p>

              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">4.2 Business Transfers</h3>
              <p className="mb-4">
                If we are involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.
              </p>

              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">4.3 Legal Requirements</h3>
              <p className="mb-4">
                We may disclose your information if required to do so by law or in response to valid requests by public authorities.
              </p>

              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">4.4 With Your Consent</h3>
              <p className="mb-4">
                We may share your information with your consent or at your direction.
              </p>

              <h3 className="text-2xl font-light tracking-tight mb-3 text-white mt-6">4.5 Aggregated Data</h3>
              <p className="mb-4">
                We may share aggregated, anonymized data that does not identify you personally.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">5. Data Security</h2>
              <p className="mb-4">
                We implement appropriate technical and organizational measures to protect your information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Secure data centers and infrastructure</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="mb-4">
                However, no method of transmission over the Internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">6. Data Retention</h2>
              <p className="mb-4">
                We retain your information for as long as necessary to provide the Service, comply with legal obligations, resolve disputes, and enforce our agreements. When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal purposes.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">7. Your Rights and Choices</h2>
              <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request transfer of your data to another service</li>
                <li><strong>Objection:</strong> Object to processing of your information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="mb-4">
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">8. Cookies and Tracking Technologies</h2>
              <p className="mb-4">
                We use cookies and similar tracking technologies to track activity on the Service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
              </p>
              <p className="mb-4">
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of the Service.
              </p>
              <p className="mb-4">We use cookies for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Authentication and session management</li>
                <li>Preferences and settings</li>
                <li>Analytics and performance monitoring</li>
                <li>Security and fraud prevention</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">9. Children's Privacy</h2>
              <p className="mb-4">
                The Service is not intended for children under the age of 13 (or the minimum age in your jurisdiction). We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">10. International Data Transfers</h2>
              <p className="mb-4">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. By using the Service, you consent to the transfer of your information to these countries.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">11. California Privacy Rights</h2>
              <p className="mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA), including the right to know what personal information we collect, the right to delete personal information, and the right to opt-out of the sale of personal information (we do not sell personal information).
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">12. European Privacy Rights</h2>
              <p className="mb-4">
                If you are located in the European Economic Area (EEA), you have certain rights under the General Data Protection Regulation (GDPR). We process your personal information based on legitimate interests, contract performance, legal obligations, or your consent, as applicable.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">13. Changes to This Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.
              </p>
              <p className="mb-4">
                You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">14. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us through our support channels or at the contact information provided on our website.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
              <p>© {new Date().getFullYear()} SPECTR SYSTEM. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link to="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;

