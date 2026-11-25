import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../lib/auth';

export const Layout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <img
            src="/logo-icon.png"
            alt="LeadNivash"
            className="w-12 h-12 object-contain animate-bounce"
          />
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-slate-500 font-medium tracking-wide">
            Loading LeadNivash...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink-900 transition-colors">
      <TopBar />
      <main className="flex-1 pb-24 max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto w-full px-4 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
