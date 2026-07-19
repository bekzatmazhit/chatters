import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { BrandProvider, useBrands } from './components/BrandContext';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SvodkaView from './components/views/SvodkaView';
import ProjectsLogsView from './components/views/ProjectsLogsView';
import CombinedAnalyticsView from './components/views/CombinedAnalyticsView';
import CombinedMarketView from './components/views/CombinedMarketView';
import CombinedOptimizationView from './components/views/CombinedOptimizationView';
import CombinedSettingsView from './components/views/CombinedSettingsView';
import BrandSettingsView from './components/views/BrandSettingsView';
import FactCheckView from './components/views/FactCheckView';
import AlertsView from './components/views/AlertsView';
import HeadToHeadView from './components/views/HeadToHeadView';
import IntegrationsView from './components/views/IntegrationsView';
import TimelineView from './components/views/TimelineView';
import PlaygroundView from './components/views/PlaygroundView';
import AuthView from './components/views/AuthView';
import LandingView from './components/views/LandingView';
import OnboardingView from './components/views/OnboardingView';
import WorkspacesHubView from './components/views/WorkspacesHubView';
import AiChatWidget from './components/AiChatWidget';

function AuthenticatedApp({ session }) {
  const [active, setActive] = useState('overview');
  const { brands, loading, activeBrandId } = useBrands();

  if (loading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-bg text-content-secondary font-medium">Загрузка проектов...</div>;
  }

  // Show Workspaces Hub if no active brand is selected
  if (!activeBrandId) {
    return <WorkspacesHubView onQuickAction={(tab) => setActive(tab)} />;
  }

  // Force onboarding if no brands exist
  if (brands.length === 0) {
    return <Onboar
