import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './features/auth/AuthProvider';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { AppRoutes } from './routes';
import { CookieConsentBanner } from './components/layout/CookieConsentBanner';
import { SpeedInsights } from '@vercel/speed-insights/react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes cache per PRD §7.5
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRoutes />
              <CookieConsentBanner />
              <SpeedInsights />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
