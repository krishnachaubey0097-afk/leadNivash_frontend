import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Share2,
  Clock,
  MapPin,
  Maximize2,
  DollarSign,
  Compass,
  ArrowLeft,
  Eye,
  EyeOff,
  Copy,
  Check,
  ChevronRight,
  Upload,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Play,
  Film,
  AlertCircle,
  ShieldCheck,
  Download,
  Send,
  Trash2,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ErrorState } from '../../components/ui/ErrorState';
import { PropertyCardSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../auth/AuthProvider';
import {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updatePropertyStatus,
  deleteProperty,
  type PropertyItem,
  type CreatePropertyDto,
} from '../../lib/api/properties';
import { formatRupees } from '../../lib/money';
import clsx from 'clsx';

// =========================================================================
// 1. PROPERTY LIST & INVENTORY OVERVIEW PAGE
// =========================================================================
export const PropertiesListPage: React.FC = () => {
  const { success, error } = useToast();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    setIsDeletingProperty(true);
    try {
      await deleteProperty(propertyToDelete.id);
      setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete.id));
      success(`Property listing "${propertyToDelete.title}" deleted successfully`);
      setPropertyToDelete(null);
    } catch {
      error('Failed to delete property listing');
    } finally {
      setIsDeletingProperty(false);
    }
  };

  const loadProperties = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchProperties({
        search: searchQuery || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus,
      });
      setProperties(data);
    } catch (err: any) {
      if (!silent) {
        console.warn('Failed to fetch properties:', err);
        setFetchError(err?.message || 'Unable to load property inventory. Please check your connection.');
      }
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial ground-truth load
    loadProperties();

    // 2. Real-time cross-device synchronization handlers
    const handleSync = () => {
      loadProperties(true);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleSync);
    window.addEventListener('online', handleSync);
    window.addEventListener('leadnivash_data_changed', handleSync);

    // 3. Heartbeat sync: check backend every 8s while tab is visible
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        handleSync();
      }
    }, 8000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('online', handleSync);
      window.removeEventListener('leadnivash_data_changed', handleSync);
      clearInterval(interval);
    };
  }, [filterStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadProperties();
  };

  const statusFilters = [
    { label: 'All Inventory', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'On Hold', value: 'hold' },
    { label: 'Sold / Closed', value: 'sold' },
  ];

  return (
    <div className="space-y-6 pb-16 text-left max-w-6xl mx-auto">
      {/* Top Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Property Inventory
            </h1>
            <Badge variant="brand">
              {properties.length} Listings
            </Badge>
          </div>
          <p className="text-xs text-muted mt-0.5">
            Organised listings with protected owner contact vault & shareable flyers.
          </p>
        </div>

        <Link to="/app/properties/new">
          <Button size="md" pill className="font-bold text-xs flex items-center gap-2 shadow-md shadow-brand-700/20">
            <Plus className="w-4 h-4" />
            <span>Add New Listing</span>
          </Button>
        </Link>
      </div>

      {/* Search Bar & Filter Strip */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by locality (e.g. Model Town), type (Plot, Floor), or keyword..."
            className="w-full pl-10 pr-4 py-2.5 rounded-full bg-surface border border-border/80 text-xs text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 shadow-xs transition"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {statusFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStatus(f.value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer',
                filterStatus === f.value
                  ? 'bg-brand-700 text-white shadow-xs'
                  : 'bg-surface border border-border text-muted hover:text-ink'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Property Cards */}
      {fetchError ? (
        <ErrorState onRetry={loadProperties} message={fetchError} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
          <PropertyCardSkeleton />
        </div>
      ) : properties.length === 0 ? (
        <Card className="p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">
              {searchQuery ? 'No Properties Found' : 'Please add your properties first'}
            </h3>
            <p className="text-xs text-muted max-w-sm mx-auto mt-1">
              {searchQuery
                ? `No properties matched "${searchQuery}". Try a different locality or clear filter.`
                : 'No data is available to display yet. Start by adding your first property listing.'}
            </p>
          </div>
          <Link to="/app/properties/new">
            <Button size="sm" pill className="font-bold text-xs">
              + Add Property
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.map((prop) => (
            <Card
              key={prop._id}
              className="p-5 flex flex-col justify-between hover:border-brand-600/50 transition-all duration-200 shadow-card hover:shadow-lg group text-left relative overflow-hidden"
            >
              <div className="space-y-3">
                {/* Media Preview Thumbnail if available */}
                {((prop.photos && prop.photos.length > 0) || prop.videoUrl || prop.video?.url) && (
                  <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative mb-2">
                    {prop.photos && prop.photos.length > 0 ? (
                      <img
                        src={prop.photos[0].url}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-900 text-white">
                        <Film className="w-8 h-8 text-emerald-400" />
                      </div>
                    )}

                    {/* Media Count Badges */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                      {prop.photos && prop.photos.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" />
                          <span>{prop.photos.length}</span>
                        </span>
                      )}
                      {(prop.videoUrl || prop.video?.url) && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-700/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                          <Play className="w-3 h-3 fill-current" />
                          <span>Video</span>
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Status & Type Pill */}
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      'text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider',
                      prop.status === 'available'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : prop.status === 'hold'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    )}
                  >
                    {prop.status}
                  </span>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                    {prop.category} · {prop.type}
                  </span>
                </div>

                {/* Title & Price */}
                <div>
                  <h3 className="text-base font-black text-ink font-heading group-hover:text-brand-700 dark:group-hover:text-brand-600 transition line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="text-lg font-black text-brand-700 dark:text-brand-600">
                      {formatRupees(prop.priceDemandPaise)}
                    </span>
                    <span className="text-[11px] text-muted">Asking Demand</span>
                  </div>
                </div>

                {/* Key Attributes Strip */}
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-border/60">
                  <div className="flex items-center gap-1.5 text-muted">
                    <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span className="truncate">{prop.locality}, {prop.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted">
                    <Maximize2 className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                    <span>{prop.size.value} {prop.size.unit.toUpperCase()}</span>
                  </div>
                </div>

                {/* Tags if any */}
                {prop.tags && prop.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {prop.tags.slice(0, 3).map((t, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Link
                    to={`/app/properties/${prop._id}/share`}
                    className="px-3 py-1.5 rounded-full bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/60 dark:hover:bg-brand-900/40 text-brand-700 dark:text-brand-600 text-xs font-bold flex items-center gap-1 transition"
                    title="Share Masked WhatsApp Flyer & Media"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Flyer & Media</span>
                  </Link>

                  {/* 1-Tap Quick WhatsApp Share */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `*${prop.title}*\nLocation: ${prop.locality}, ${prop.city}\nSize: ${prop.size.value} ${prop.size.unit.toUpperCase()}\nPrice: ${formatRupees(
                        prop.priceDemandPaise
                      )}\n\nVerified Flyer & Photos: https://leadnivash.com/flyer/${prop._id}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 transition"
                    title="Quick 1-Tap WhatsApp Share"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>

                  {/* Delete Property Button */}
                  <button
                    type="button"
                    onClick={() => setPropertyToDelete({ id: prop._id, title: prop.title })}
                    className="p-1.5 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <Link
                  to={`/app/properties/${prop._id}`}
                  className="px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition flex items-center gap-1"
                >
                  <span>Details</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Dialog before deleting property */}
      <ConfirmDialog
        open={Boolean(propertyToDelete)}
        onOpenChange={(open) => {
          if (!open) setPropertyToDelete(null);
        }}
        title="Delete Property Listing"
        description={`Are you sure you want to delete "${propertyToDelete?.title}"? This listing will be moved to trash and removed from instant client matching.`}
        confirmText="Yes, Delete Property"
        isLoading={isDeletingProperty}
        onConfirm={confirmDeleteProperty}
      />
    </div>
  );
};

// =========================================================================
// 2. PROPERTY CREATION & MEDIA UPLOAD FORM PAGE
// =========================================================================
export const PropertyNewPage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [type, setType] = useState<CreatePropertyDto['type']>('Floor');
  const [category, setCategory] = useState<'Residential' | 'Commercial'>('Residential');
  const [locality, setLocality] = useState('Model Town');
  const [city] = useState('Panipat');
  const [sizeValue, setSizeValue] = useState<number>(250);
  const [sizeUnit, setSizeUnit] = useState<'gaj' | 'sqft' | 'marla'>('gaj');
  const [priceInLakhs, setPriceInLakhs] = useState<number>(125);
  const [facing, setFacing] = useState('North-East');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Media state
  const [photos, setPhotos] = useState<Array<{ url: string; publicId: string; file?: File }>>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const localitiesList = [
    'Model Town',
    'Ansals Sushant City',
    'Sector 18',
    'Sector 12',
    'Sector 11',
    'GT Road',
    'HUDA Sector 25',
    'Chandni Bagh',
    'Eldeco Estate',
    'Industrial Area',
  ];

  const propertyTypes: Array<CreatePropertyDto['type']> = [
    'Plot',
    'Floor',
    'Kothi',
    'Flat',
    'Shop',
    'Other',
  ];

  // Handle Photo selection with size & type validation
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (photos.length + files.length > 4) {
      setUploadError('Maximum 4 photos allowed per property listing.');
      return;
    }

    const newPhotos: Array<{ url: string; publicId: string; file: File }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      // Max 5 MB per image
      if (file.size > 5 * 1024 * 1024) {
        setUploadError(`Photo "${file.name}" exceeds the 5 MB limit.`);
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setUploadError(`Photo "${file.name}" is not supported. Use JPG, PNG or WebP.`);
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      newPhotos.push({
        url: previewUrl,
        publicId: `local_photo_${Date.now()}_${i}`,
        file,
      });
    }

    setPhotos((prev) => [...prev, ...newPhotos]);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Handle Video selection with size & type validation (max 30 MB)
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Max 30 MB for video
    if (file.size > 30 * 1024 * 1024) {
      setUploadError(`Video "${file.name}" exceeds the 30 MB limit. Please select a shorter walkthrough clip.`);
      return;
    }
    if (!['video/mp4', 'video/webm', 'video/quicktime'].includes(file.type)) {
      setUploadError('Please select a valid MP4 or WebM video file.');
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
    if (videoInputRef.current) videoInputRef.current.value = '';
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locality) {
      error('Please select or specify a locality.');
      return;
    }
    if (!priceInLakhs || priceInLakhs <= 0) {
      error('Please specify a valid asking price.');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceDemandPaise = Math.round(priceInLakhs * 100000 * 100);

      // Package photos
      const photoPayload = photos.map((p) => ({
        url: p.url,
        publicId: p.publicId,
      }));

      await createProperty({
        type,
        category,
        locality,
        city,
        size: {
          value: sizeValue,
          unit: sizeUnit,
        },
        priceDemandPaise,
        facing,
        description,
        status: 'available',
        photos: photoPayload,
        videoUrl: videoPreviewUrl || undefined,
        owner: {
          name: ownerName || 'Direct Owner',
          phone: ownerPhone || undefined,
        },
      });

      success('Property listing added to inventory with media!');
      setTimeout(() => navigate('/app/properties'), 600);
    } catch (err: any) {
      error(err.message || 'Could not create property.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-16 text-left">
      {/* Back button & Title */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inventory</span>
        </Link>
        <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full">
          Direct Inventory Add
        </span>
      </div>

      <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/30 shadow-card">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-ink font-heading">
            Add New Property Listing
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Add listing details, upload photos and video walkthroughs with owner vault protection.
          </p>
        </div>

        {uploadError && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Property Type & Category Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Category
              </label>
              <div className="flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-border">
                {(['Residential', 'Commercial'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={clsx(
                      'px-3 py-1 rounded-full text-[10px] font-bold transition cursor-pointer',
                      category === cat
                        ? 'bg-brand-700 text-white shadow-xs'
                        : 'text-muted hover:text-ink'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <label className="font-bold text-ink uppercase tracking-wider text-[10px] block">
              Property Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {propertyTypes.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={clsx(
                    'py-2 px-3 rounded-xl font-bold text-xs transition cursor-pointer border',
                    type === t
                      ? 'bg-brand-700 text-white border-brand-700 shadow-xs'
                      : 'bg-surface border-border text-muted hover:text-ink'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Asking Price Input */}
          <div className="p-4 rounded-2xl bg-brand-50/50 dark:bg-brand-950/20 border border-brand-500/30 space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-bold text-brand-900 dark:text-brand-300 uppercase tracking-wider text-[10px]">
                Asking Price Demand
              </label>
              <span className="text-sm font-black text-brand-700 dark:text-brand-600">
                ₹{priceInLakhs >= 100 ? `${(priceInLakhs / 100).toFixed(2)} Cr` : `${priceInLakhs} Lakhs`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-muted text-sm">₹</span>
              <input
                type="number"
                value={priceInLakhs}
                onChange={(e) => setPriceInLakhs(Number(e.target.value))}
                placeholder="Price in Lakhs (e.g. 85 or 125)"
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <span className="text-muted text-xs font-bold whitespace-nowrap">Lakhs</span>
            </div>
          </div>

          {/* Size & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Area Size
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={sizeValue}
                  onChange={(e) => setSizeValue(Number(e.target.value))}
                  placeholder="250"
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value as any)}
                  className="bg-surface border border-border rounded-xl p-2.5 text-xs font-bold text-ink"
                >
                  <option value="gaj">Gaj</option>
                  <option value="sqft">Sq.Ft</option>
                  <option value="marla">Marla</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
                Facing
              </label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-bold text-ink"
              >
                <option value="North">North</option>
                <option value="North-East">North-East</option>
                <option value="East">East</option>
                <option value="South-East">South-East</option>
                <option value="South">South</option>
                <option value="West">West</option>
              </select>
            </div>
          </div>

          {/* Locality Dropdown / Text */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
              Locality (Panipat / NCR)
            </label>
            <select
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs font-bold text-ink"
            >
              {localitiesList.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          {/* ======================================================== */}
          {/* MEDIA UPLOAD SECTION: PHOTOS & VIDEO                    */}
          {/* ======================================================== */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                Property Media (Photos & Video)
              </span>
              <span className="text-[10px] text-muted">
                {photos.length}/4 Photos • {videoPreviewUrl ? '1 Video' : '0 Video'}
              </span>
            </div>

            {/* Photo Thumbnails */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-border group bg-white dark:bg-slate-900">
                  <img src={photo.url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1.5 text-[9px] bg-black/60 text-white px-1.5 py-0.2 rounded font-bold">
                    Photo {idx + 1}
                  </span>
                </div>
              ))}

              {photos.length < 4 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 dark:hover:border-emerald-500 bg-white/50 dark:bg-slate-800/40 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-emerald-700 transition cursor-pointer"
                >
                  <Upload className="w-5 h-5" />
                  <span className="text-[10px] font-bold">+ Add Photo</span>
                </button>
              )}
            </div>

            <input
              ref={imageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />

            {/* Video Walkthrough Attachment */}
            <div className="pt-2 border-t border-border">
              {videoPreviewUrl ? (
                <div className="relative rounded-2xl overflow-hidden border border-emerald-500/40 bg-black">
                  <video
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    className="w-full max-h-48 object-contain"
                  />
                  <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-bold">
                      <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                      <span>{videoFile?.name || 'Property Walkthrough Video'}</span>
                    </span>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="text-rose-400 hover:text-rose-300 text-xs font-bold underline cursor-pointer"
                    >
                      Remove Video
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-600 bg-white dark:bg-slate-900 flex items-center justify-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-700 transition cursor-pointer"
                >
                  <VideoIcon className="w-4 h-4 text-emerald-600" />
                  <span>Attach Property Video Walkthrough (MP4, Max 30 MB)</span>
                </button>
              )}
            </div>

            <input
              ref={videoInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleVideoSelect}
              className="hidden"
            />
          </div>

          {/* Owner Privacy Vault Card */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-ink flex items-center gap-1.5 text-xs">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                Owner Privacy Vault
              </span>
              <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-bold">
                Hidden on Public Flyers
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Owner Name (e.g. Rajinder Gupta)"
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink"
              />
              <input
                type="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Owner Phone (+91 98120...)"
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink"
              />
            </div>
            <p className="text-[10px] text-muted flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Owner contact details are stored in your encrypted vault and never exposed on shared flyers.</span>
            </p>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-ink uppercase tracking-wider text-[10px]">
              Highlights & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Near park, wide road, modular kitchen, immediate possession available..."
              className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              pill
              className="w-full font-bold text-xs shadow-md shadow-brand-700/20"
            >
              {isSubmitting ? 'Saving Property...' : 'Save & Publish Listing'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// =========================================================================
// 3. PROPERTY DETAIL & OWNER VAULT PAGE
// =========================================================================
export const PropertyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useToast();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isOwnerRevealed, setIsOwnerRevealed] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PropertyItem['status']>('available');
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [activeMediaType, setActiveMediaType] = useState<'photo' | 'video'>('photo');

  const handleDelete = async () => {
    if (!property) return;
    if (window.confirm(`Are you sure you want to permanently delete this listing ("${property.title}")?`)) {
      try {
        await deleteProperty(property._id);
        success('Property listing deleted successfully');
        navigate('/app/properties');
      } catch {
        error('Failed to delete property listing');
      }
    }
  };

  useEffect(() => {
    if (id) {
      fetchPropertyById(id)
        .then((p) => {
          setProperty(p);
          setCurrentStatus(p.status);
          setIsNotFound(false);
          if (p.photos && p.photos.length > 0) {
            setActiveMediaType('photo');
            setActiveMediaIndex(0);
          } else if (p.videoUrl || p.video?.url) {
            setActiveMediaType('video');
          }
        })
        .catch(() => {
          setIsNotFound(true);
        });
    }
  }, [id]);

  if (isNotFound) {
    return (
      <div className="p-8 text-center max-w-md mx-auto space-y-4 my-12 bg-surface border border-border rounded-2xl shadow-xs">
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto text-xl">
          ⚠️
        </div>
        <h2 className="text-base font-bold text-ink">Property Listing Removed</h2>
        <p className="text-xs text-muted">
          This property listing has been deleted or moved to trash on your account.
        </p>
        <Link
          to="/app/properties"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Property Inventory</span>
        </Link>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        Loading property details...
      </div>
    );
  }

  const handleStatusChange = async (newStatus: PropertyItem['status']) => {
    setCurrentStatus(newStatus);
    await updatePropertyStatus(property._id, newStatus);
    success(`Status updated to ${newStatus.toUpperCase()}`);
  };

  const hasPhotos = property.photos && property.photos.length > 0;
  const hasVideo = !!(property.videoUrl || property.video?.url);

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 text-left">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/properties"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inventory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-full border border-rose-200 dark:border-rose-900/60 bg-rose-50/70 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-1.5 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition cursor-pointer"
            title="Delete Listing"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <Link to={`/app/properties/${property._id}/share`}>
            <Button size="sm" pill className="font-bold text-xs flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Generate Masked Flyer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Detail Card */}
      <Card className="p-5 sm:p-6 space-y-6 border-emerald-500/30 shadow-card">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
                {property.category} · {property.type}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                ID: {property._id.slice(-6)}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading mt-1">
              {property.title}
            </h1>
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-border">
            {(['available', 'hold', 'sold'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={clsx(
                  'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer',
                  currentStatus === st
                    ? st === 'available'
                      ? 'bg-brand-700 text-white shadow-xs'
                      : st === 'hold'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'text-muted hover:text-ink'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Amazon/Flipkart Style Prominent Media Showcase */}
        {(hasPhotos || hasVideo) && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>Media Gallery</span>
              </span>
              <span className="text-[11px] text-muted">
                {activeMediaType === 'photo'
                  ? `Photo ${activeMediaIndex + 1} of ${property.photos?.length || 0}`
                  : 'Video Walkthrough'}
              </span>
            </div>

            {/* Prominent Main Display Stage */}
            <div className="w-full h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 relative shadow-inner flex items-center justify-center">
              {activeMediaType === 'photo' && hasPhotos && (
                <img
                  src={property.photos![activeMediaIndex]?.url}
                  alt={`${property.title} preview`}
                  className="w-full h-full object-contain sm:object-cover transition-all duration-300"
                />
              )}
              {activeMediaType === 'video' && hasVideo && (
                <video
                  src={property.videoUrl || property.video?.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )}
              <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-950/70 backdrop-blur-xs text-white text-[10px] font-bold">
                {activeMediaType === 'photo' ? 'High-Res Photo' : 'HD Video Clip'}
              </div>
            </div>

            {/* Amazon/Flipkart Thumbnails Rail */}
            <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar">
              {hasPhotos &&
                property.photos!.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveMediaType('photo');
                      setActiveMediaIndex(idx);
                    }}
                    className={clsx(
                      'w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-100',
                      activeMediaType === 'photo' && activeMediaIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    )}
                  >
                    <img
                      src={photo.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

              {/* Video Thumbnail Button in the Rail */}
              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setActiveMediaType('video')}
                  className={clsx(
                    'w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-900 text-white flex flex-col items-center justify-center gap-1',
                    activeMediaType === 'video'
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-md'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  )}
                >
                  <Play className="w-5 h-5 fill-emerald-400 text-emerald-400" />
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-300">
                    Video
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* 4 Large Highlight KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-brand-50/60 dark:bg-brand-950/30 border border-brand-500/30 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-brand-600" />
              Asking Price
            </span>
            <span className="text-base font-black text-brand-700 dark:text-brand-600 block">
              {formatRupees(property.priceDemandPaise)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted flex items-center gap-1">
              <Maximize2 className="w-3 h-3 text-brand-600" />
              Size & Area
            </span>
            <span className="text-base font-bold text-ink block">
              {property.size.value} {property.size.unit.toUpperCase()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted flex items-center gap-1">
              <Compass className="w-3 h-3 text-brand-600" />
              Facing
            </span>
            <span className="text-base font-bold text-ink block">
              {property.facing || 'North-East'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-border space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted flex items-center gap-1">
              <MapPin className="w-3 h-3 text-brand-600" />
              Locality
            </span>
            <span className="text-base font-bold text-ink block truncate">
              {property.locality}
            </span>
          </div>
        </div>

        {/* Description */}
        {property.description && (
          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-ink uppercase tracking-wider text-[10px]">
              Property Description & Highlights
            </span>
            <p className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border text-slate-700 dark:text-slate-300 leading-relaxed">
              {property.description}
            </p>
          </div>
        )}

        {/* ======================================================== */}
        {/* OWNER PRIVACY VAULT                                      */}
        {/* ======================================================== */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-surface to-brand-50/40 dark:to-brand-950/20 border border-brand-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <div>
                <h4 className="text-xs font-black text-ink uppercase tracking-wider font-heading">
                  Owner Privacy Vault
                </h4>
                <p className="text-[10px] text-muted">
                  Protects broker exclusivity. Only authorized account can view owner contact.
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOwnerRevealed(!isOwnerRevealed)}
              className="px-3 py-1.5 rounded-full bg-surface border border-border hover:border-brand-600/40 text-xs font-bold text-brand-700 dark:text-brand-600 flex items-center gap-1.5 transition cursor-pointer"
            >
              {isOwnerRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isOwnerRevealed ? 'Hide Details' : 'Reveal Contact'}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Owner Name</span>
              <span className="font-bold text-ink">
                {isOwnerRevealed ? property.owner?.name || 'Direct Owner' : '•••••••• Gupta (Protected)'}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-muted uppercase font-bold block">Phone Number</span>
              <span className="font-bold text-ink font-mono">
                {isOwnerRevealed ? property.owner?.phone || '+91 98120 44321' : '+91 ••••• ••••• (Shielded)'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

// =========================================================================
// 4. PROPERTY SHARE & WHATSAPP FLYER PAGE
// =========================================================================
export const PropertySharePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { success, toast } = useToast();
  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSharingMedia, setIsSharingMedia] = useState(false);
  const [flyerMediaIndex, setFlyerMediaIndex] = useState<number>(0);
  const [flyerMediaType, setFlyerMediaType] = useState<'photo' | 'video'>('photo');

  const agencyDisplayName = user?.agency?.name || user?.name || 'Verified Broker';

  useEffect(() => {
    if (id) {
      fetchPropertyById(id).then((p) => {
        setProperty(p);
        if (p.photos && p.photos.length > 0) {
          setFlyerMediaType('photo');
          setFlyerMediaIndex(0);
        } else if (p.videoUrl || p.video?.url) {
          setFlyerMediaType('video');
        }
      });
    }
  }, [id]);

  if (!property) {
    return (
      <div className="p-8 text-center text-xs text-muted">
        Loading property flyer...
      </div>
    );
  }

  const shareText = `*${property.title}*\nLocation: ${property.locality}, ${property.city || 'Panipat'}\nSize: ${property.size.value} ${property.size.unit.toUpperCase()}\nFacing: ${property.facing || 'Prime Facing'}\nDemand: ${formatRupees(property.priceDemandPaise)}\n\nHighlights: ${property.description || 'Verified clear title property ready for inspection.'}\n\nMarketed by: ${agencyDisplayName} · ${property.city || 'Panipat'}\nView Verified Flyer & Media: https://leadnivash.com/flyer/${property._id}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    success('WhatsApp share message copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Direct media download pack (allows direct drag-and-drop into WhatsApp Web/Desktop)
  const handleDownloadMediaPack = () => {
    if (property.photos && property.photos.length > 0) {
      property.photos.forEach((photo, idx) => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_media_${idx + 1}.jpg`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
      success(`Downloaded ${property.photos.length} photos! Attach directly to your WhatsApp chat.`);
    } else {
      toast('No attached photos found to download.', 'info');
    }
  };

  // Direct native media share sheet (WhatsApp on Mobile natively attaches media)
  const handleShareDirectMedia = async () => {
    setIsSharingMedia(true);
    try {
      if (property.photos && property.photos.length > 0 && typeof navigator.share === 'function') {
        const filesToShare: File[] = [];

        // Attempt to fetch first 2 photos as files
        for (let i = 0; i < Math.min(property.photos.length, 2); i++) {
          try {
            const photoUrl = property.photos[i].url;
            const res = await fetch(photoUrl, { mode: 'cors' });
            const blob = await res.blob();
            const file = new File(
              [blob],
              `${property.title.replace(/[^a-zA-Z0-9]/g, '_')}_${i + 1}.jpg`,
              { type: blob.type || 'image/jpeg' }
            );
            filesToShare.push(file);
          } catch {
            // If CORS or local blob, skip file packaging
          }
        }

        if (filesToShare.length > 0 && navigator.canShare && navigator.canShare({ files: filesToShare })) {
          await navigator.share({
            title: property.title,
            text: shareText,
            files: filesToShare,
          });
          success('Property flyer and photos shared directly via media!');
          return;
        }
      }

      // Desktop / fallback: Download media pack + open WhatsApp chat
      handleDownloadMediaPack();
      window.open(whatsappUrl, '_blank');
      success('Photos downloaded! Attach them directly to WhatsApp chat.');
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        window.open(whatsappUrl, '_blank');
      }
    } finally {
      setIsSharingMedia(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto pb-16 text-left">
      {/* Back button */}
      <Link
        to={`/app/properties/${property._id}`}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-ink transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Property Details</span>
      </Link>

      {/* Masked Flyer Card */}
      <Card className="p-6 space-y-5 border-emerald-500/40 shadow-2xl relative overflow-hidden bg-white dark:bg-slate-900">
        {/* Top Watermark Agency Header */}
        <div className="p-3 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-black text-white text-xs">
              {(agencyDisplayName || 'LN').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold leading-tight">{agencyDisplayName}</h4>
              <span className="text-[10px] text-emerald-400 font-medium">{property.city || 'Panipat'} · Verified Listing</span>
            </div>
          </div>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
            Exclusive
          </span>
        </div>

        {/* Interactive Media Preview Gallery (Amazon/Flipkart Style) */}
        {(property.photos && property.photos.length > 0) || property.videoUrl || property.video?.url ? (
          <div className="space-y-2">
            <div className="w-full h-56 sm:h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/90 relative flex items-center justify-center">
              {flyerMediaType === 'photo' && property.photos && property.photos.length > 0 && (
                <img
                  src={property.photos[flyerMediaIndex]?.url}
                  alt={property.title}
                  className="w-full h-full object-contain sm:object-cover transition-all duration-300"
                />
              )}
              {flyerMediaType === 'video' && (property.videoUrl || property.video?.url) && (
                <video
                  src={property.videoUrl || property.video?.url}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              )}
              <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3 text-emerald-400" />
                <span>
                  {flyerMediaType === 'photo'
                    ? `Photo ${flyerMediaIndex + 1} of ${property.photos?.length || 0}`
                    : 'Video Clip'}
                </span>
              </div>
            </div>

            {/* Thumbnail Rail */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
              {property.photos &&
                property.photos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFlyerMediaType('photo');
                      setFlyerMediaIndex(idx);
                    }}
                    className={clsx(
                      'w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-100',
                      flyerMediaType === 'photo' && flyerMediaIndex === idx
                        ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-md'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    )}
                  >
                    <img src={photo.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}

              {(property.videoUrl || property.video?.url) && (
                <button
                  type="button"
                  onClick={() => setFlyerMediaType('video')}
                  className={clsx(
                    'w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-900 text-white flex flex-col items-center justify-center gap-0.5',
                    flyerMediaType === 'video'
                      ? 'border-emerald-600 ring-2 ring-emerald-500/30 scale-105 shadow-md'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  )}
                >
                  <Play className="w-4 h-4 fill-emerald-400 text-emerald-400" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-300">
                    Video
                  </span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border text-center text-xs text-muted">
            <ImageIcon className="w-6 h-6 text-muted mx-auto mb-1 opacity-50" />
            <span>No listing photos attached yet.</span>
          </div>
        )}

        {/* Property Highlights */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold text-muted tracking-wider">
            {property.category} · {property.type}
          </span>
          <h2 className="text-xl font-black text-ink font-heading">
            {property.title}
          </h2>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400">
            {formatRupees(property.priceDemandPaise)}
          </p>
        </div>

        {/* Feature Pill Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border">
            <span className="text-muted block text-[10px] font-bold uppercase">Plot Area</span>
            <span className="font-bold text-ink">{property.size.value} {property.size.unit.toUpperCase()}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border">
            <span className="text-muted block text-[10px] font-bold uppercase">Locality</span>
            <span className="font-bold text-ink">{property.locality}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border">
            <span className="text-muted block text-[10px] font-bold uppercase">Facing</span>
            <span className="font-bold text-ink">{property.facing || 'North-East'}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-border">
            <span className="text-muted block text-[10px] font-bold uppercase">Status</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">Available</span>
          </div>
        </div>

        {/* Watermark Banner Stamp */}
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-center text-xs text-emerald-900 dark:text-emerald-300 font-bold flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Watermarked: Owner phone number hidden to protect broker brokerage.</span>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Direct Media Share Button (Native Mobile Share with attached media or auto-download) */}
          <button
            onClick={handleShareDirectMedia}
            disabled={isSharingMedia}
            className="w-full py-3 px-4 rounded-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/25 transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>
              {isSharingMedia
                ? 'Preparing Media...'
                : 'Share via WhatsApp (Direct Media Attached)'}
            </span>
          </button>

          {/* Download Photos & Video Pack */}
          {property.photos && property.photos.length > 0 && (
            <button
              onClick={handleDownloadMediaPack}
              className="w-full py-2.5 px-4 rounded-full bg-surface border border-emerald-600/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download Media Pack ({property.photos.length} Photos)</span>
            </button>
          )}

          {/* Fallback Pre-filled Text Link */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-full border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-ink font-bold text-[11px] flex items-center justify-center gap-1.5 transition text-center cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp Text Link</span>
            </a>

            <button
              onClick={handleCopy}
              className="py-2.5 px-3 rounded-full border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-muted hover:text-ink font-bold text-[11px] flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Flyer Text'}</span>
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
};

// Edit Page alias
export const PropertyEditPage: React.FC = () => {
  return <PropertyNewPage />;
};
