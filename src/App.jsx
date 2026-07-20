import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { BrandProvider, useBrands } from './components/BrandContext';
import LandingView from './components/views/LandingView';
import PublicAuditView from './components/views/PublicAuditView';
import WorkspaceHubView from './components/views/WorkspaceHubView';
import DesignSystemView from './components/views/DesignSystemView';
import LoginView from './components/auth/LoginView';
import SignupView from './components/auth/SignupView';
import ForgotPasswordView from './components/auth/ForgotPasswordView';
import ResetPasswordView from './components/auth/ResetPasswordView';
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import ResearchListingView from './components/views/ResearchListingView';
import ResearchArticleView from './components/views/ResearchArticleView';
import WorkspaceView from './components/views/WorkspaceView';
import RunsView from './components/views/RunsView';
import AnalyticsView from './components/views/AnalyticsView';
import OptimizationView from './components/views/OptimizationView';
import MonitoringView from './components/views/MonitoringView';
import IntegrationsHub from './components/views/IntegrationsHub';
import SettingsView from './components/views/SettingsView';
import BrandDashboardLayout from './components/layout/BrandDashboardLayout';
import NotFoundView from './components/views/NotFoundView';
import { Toaster } from './components/ui/Toaster';

function WorkspaceSettingsRouter() {
  const { brands } = useBrands();
  const { section } = useParams();
  const slug = brands[0]?.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'workspace';
  const targetSection = section && ['general', 'reports', 'white-label'].includes(section) ? section : 'general';

  return <Navigate to={`/workspace/${slug}/settings/${targetSection}`} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <BrandProvider>
        <div className="bg-background min-h-screen text-content-primary">
          <Routes>
            <Route path="/" element={<LandingView />} />
            <Route path="/audit" element={<PublicAuditView />} />
            <Route path="/workspace" element={<WorkspaceHubView />} />
            <Route path="/hub" element={<WorkspaceHubView />} />
            <Route path="/workspace-settings" element={<WorkspaceSettingsRouter />} />
            <Route path="/workspace-settings/:section" element={<WorkspaceSettingsRouter />} />
            <Route path="/sandbox" element={<DesignSystemView />} />
            <Route path="/login" element={<LoginView />} />
            <Route path="/signup" element={<SignupView />} />
            <Route path="/forgot-password" element={<ForgotPasswordView />} />
            <Route path="/reset-password" element={<ResetPasswordView />} />
            <Route path="/onboarding" element={<OnboardingWizard />} />
            <Route path="/research" element={<ResearchListingView />} />
            <Route path="/research/:slug" element={<ResearchArticleView />} />
            
            {/* Nested Brand Dashboard Routes */}
            <Route path="/workspace/:slug" element={<BrandDashboardLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<WorkspaceView />} />
              <Route path="runs/*" element={<RunsView />} />
              <Route path="analytics/*" element={<AnalyticsView />} />
              <Route path="optimization/*" element={<OptimizationView />} />
              <Route path="monitoring/*" element={<MonitoringView />} />
              <Route path="integrations" element={<IntegrationsHub />} />
              <Route path="settings/*" element={<SettingsView />} />
              {/* Catch-all for unknown sub-paths */}
              <Route path="*" element={<NotFoundView />} />
            </Route>

            {/* Global 404 */}
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </div>
        <Toaster />
      </BrandProvider>
    </BrowserRouter>
  );
}

export default App;
