import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { openWhatsApp } from '../lib/whatsapp';
import {
  Users,
  Search,
  Plus,
  Phone,
  MessageCircle,
  Target,
  MapPin,
  IndianRupee,
  X,
} from 'lucide-react';

export const Buyers: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [newBuyerModal, setNewBuyerModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formBhk, setFormBhk] = useState(3);
  const [formMinPrice, setFormMinPrice] = useState(15000000);
  const [formMaxPrice, setFormMaxPrice] = useState(25000000);
  const [formLocation, setFormLocation] = useState('Sector 82, Gurgaon');

  // Load buyers
  const { data: buyers = [], isLoading } = useQuery({
    queryKey: ['buyers'],
    queryFn: async () => {
      const res = await apiClient.get('/buyers?limit=50');
      return res.data?.data || [];
    },
  });

  // Create Buyer Mutation
  const createMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await apiClient.post('/buyers', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
      setNewBuyerModal(false);
      setFormName('');
      setFormPhone('');
    },
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formName,
      phone: formPhone,
      requirements: {
        propertyType: 'apartment',
        bhk: [formBhk],
        budget: { min: formMinPrice, max: formMaxPrice },
        preferredLocations: [formLocation],
      },
      status: 'active',
    });
  };

  const filteredBuyers = buyers.filter((b: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const nameMatch = b.name?.toLowerCase().includes(term);
    const phoneMatch = b.phone?.includes(term);
    const locMatch = b.requirements?.preferredLocations?.some((l: string) =>
      l.toLowerCase().includes(term)
    );
    return nameMatch || phoneMatch || locMatch;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Buyer Inquiries
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredBuyers.length} active clients ready for site visits & match closing
          </p>
        </div>

        <button
          onClick={() => setNewBuyerModal(true)}
          className="px-3 py-2 bg-primary hover:bg-primary-focus text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-primary/20 transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Buyer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by client name, mobile or preferred sector..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
      </div>

      {/* Buyers List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading buyers...</p>
        </div>
      ) : filteredBuyers.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#131B2A] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No buyers registered yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Tap "Add Buyer" or paste WhatsApp inquiries on Quick Paste.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredBuyers.map((buyer: any) => {
            const minCr = buyer.requirements?.budget?.min
              ? `₹${(buyer.requirements.budget.min / 10000000).toFixed(2)} Cr`
              : 'Flexible';
            const maxCr = buyer.requirements?.budget?.max
              ? `₹${(buyer.requirements.budget.max / 10000000).toFixed(2)} Cr`
              : 'No Limit';

            const bhks = buyer.requirements?.bhk?.join(', ') || 'Any';

            return (
              <div
                key={buyer._id || buyer.id}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        {buyer.name || 'Unnamed Client'}
                      </h3>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {buyer.phone || 'No phone'}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                      {buyer.status || 'Active'}
                    </span>
                  </div>

                  {/* Requirements Specs */}
                  <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {bhks} BHK {buyer.requirements?.propertyType || 'Apartment'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <IndianRupee className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        Budget: {minCr} – {maxCr}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {buyer.requirements?.preferredLocations?.join(', ') || 'Gurugram & NCR'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Tap Action Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={`tel:${buyer.phone}`}
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition"
                    title="Call Client"
                  >
                    <Phone className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => {
                      const msg = `Namaste ${buyer.name} ji, checking in regarding your requirement for ${bhks} BHK in ${buyer.requirements?.preferredLocations?.[0] || 'Gurgaon'}. We have 2 verified options available. When can we schedule a visit?`;
                      openWhatsApp(buyer.phone, msg);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ml-auto"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Buyer Modal */}
      {newBuyerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Register Buyer Requirement
              </h3>
              <button
                onClick={() => setNewBuyerModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  Client Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Vikram Mehta"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                  WhatsApp / Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="e.g. 9811223344"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    BHK Choice
                  </label>
                  <select
                    value={formBhk}
                    onChange={(e) => setFormBhk(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  >
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5+ BHK / Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Preferred Location
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Sector 82"
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Min Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formMinPrice}
                    onChange={(e) => setFormMinPrice(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Max Budget (₹)
                  </label>
                  <input
                    type="number"
                    value={formMaxPrice}
                    onChange={(e) => setFormMaxPrice(parseInt(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full mt-2 py-3 bg-primary hover:bg-primary-focus text-white text-xs font-bold rounded-xl shadow-md transition active:scale-98 cursor-pointer disabled:opacity-60"
              >
                {createMutation.isPending ? 'Saving...' : 'Register Buyer Lead'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
