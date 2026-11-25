import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth, RequireAdmin } from './features/auth/Guards';
import { AppShell } from './components/layout/AppShell';

// Auth & Landing Pages
import { LandingPage } from './features/landing/LandingPage';
import {
  PricingPage,
  PrivacyPage,
  TermsPage,
  ContactPage,
  RefundPolicyPage,
  CookiePolicyPage,
} from './features/landing/LegalPages';
import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';

// App Pages
import { DashboardPage } from './features/dashboard/DashboardPage';
import {
  PropertiesListPage,
  PropertyNewPage,
  PropertyDetailPage,
  PropertyEditPage,
  PropertySharePage,
} from './features/properties/PropertiesPages';
import {
  BuyersListPage,
  BuyerNewPage,
  BuyerDetailPage,
  BuyerEditPage,
} from './features/buyers/BuyersPages';
import { PastePage } from './features/paste/PastePage';
import { ToolsPage } from './features/tools/ToolsPage';
import { SettingsPage } from './features/settings/SettingsPages';
import { AdminPage } from './features/admin/AdminPage';
import { PublicFlyerPage } from './features/flyer/PublicFlyerPage';
import { NotFoundPage } from './components/layout/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Marketing & Legal Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />
      <Route path="/refund" element={<RefundPolicyPage />} />
      <Route path="/cookies" element={<CookiePolicyPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/flyer/:id" element={<PublicFlyerPage />} />

      {/* Public Auth Pages */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected App Routes (Wrapped in RequireAuth + AppShell) */}
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="track-record" element={<DashboardPage />} />
        <Route path="properties" element={<PropertiesListPage />} />
        <Route path="properties/new" element={<PropertyNewPage />} />
        <Route path="properties/:id" element={<PropertyDetailPage />} />
        <Route path="properties/:id/edit" element={<PropertyEditPage />} />
        <Route path="properties/:id/share" element={<PropertySharePage />} />
        <Route path="paste" element={<PastePage />} />
        <Route path="buyers" element={<BuyersListPage />} />
        <Route path="buyers/new" element={<BuyerNewPage />} />
        <Route path="buyers/:id" element={<BuyerDetailPage />} />
        <Route path="buyers/:id/edit" element={<BuyerEditPage />} />
        <Route path="tools" element={<ToolsPage />} />
        <Route path="tools/:toolId" element={<ToolsPage />} />
        <Route path="inquiries" element={<Navigate to="/app/buyers?tab=inquiries" replace />} />
        <Route path="settings" element={<SettingsPage />} />

        {/* Admin Route (Guarded by RequireAdmin) */}
        <Route
          path="admin"
          element={
            <RequireAdmin>
              <AdminPage />
            </RequireAdmin>
          }
        />
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
