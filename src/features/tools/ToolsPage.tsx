import React from 'react';
import { Wrench, Building2, Calculator, PieChart, MessageSquare } from 'lucide-react';

export const ToolsPage: React.FC = () => {
  const tools = [
    { title: 'Area Converter', desc: 'Gaj ⟷ Sq.Ft ⟷ Marla ⟷ Kanal ⟷ Acre', icon: Building2 },
    { title: 'Home Loan EMI', desc: 'Calculate monthly EMI & interest outflow', icon: Calculator },
    { title: 'Commission Splitter', desc: 'Seller, Buyer & Partner share math', icon: PieChart },
    { title: 'Rate per Gaj', desc: 'Price + Size ⟷ Rate per Gaj calculator', icon: Building2 },
    { title: 'WhatsApp Templates', desc: 'Flyer, site visit & token receipt templates', icon: MessageSquare },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wrench className="w-5 h-5 text-brand-600" />
        <h1 className="text-lg font-bold text-ink font-heading">Broker Toolkit</h1>
      </div>
      <p className="text-xs text-muted">Client-side calculators and WhatsApp message generators.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tools.map((t, idx) => {
          const Icon = t.icon;
          return (
            <div key={idx} className="p-4 bg-surface border border-border rounded-card hover:border-brand-600/50 transition cursor-pointer">
              <Icon className="w-5 h-5 text-brand-600 mb-2" />
              <h2 className="text-sm font-bold text-ink">{t.title}</h2>
              <p className="text-xs text-muted mt-0.5">{t.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
