/**
 * SPECTR SYSTEM Terms of Service Page
 * Palantir-inspired design
 */

import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import ScrollProgress from '../components/ScrollProgress';

const TermsOfServicePage: React.FC = () => {
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
          <h1 className="text-5xl font-light tracking-tight mb-4">Terms of Service</h1>
          <p className="text-white/60 text-lg mb-12">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

          <div className="prose prose-invert max-w-none space-y-8 text-white/80 leading-relaxed">
            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using SPECTR SYSTEM ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">2. Description of Service</h2>
              <p className="mb-4">
                SPECTR SYSTEM is a visual workflow automation platform that enables users to create, manage, and execute automated workflows. The Service provides tools for integrating with various business systems, automating tasks, and managing data workflows.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">3. User Accounts</h2>
              <p className="mb-4">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">4. Acceptable Use</h2>
              <p className="mb-4">You agree not to use the Service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit any malicious code, viruses, or harmful data</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Collect or harvest information about other users without their consent</li>
                <li>Impersonate any person or entity or misrepresent your affiliation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">5. Intellectual Property</h2>
              <p className="mb-4">
                The Service and its original content, features, and functionality are owned by SPECTR SYSTEM and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
              </p>
              <p className="mb-4">
                You retain ownership of any content you create, upload, or store using the Service. By using the Service, you grant SPECTR SYSTEM a worldwide, non-exclusive, royalty-free license to use, store, and process your content solely for the purpose of providing the Service to you.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">6. Subscription and Payment</h2>
              <p className="mb-4">
                The Service is offered on a subscription basis. By subscribing, you agree to pay all fees associated with your selected plan. Fees are charged in advance on a monthly or annual basis, as selected.
              </p>
              <p className="mb-4">
                You may cancel your subscription at any time. Cancellation will take effect at the end of your current billing period. No refunds will be provided for partial billing periods.
              </p>
              <p className="mb-4">
                We reserve the right to change our pricing with 30 days' notice. Continued use of the Service after price changes constitutes acceptance of the new pricing.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">7. Data and Privacy</h2>
              <p className="mb-4">
                Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy to understand our practices regarding the collection and use of your information.
              </p>
              <p className="mb-4">
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">8. Service Availability</h2>
              <p className="mb-4">
                We strive to maintain high availability of the Service but do not guarantee uninterrupted access. The Service may be unavailable due to maintenance, updates, or circumstances beyond our control.
              </p>
              <p className="mb-4">
                We reserve the right to modify, suspend, or discontinue the Service or any part thereof at any time with or without notice.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">9. Limitation of Liability</h2>
              <p className="mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, SPECTR SYSTEM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
              </p>
              <p className="mb-4">
                Our total liability for any claims arising from or related to the Service shall not exceed the amount you paid to us in the twelve (12) months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">10. Indemnification</h2>
              <p className="mb-4">
                You agree to indemnify, defend, and hold harmless SPECTR SYSTEM and its officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and expenses, including reasonable attorneys' fees, arising out of or in any way connected with your use of the Service or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">11. Termination</h2>
              <p className="mb-4">
                We may terminate or suspend your account and access to the Service immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason.
              </p>
              <p className="mb-4">
                Upon termination, your right to use the Service will immediately cease. All provisions of these Terms that by their nature should survive termination shall survive termination.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">12. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
              </p>
              <p className="mb-4">
                Your continued use of the Service after any such changes constitutes your acceptance of the new Terms. If you do not agree to any of these terms or any future Terms, do not use or access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">13. Governing Law</h2>
              <p className="mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which SPECTR SYSTEM operates, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">14. Contact Information</h2>
              <p className="mb-4">
                If you have any questions about these Terms of Service, please contact us through our support channels or at the contact information provided on our website.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-light tracking-tight mb-4 text-white">15. Severability</h2>
              <p className="mb-4">
                If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall remain in full force and effect.
              </p>
            </section>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/60">
              <p>© {new Date().getFullYear()} SPECTR SYSTEM. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
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

export default TermsOfServicePage;

