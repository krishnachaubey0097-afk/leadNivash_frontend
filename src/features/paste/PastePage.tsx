import React from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const PastePage: React.FC = () => {
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-brand-600" />
        <h1 className="text-lg font-bold text-ink font-heading">Quick Paste</h1>
      </div>
      <p className="text-xs text-muted">
        Forwarded WhatsApp property message ya buyer requirement yahan paste karein.
      </p>

      <div className="p-4 bg-surface border border-border rounded-card space-y-3">
        <textarea
          rows={6}
          placeholder="e.g. 3 BHK in DLF Primus Sector 82 Gurgaon demand 2.40 Cr. Semi-furnished, middle floor. Client contact..."
          className="w-full bg-bg border border-border rounded-input p-3 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
        <p className="text-[11px] text-muted">
          🔒 Phone numbers AI ko nahi bheje jaate (Privacy Vault)
        </p>
        <Button className="w-full">
          Analyze & Extract Details
        </Button>
      </div>
    </div>
  );
};
