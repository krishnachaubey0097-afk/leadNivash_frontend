import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './lib/theme';
import { AuthProvider } from './lib/auth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { TodayFeed } from './pages/TodayFeed';
import { Inventory } from './pages/Inventory';
import { Buyers } from './pages/Buyers';
import { QuickPaste } from './pages/QuickPaste';
import { Toolkit } from './pages/Toolkit';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 3, // 3 minutes cache
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected App Routes */}
              <Route path="/app" element={<Layout />}>
                <Route index element={<Navigate to="/app/today" replace />} />
                <Route path="today" element={<TodayFeed />} />
                <Route path="inventory" element={<Inventory />} />
                <Route path="buyers" element={<Buyers />} />
                <Route path="paste" element={<QuickPaste />} />
                <Route path="toolkit" element={<Toolkit />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Root & Catch-all Fallbacks */}
              <Route path="/" element={<Navigate to="/app/today" replace />} />
              <Route path="*" element={<Navigate to="/app/today" replace />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
