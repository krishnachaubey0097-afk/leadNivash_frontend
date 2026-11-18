import React from 'react';
import { Shield } from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-amber-500" />
        <h1 className="text-lg font-bold text-ink font-heading">Founder & Admin Console</h1>
      </div>
      <p className="text-xs text-muted">
        Restricted founder portal for monitoring users, usage counters, and contacts.
      </p>

      <div className="p-6 bg-surface border border-border rounded-card text-xs text-muted">
        Admin dashboard modules will be connected in Phase F7.
      </div>
    </div>
  );
};
