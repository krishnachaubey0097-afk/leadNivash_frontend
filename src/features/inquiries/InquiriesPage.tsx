import React from 'react';
import { Inbox } from 'lucide-react';
import { EmptyState } from '../../components/ui/EmptyState';

export const InquiriesPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Inbox className="w-5 h-5 text-brand-600" />
        <h1 className="text-lg font-bold text-ink font-heading">Public Flyer Inquiries</h1>
      </div>
      <p className="text-xs text-muted">
        Direct buyer inquiries submitted through your shared flyer web links.
      </p>

      <EmptyState
        icon={<Inbox className="w-10 h-10" />}
        title="Abhi koi inquiry nahi aayi hai"
        description="Jab koi buyer aapke flyer link se inquiry submit karega, wo yahan dikhegi."
      />
    </div>
  );
};
