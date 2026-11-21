import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/theme';
import { AuthProvider } from './features/auth/AuthProvider';
import { ToastProvider } from './components/ui/Toast';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { AppRoutes } from './routes';
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
    <ThemeProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <BrowserRouter>
                <AppRoutes />
                <SpeedInsights />
              </BrowserRouter>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
