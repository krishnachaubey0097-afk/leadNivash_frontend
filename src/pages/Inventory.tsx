import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { useAuth } from '../lib/auth';
import { openWhatsApp, generateFlyerWhatsAppText } from '../lib/whatsapp';
import { applyWatermarkToImage } from '../lib/watermark';
import {
  Search,
  Share2,
  Building,
  CheckCircle,
  Camera,
  X,
  Download,
  MapPin,
} from 'lucide-react';
import clsx from 'clsx';

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [bhkFilter, setBhkFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('available');

  // Modals state
  const [statusModalProperty, setStatusModalProperty] = useState<any | null>(null);
  const [watermarkModalOpen, setWatermarkModalOpen] = useState(false);
  const [watermarkedBlobUrl, setWatermarkedBlobUrl] = useState<string | null>(null);
  const [watermarkProcessing, setWatermarkProcessing] = useState(false);
  const watermarkType = 'banner';

  // Fetch properties from live backend
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ['properties', bhkFilter, statusFilter],
    queryFn: async () => {
      let url = `/properties?limit=50`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (bhkFilter !== 'all') url += `&bhk=${bhkFilter}`;
      const res = await apiClient.get(url);
      return res.data?.data || [];
    },
  });

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await apiClient.patch(`/properties/${id}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      setStatusModalProperty(null);
    },
  });

  // Flyer Share Mutation
  const shareMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.post(`/properties/${id}/share`);
      return res.data?.data;
    },
  });

  const handleShareFlyer = async (property: any) => {
    try {
      const shareData = await shareMutation.mutateAsync(property._id || property.id);
      const flyerUrl = shareData?.flyerUrl || `${window.location.origin}/p/${shareData?.token}`;

      const text = generateFlyerWhatsAppText({
        title: property.title,
        propertyType: property.propertyType,
        bhk: property.bhk,
        location: property.location,
        pricing: property.pricing,
        specifications: property.specifications,
        flyerUrl,
        agencyName: user?.agencyName || 'LeadNivesh Broker Partner',
        brokerPhone: user?.phone || '',
      });

      openWhatsApp('', text);
    } catch {
      // Fallback with direct message if share endpoint has issue
      const text = generateFlyerWhatsAppText({
        title: property.title,
        propertyType: property.propertyType,
        bhk: property.bhk,
        location: property.location,
        pricing: property.pricing,
        specifications: property.specifications,
        agencyName: user?.agencyName || 'LeadNivesh Broker Partner',
        brokerPhone: user?.phone || '',
      });
      openWhatsApp('', text);
    }
  };

  const handleWatermarkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setWatermarkProcessing(true);
    try {
      const processedBlob = await applyWatermarkToImage(file, {
        agencyName: user?.agencyName || 'LeadNivesh Verified',
        brokerPhone: user?.phone || '',
        watermarkType,
      });
      const url = URL.createObjectURL(processedBlob);
      setWatermarkedBlobUrl(url);
    } catch (err) {
      console.error('Watermark error:', err);
    } finally {
      setWatermarkProcessing(false);
    }
  };

  const filteredProperties = properties.filter((p: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const titleMatch = p.title?.toLowerCase().includes(term);
    const societyMatch = p.location?.society?.toLowerCase().includes(term);
    const sectorMatch = p.location?.sector?.toLowerCase().includes(term);
    return titleMatch || societyMatch || sectorMatch;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Property Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {filteredProperties.length} units listed across Gurugram & NCR
          </p>
        </div>

        <button
          onClick={() => {
            setWatermarkModalOpen(true);
            setWatermarkedBlobUrl(null);
          }}
          className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5 text-primary" />
          <span>Watermark Photo</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by society, sector, or project (e.g. DLF, Godrej, 106)..."
          className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Chips Scrollbar */}
      <div className="space-y-2">
        {/* BHK Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['all', '1', '2', '3', '4', '5'].map((bhk) => (
            <button
              key={bhk}
              onClick={() => setBhkFilter(bhk)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition cursor-pointer',
                bhkFilter === bhk
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-primary/40'
              )}
            >
              {bhk === 'all' ? 'All BHK' : `${bhk} BHK`}
            </button>
          ))}
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'available', label: 'Available' },
            { id: 'under_offer', label: 'Under Offer' },
            { id: 'sold', label: 'Sold' },
            { id: 'all', label: 'All Status' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={clsx(
                'px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition cursor-pointer',
                statusFilter === st.id
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Property Cards List */}
      {isLoading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500">Loading verified inventory...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="py-16 text-center bg-white dark:bg-[#131B2A] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-6">
          <Building className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            No properties found
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search terms or filter selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredProperties.map((prop: any) => {
            const priceLakhs = prop.pricing?.expectedPrice
              ? prop.pricing.expectedPrice >= 10000000
                ? `₹${(prop.pricing.expectedPrice / 10000000).toFixed(2)} Cr`
                : `₹${(prop.pricing.expectedPrice / 100000).toFixed(2)} Lacs`
              : 'Price on Req';

            const isAvailable = prop.status === 'available';

            return (
              <div
                key={prop._id || prop.id}
                className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Badges & Price */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {prop.bhk && (
                        <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold">
                          {prop.bhk} BHK
                        </span>
                      )}
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-medium capitalize">
                        {prop.propertyType || 'Apartment'}
                      </span>
                    </div>

                    <span
                      className={clsx(
                        'px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider',
                        isAvailable
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : prop.status === 'under_offer'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      )}
                    >
                      {prop.status?.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Title & Location */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug">
                    {prop.title || `${prop.bhk || ''} BHK in ${prop.location?.society || 'Gurgaon'}`}
                  </h3>

                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">
                      {[prop.location?.society, prop.location?.sector, prop.location?.city]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  </div>

                  {/* Price & Area Specs */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                    <div>
                      <span className="text-base font-extrabold text-primary">{priceLakhs}</span>
                      {prop.pricing?.pricePerSqFt && (
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          ₹{prop.pricing.pricePerSqFt}/sqft
                        </span>
                      )}
                    </div>

                    <div className="text-right text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {prop.specifications?.superBuiltUpArea
                        ? `${prop.specifications.superBuiltUpArea} Sq.Ft`
                        : ''}
                    </div>
                  </div>
                </div>

                {/* 1-Tap Action Row */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setStatusModalProperty(prop)}
                    className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  >
                    Status
                  </button>

                  <button
                    onClick={() => handleShareFlyer(prop)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer ml-auto"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp Flyer</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Change Status Modal */}
      {statusModalProperty && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-sm w-full shadow-2xl">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Update Listing Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {statusModalProperty.title}
            </p>

            <div className="space-y-2">
              {[
                { id: 'available', label: 'Available (Live in Catalog)', color: 'text-emerald-500' },
                { id: 'under_offer', label: 'Under Offer (Token Received)', color: 'text-amber-500' },
                { id: 'sold', label: 'Sold / Deal Closed', color: 'text-blue-500' },
                { id: 'rented', label: 'Rented Out', color: 'text-purple-500' },
                { id: 'archived', label: 'Archive Listing', color: 'text-slate-400' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() =>
                    statusMutation.mutate({
                      id: statusModalProperty._id || statusModalProperty.id,
                      newStatus: opt.id,
                    })
                  }
                  disabled={statusMutation.isPending}
                  className="w-full text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 hover:bg-primary/10 hover:border-primary/30 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center justify-between transition cursor-pointer"
                >
                  <span className={opt.color}>{opt.label}</span>
                  {statusModalProperty.status === opt.id && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStatusModalProperty(null)}
              className="w-full mt-4 py-2.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Watermark Photo Modal */}
      {watermarkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Photo Watermark Tool
                </h3>
              </div>
              <button
                onClick={() => setWatermarkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Stamp your agency name ({user?.agencyName || 'Your Agency'}) and verified phone onto property photos before sharing with buyers to prevent broker poaching.
            </p>

            {/* Upload Area */}
            <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 dark:bg-slate-900/40">
              <Camera className="w-8 h-8 text-primary mb-2 opacity-80" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Choose Property Photo
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5">
                JPEG, PNG from gallery or camera
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleWatermarkUpload}
                className="hidden"
              />
            </label>

            {watermarkProcessing && (
              <div className="text-center py-4">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-500">Stamping agency badge...</p>
              </div>
            )}

            {watermarkedBlobUrl && (
              <div className="mt-4 space-y-3">
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                  <img
                    src={watermarkedBlobUrl}
                    alt="Watermarked Preview"
                    className="w-full max-h-56 object-cover"
                  />
                </div>

                <a
                  href={watermarkedBlobUrl}
                  download="leadnivesh-watermarked.jpg"
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-focus text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow transition active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Stamped Photo</span>
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
