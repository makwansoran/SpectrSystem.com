/**
 * SPECTR SYSTEM - Visual Workflow Automation
 * Main Application Component with Routing
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LandingPage, SignInPage, SignUpPage, HomePage, SolutionsPage } from './pages';
import SolutionsIndexPage from './pages/SolutionsIndexPage';
import DataPage from './pages/DataPage';
import ScrollToTop from './components/ScrollToTop';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SelectPlanPage from './pages/SelectPlanPage';
import ContactSalesPage from './pages/ContactSalesPage';
import WorkflowEditor from './WorkflowEditor';
import Dashboard from './pages/Dashboard';
import IntelligenceDashboard from './pages/IntelligenceDashboard';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import OrganizationPage from './pages/OrganizationPage';
import TermsOfServicePage from './pages/TermsOfServicePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import StorePage from './pages/StorePage';
import PublicStorePage from './pages/PublicStorePage';
import DataPackDetailPage from './pages/DataPackDetailPage';
import UsagePage from './pages/UsagePage';
import AdminPage from './pages/AdminPage';
import DatasetsPage from './pages/DatasetsPage';
import AgentPage from './pages/AgentPage';
import { useUserStore } from './stores/userStore';

const AppContent: React.FC = () => {
  const initialize = useUserStore((state) => state.initialize);

  useEffect(() => {
    // Initialize authentication state on app load
    initialize();
  }, [initialize]);

  return (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<PublicStorePage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/select-plan" element={<SelectPlanPage />} />
        <Route path="/contact-sales" element={<ContactSalesPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/app" element={<WorkflowEditor />} />
        <Route path="/app/:workflowId" element={<WorkflowEditor />} />
        <Route path="/agent" element={<AgentPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/intel" element={<IntelligenceDashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/subscription" element={<SubscriptionPage />} />
        <Route path="/organization" element={<OrganizationPage />} />
        <Route path="/store/:packId" element={<DataPackDetailPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/solutions" element={<SolutionsIndexPage />} />
        <Route path="/solutions/:slug" element={<SolutionsPage />} />
        <Route path="/data" element={<DataPage />} />
        <Route path="/usage" element={<UsagePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/datasets" element={<DatasetsPage />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
