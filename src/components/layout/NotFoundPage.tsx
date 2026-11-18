import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-surface border border-border p-8 rounded-card shadow-sm space-y-4">
        <span className="text-4xl font-extrabold text-brand-600 font-heading">404</span>
        <h1 className="text-lg font-bold text-ink font-heading">
          Page nahi mila (Not Found)
        </h1>
        <p className="text-xs text-muted">
          Aap jo page dhoondh rahe hain wo exist nahi karta ya move ho chuka hai.
        </p>

        <div className="pt-2">
          <Link to="/app">
            <Button className="w-full">
              <Home className="w-4 h-4 mr-2" />
              <span>Dashboard par jaayein</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
