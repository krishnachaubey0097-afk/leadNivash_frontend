import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, Plus, ArrowLeft } from 'lucide-react';

export const BuyersListPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink font-heading">Buyer Inquiries</h1>
        <Link to="/app/buyers/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Buyer</span>
          </Button>
        </Link>
      </div>

      <EmptyState
        icon={<Users className="w-10 h-10" />}
        title="Abhi koi buyer lead nahi hai"
        description="Naya buyer requirement add karein ya WhatsApp query paste karein."
        actionLabel="Register Buyer"
        onAction={() => (window.location.href = '/app/buyers/new')}
      />
    </div>
  );
};

export const BuyerNewPage: React.FC = () => {
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Link to="/app/buyers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <ArrowLeft className="w-4 h-4" /> Back to Buyers
      </Link>
      <h1 className="text-lg font-bold text-ink font-heading">Register Buyer Requirement</h1>
      <div className="p-6 bg-surface border border-border rounded-card text-xs text-muted">
        Buyer Registration form will be wired in Phase F2.
      </div>
    </div>
  );
};

export const BuyerDetailPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Link to="/app/buyers" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <ArrowLeft className="w-4 h-4" /> Back to Buyers
      </Link>
      <h1 className="text-lg font-bold text-ink font-heading">Buyer Requirement Details</h1>
      <p className="text-xs text-muted">Buyer ID: {id}</p>
    </div>
  );
};

export const BuyerEditPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Link to={`/app/buyers/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <ArrowLeft className="w-4 h-4" /> Back to Details
      </Link>
      <h1 className="text-lg font-bold text-ink font-heading">Edit Buyer Requirement</h1>
      <p className="text-xs text-muted">Buyer ID: {id}</p>
    </div>
  );
};
