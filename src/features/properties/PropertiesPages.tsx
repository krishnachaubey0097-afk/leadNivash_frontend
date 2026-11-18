import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Building2, Plus, ArrowLeft } from 'lucide-react';

export const PropertiesListPage: React.FC = () => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-ink font-heading">Properties Inventory</h1>
        <Link to="/app/properties/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            <span>Add Property</span>
          </Button>
        </Link>
      </div>

      <EmptyState
        icon={<Building2 className="w-10 h-10" />}
        title="Abhi koi property nahi hai"
        description="Pehli property add karo ya WhatsApp message paste karo."
        actionLabel="Quick Add Property"
        onAction={() => (window.location.href = '/app/properties/new')}
      />
    </div>
  );
};

export const PropertyNewPage: React.FC = () => {
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Link to="/app/properties" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </Link>
      <h1 className="text-lg font-bold text-ink font-heading">Quick Add Property Listing</h1>
      <div className="p-6 bg-surface border border-border rounded-card text-xs text-muted">
        Property Quick Add form will be wired in Phase F2.
      </div>
    </div>
  );
};

export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Link to="/app/properties" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <ArrowLeft className="w-4 h-4" /> Back to Properties
      </Link>
      <h1 className="text-lg font-bold text-ink font-heading">Property Details</h1>
      <p className="text-xs text-muted">Property ID: {id}</p>
    </div>
  );
};

export const PropertyEditPage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Link to={`/app/properties/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <ArrowLeft className="w-4 h-4" /> Back to Details
      </Link>
      <h1 className="text-lg font-bold text-ink font-heading">Edit Property</h1>
      <p className="text-xs text-muted">Property ID: {id}</p>
    </div>
  );
};

export const PropertySharePage: React.FC = () => {
  const { id } = useParams();
  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <Link to={`/app/properties/${id}`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
        <ArrowLeft className="w-4 h-4" /> Back to Details
      </Link>
      <h1 className="text-lg font-bold text-ink font-heading">Generate Masked Flyer</h1>
      <p className="text-xs text-muted">Property ID: {id}</p>
    </div>
  );
};
