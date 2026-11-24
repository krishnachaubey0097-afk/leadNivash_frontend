import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  AlertCircle,
  ShieldCheck,
  Download,
  Send,
  Trash2,
  Edit2,
  RotateCcw,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PropertyCardSkeleton, PropertyDetailSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../auth/AuthProvider';
import {
  fetchProperties,
  fetchPropertyById,
  createProperty,
  updateProperty,
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
  const { toast } = useToast();
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'hold' | 'sold'>('all');
  const [propertyToDelete, setPropertyToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  const confirmDeleteProperty = async () => {
    if (!propertyToDelete) return;
    setIsDeletingProperty(true);
    try {
      await deleteProperty(propertyToDelete.id);
      setProperties((prev) => prev.filter((p) => p._id !== propertyToDelete.id));
      toast(`Property "${propertyToDelete.title}" removed from inventory.`, 'success');
      setPropertyToDelete(null);
    } catch {
      toast('Failed to delete property listing. Please try again.', 'error');
    } finally {
      setIsDeletingProperty(false);
    }
  };

  const loadProperties = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchProperties();
      setProperties(Array.isArray(data) ? data : []);
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
    loadProperties();

    const handleSync = () => loadProperties(true);
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') handleSync();
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleSync);
    window.addEventListener('online', handleSync);
    window.addEventListener('leadnivash_data_changed', handleSync);

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') handleSync();
    }, 10000);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleSync);
      window.removeEventListener('online', handleSync);
      window.removeEventListener('leadnivash_data_changed', handleSync);
      clearInterval(interval);
    };
  }, []);

  // Filter chips definition per Prompt 2
  const statusFilters: Array<{ label: string; value: 'all' | 'available' | 'hold' | 'sold' }> = [
    { label: 'All', value: 'all' },
    { label: 'Available', value: 'available' },
    { label: 'On Hold', value: 'hold' },
    { label: 'Sold / Closed', value: 'sold' },
  ];

  // Client-side instant filter & search logic
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // 1. Status Filter
      if (filterStatus === 'available' && p.status !== 'available') return false;
      if (filterStatus === 'hold' && p.status !== 'hold') return false;
      if (filterStatus === 'sold' && p.status !== 'sold' && p.status !== 'rented') return false;

      // 2. Search Query (locality, property type or ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesLocality =
          (p.locality || '').toLowerCase().includes(q) || (p.city || '').toLowerCase().includes(q);
        const matchesType =
          (p.type || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
        const matchesId = p._id.toLowerCase().includes(q) || p._id.slice(-6).toLowerCase().includes(q);
        const matchesTitle = (p.title || '').toLowerCase().includes(q);

        if (!matchesLocality && !matchesType && !matchesId && !matchesTitle) {
          return false;
        }
      }

      return true;
    });
  }, [properties, filterStatus, searchQuery]);

  // Format relative or readable update date
  const formatLastUpdated = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-4 pb-12 max-w-5xl mx-auto text-left">
      {/* ── 1. TOP SECTION ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-ink leading-tight">
              My Properties
            </h1>
            {!isLoading && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold text-brand-700 bg-brand-50 border border-brand-200/60">
                {properties.length}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-secondary text-muted mt-0.5 truncate">
            Manage your listings and availability.
          </p>
        </div>

        <Link to="/app/properties/new" className="shrink-0">
          <Button
            variant="primary"
            size="md"
            className="gap-1.5 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            <span>Add Property</span>
          </Button>
        </Link>
      </div>

      {/* ── 2. FULL-WIDTH SEARCH FIELD ── */}
      <div className="relative w-full">
        <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by locality, property type or ID"
          className="w-full pl-10 pr-9 min-h-[48px] bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 focus:border-transparent transition-all shadow-card"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted hover:text-ink transition cursor-pointer"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── 3. HORIZONTALLY SCROLLABLE FILTER CHIPS ── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none touch-pan-x">
        {statusFilters.map((f) => {
          const isSelected = filterStatus === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilterStatus(f.value)}
              className={clsx(
                'px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 border',
                isSelected
                  ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                  : 'bg-white text-muted border-border hover:text-ink hover:border-slate-300'
              )}
            >
              {f.label}
              {f.value !== 'all' && (
                <span className="ml-1.5 opacity-80 text-[11px]">
                  {f.value === 'sold'
                    ? properties.filter((p) => p.status === 'sold' || p.status === 'rented').length
                    : properties.filter((p) => p.status === f.value).length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── 4. LOADING SKELETONS & ERROR STATES ── */}
      {fetchError ? (
        <div className="p-4 bg-danger-bg border border-danger/20 rounded-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-secondary text-danger">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button
            type="button"
            onClick={() => loadProperties(false)}
            className="flex items-center gap-1 text-xs font-semibold hover:underline shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Retry</span>
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      ) : properties.length === 0 ? (
        /* ── 5. EMPTY STATE: NO PROPERTIES IN INVENTORY ── */
        <Card className="p-8 sm:p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-card bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-card-title font-semibold text-ink">
              No properties yet
            </h3>
            <p className="text-secondary text-muted leading-relaxed">
              Add your first property to start managing your inventory and finding buyer matches.
            </p>
          </div>
          <div className="pt-1">
            <Link to="/app/properties/new">
              <Button variant="primary" size="md">
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Add Property</span>
              </Button>
            </Link>
          </div>
        </Card>
      ) : filteredProperties.length === 0 ? (
        /* ── 5B. EMPTY STATE: NO SEARCH MATCHES ── */
        <Card className="p-8 text-center space-y-3">
          <div className="w-11 h-11 rounded-card bg-surface-hover text-muted flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-card-title font-semibold text-ink">
              No matching properties
            </h3>
            <p className="text-secondary text-muted leading-relaxed">
              {searchQuery
                ? `No properties match "${searchQuery}". Try adjusting your search term or filters.`
                : 'No properties found for the selected filter.'}
            </p>
          </div>
          <div className="pt-1">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('all');
              }}
            >
              <span>Clear Filters</span>
            </Button>
          </div>
        </Card>
      ) : (
        /* ── 6. COMPACT INFORMATION-RICH PROPERTY CARDS ── */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredProperties.map((prop) => {
            const hasPhotos = prop.photos && prop.photos.length > 0;
            const hasVideo = !!(prop.videoUrl || prop.video?.url);
            const lastUpdated = formatLastUpdated(prop.updatedAt || prop.createdAt);

            return (
              <Card
                key={prop._id}
                className="p-4 flex flex-col justify-between hover:border-brand-600/30 transition-all shadow-card group text-left relative overflow-hidden"
              >
                <div>
                  {/* Photo / Media Preview Header if media exists */}
                  {hasPhotos ? (
                    <div className="w-full h-36 sm:h-40 rounded-card overflow-hidden relative mb-3 bg-slate-100">
                      <img
                        src={prop.photos![0].url}
                        alt={prop.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-200"
                        loading="lazy"
                      />
                      {/* Availability status badge overlay */}
                      <div className="absolute top-2.5 left-2.5">
                        <span
                          className={clsx(
                            'px-2.5 py-0.5 rounded-full text-xs font-semibold shadow-xs',
                            prop.status === 'available'
                              ? 'bg-brand-50 text-brand-700 border border-brand-200/80'
                              : prop.status === 'hold'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                          )}
                        >
                          {prop.status === 'available'
                            ? 'Available'
                            : prop.status === 'hold'
                              ? 'On Hold'
                              : 'Sold'}
                        </span>
                      </div>

                      {/* Photo & Video counter overlay */}
                      <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
                        {prop.photos!.length > 1 && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-meta font-medium flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            <span>{prop.photos!.length}</span>
                          </span>
                        )}
                        {hasVideo && (
                          <span className="px-2 py-0.5 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-meta font-medium flex items-center gap-1">
                            <Play className="w-3 h-3 fill-current text-brand-400" />
                            <span>Video</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* If no photos, show a clean header row without wasting vertical space */
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={clsx(
                          'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                          prop.status === 'available'
                            ? 'bg-brand-50 text-brand-700 border border-brand-200/80'
                            : prop.status === 'hold'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                        )}
                      >
                        {prop.status === 'available'
                          ? 'Available'
                          : prop.status === 'hold'
                            ? 'On Hold'
                            : 'Sold'}
                      </span>
                      <span className="text-meta text-muted font-medium">
                        {prop.category} · {prop.type}
                      </span>
                    </div>
                  )}

                  {/* Title & Locality */}
                  <div className="space-y-1">
                    <h3 className="text-card-title font-semibold text-ink line-clamp-1 group-hover:text-brand-700 transition-colors">
                      {prop.title}
                    </h3>
                    <div className="flex items-center gap-1 text-secondary text-muted text-xs">
                      <MapPin className="w-3.5 h-3.5 text-muted shrink-0" />
                      <span className="truncate">
                        {prop.locality}{prop.city ? `, ${prop.city}` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Prominent Price & Area Unit */}
                  <div className="mt-2.5 pt-2 border-t border-border flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-lg sm:text-xl font-bold text-ink leading-tight block">
                        {formatRupees(prop.priceDemandPaise)}
                      </span>
                      <span className="text-[11px] text-muted">Asking Demand</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-700 bg-surface px-2 py-0.5 rounded border border-border inline-block">
                        {prop.size.value} {prop.size.unit.toUpperCase()}
                      </span>
                      {prop.facing && (
                        <span className="text-[11px] text-muted block mt-0.5">
                          {prop.facing} Facing
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata: Updated timestamp & tags */}
                  <div className="mt-2 pt-2 border-t border-border flex items-center justify-between text-meta text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{lastUpdated ? `Updated ${lastUpdated}` : `ID: ${prop._id.slice(-6)}`}</span>
                    </span>
                    <span className="text-[11px] text-muted">
                      {prop.category} · {prop.type}
                    </span>
                  </div>
                </div>

                {/* Card Action Row: Clear View Details + Actions */}
                <div className="mt-3.5 pt-3 border-t border-border flex items-center gap-2">
                  <Link to={`/app/properties/${prop._id}`} className="flex-1">
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full justify-center text-xs font-semibold"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>

                  <Link
                    to={`/app/properties/${prop._id}/share`}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-input border border-border text-muted hover:text-ink hover:bg-surface-hover transition cursor-pointer"
                    title="Share Flyer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </Link>

                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `*${prop.title}*\nLocation: ${prop.locality}, ${prop.city}\nSize: ${prop.size.value} ${prop.size.unit.toUpperCase()}\nPrice: ${formatRupees(
                        prop.priceDemandPaise
                      )}\n\nVerified Flyer & Photos: https://leadnivash.com/flyer/${prop._id}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-input border border-border text-brand-700 hover:bg-brand-50 transition cursor-pointer"
                    title="WhatsApp Pitch"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </a>

                  <Link
                    to={`/app/properties/${prop._id}/edit`}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-input border border-border text-muted hover:text-ink hover:bg-surface-hover transition cursor-pointer"
                    title="Edit Listing"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => setPropertyToDelete({ id: prop._id, title: prop.title })}
                    className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center rounded-input border border-border text-muted hover:text-danger hover:bg-danger-bg transition cursor-pointer"
                    title="Delete Listing"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog before deleting property */}
      <ConfirmDialog
        open={Boolean(propertyToDelete)}
        onOpenChange={(open) => {
          if (!open) setPropertyToDelete(null);
        }}
        title="Delete Property Listing"
        description={`Are you sure you want to delete "${propertyToDelete?.title}"? This listing will be moved to trash and removed from instant buyer matching.`}
        confirmText="Yes, Delete Property"
        isLoading={isDeletingProperty}
        onConfirm={confirmDeleteProperty}
      />
    </div>
  );
};

// =========================================================================
// 2. PROPERTY CREATION & EDIT FLOW PAGE (Add Property Flow)
// =========================================================================
export const PropertyNewPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { toast } = useToast();

  const [type, setType] = useState<CreatePropertyDto['type']>('Floor');
  const [category, setCategory] = useState<'Residential' | 'Commercial'>('Residential');
  const [title, setTitle] = useState('');
  const [locality, setLocality] = useState('Model Town');
  const [city, setCity] = useState('Panipat');
  const [sizeValue, setSizeValue] = useState<number | ''>(250);
  const [sizeUnit, setSizeUnit] = useState<'gaj' | 'marla' | 'sqft' | 'kanal' | 'acre' | 'bigha'>('gaj');
  const [priceInLakhs, setPriceInLakhs] = useState<number | ''>(125);
  const [facing, setFacing] = useState('North-East');
  const [ownerName, setOwnerName] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(isEditMode);

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
    'Sector 24',
    'GT Road',
    'HUDA Sector 25',
    'Chandni Bagh',
    'Eldeco Estate',
    'Industrial Area',
    'Tehsil Camp',
  ];

  const propertyTypes: Array<CreatePropertyDto['type']> = [
    'Floor',
    'Plot',
    'Kothi',
    'Flat',
    'Shop',
    'Other',
  ];

  // Haryana & National Land Unit Standards per Prompt 2 requirements
  const unitOptions = [
    { value: 'gaj', label: 'Gaj (Sq. Yards · 9 sq ft)' },
    { value: 'marla', label: 'Marla (Haryana / Panipat · 225 sq ft)' },
    { value: 'sqft', label: 'Square Feet (Sq.Ft)' },
    { value: 'kanal', label: 'Kanal (20 Marla · 500 Gaj)' },
    { value: 'acre', label: 'Acre (4,840 Gaj · 43,560 sq ft)' },
    { value: 'bigha', label: 'Bigha (Standard local measure)' },
  ];

  // Pre-load existing property if editing
  useEffect(() => {
    if (id) {
      setIsLoadingExisting(true);
      fetchPropertyById(id)
        .then((p) => {
          setType(p.type);
          setCategory(p.category);
          setTitle(p.title);
          setLocality(p.locality);
          setCity(p.city || 'Panipat');
          setSizeValue(p.size.value);
          setSizeUnit(p.size.unit as any);
          setPriceInLakhs(Number((p.priceDemandPaise / 10000000).toFixed(2)));
          setFacing(p.facing || 'North-East');
          setOwnerName(p.owner?.name || '');
          setOwnerPhone(p.owner?.phone || '');
          setDescription(p.description || '');
          if (p.photos && p.photos.length > 0) {
            setPhotos(p.photos);
          }
          if (p.videoUrl || p.video?.url) {
            setVideoPreviewUrl(p.videoUrl || p.video?.url || null);
          }
        })
        .catch(() => {
          toast('Unable to load property details for editing.', 'error');
          navigate('/app/properties');
        })
        .finally(() => {
          setIsLoadingExisting(false);
        });
    }
  }, [id, navigate, toast]);

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
      toast('Please select or specify a locality.', 'error');
      return;
    }
    if (!priceInLakhs || Number(priceInLakhs) <= 0) {
      toast('Please enter a valid asking price.', 'error');
      return;
    }
    if (!sizeValue || Number(sizeValue) <= 0) {
      toast('Please enter a valid area size.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const priceDemandPaise = Math.round(Number(priceInLakhs) * 100000 * 100);

      const photoPayload = photos.map((p) => ({
        url: p.url,
        publicId: p.publicId,
      }));

      const defaultTitle = `${sizeValue} ${sizeUnit.toUpperCase()} ${type} in ${locality}`;
      const payload: CreatePropertyDto = {
        title: title.trim() || defaultTitle,
        type,
        category,
        locality,
        city,
        size: {
          value: Number(sizeValue),
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
      };

      if (isEditMode && id) {
        await updateProperty(id, payload);
        toast('Property listing updated successfully!', 'success');
      } else {
        await createProperty(payload);
        toast('Property listing added to inventory!', 'success');
      }

      setTimeout(() => navigate('/app/properties'), 500);
    } catch (err: any) {
      toast(err.message || 'Could not save property. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingExisting) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto pb-16">
        <PropertyDetailSkeleton />
      </div>
    );
  }

  const numericPrice = typeof priceInLakhs === 'number' ? priceInLakhs : 0;
  const formattedPricePreview =
    numericPrice >= 100
      ? `₹${(numericPrice / 100).toFixed(2)} Cr`
      : numericPrice > 0
        ? `₹${numericPrice} Lakhs`
        : '₹0';

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-16 text-left">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Link>
        <span className="text-meta font-medium text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
          {isEditMode ? 'Edit Mode' : 'New Listing'}
        </span>
      </div>

      <Card className="p-4 sm:p-6 space-y-5 shadow-card">
        <div>
          <h1 className="text-page-title font-semibold text-ink leading-tight">
            {isEditMode ? 'Edit Property Listing' : 'Add Property'}
          </h1>
          <p className="text-secondary text-muted mt-0.5">
            {isEditMode
              ? 'Update listing specifications, pricing and media assets.'
              : 'Add listing details, media walkthroughs, and protected owner contact.'}
          </p>
        </div>

        {uploadError && (
          <div className="p-3 rounded-input bg-danger-bg border border-danger/20 text-danger text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-sm">
          {/* ── 1. BASIC DETAILS ── */}
          <div className="space-y-3 pb-4 border-b border-border">
            <h2 className="text-section-title font-semibold text-ink">
              1. Basic Information
            </h2>

            {/* Category Segmented Control */}
            <div className="space-y-1.5">
              <label className="text-secondary font-medium text-ink block">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Residential', 'Commercial'] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={clsx(
                      'min-h-[44px] rounded-input text-xs font-semibold transition-colors cursor-pointer border',
                      category === cat
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-white text-muted border-border hover:text-ink hover:border-slate-300'
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Property Type Grid */}
            <div className="space-y-1.5">
              <label className="text-secondary font-medium text-ink block">Property Type</label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {propertyTypes.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={clsx(
                      'min-h-[44px] rounded-input text-xs font-semibold transition-colors cursor-pointer border',
                      type === t
                        ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                        : 'bg-white text-muted border-border hover:text-ink hover:border-slate-300'
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Title (Optional) */}
            <div className="space-y-1.5">
              <label className="text-secondary font-medium text-ink block">
                Listing Headline / Title <span className="text-muted font-normal text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. 3 BHK Luxury ${type} with Stilt Parking`}
                className="w-full min-h-[48px] px-3.5 bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>

            {/* Facing Direction */}
            <div className="space-y-1.5">
              <label className="text-secondary font-medium text-ink block">Facing Direction</label>
              <select
                value={facing}
                onChange={(e) => setFacing(e.target.value)}
                className="w-full min-h-[48px] px-3 bg-white border border-border rounded-input text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
              >
                <option value="North">North</option>
                <option value="North-East">North-East</option>
                <option value="East">East</option>
                <option value="South-East">South-East</option>
                <option value="South">South</option>
                <option value="West">West</option>
                <option value="North-West">North-West</option>
              </select>
            </div>
          </div>

          {/* ── 2. LOCATION ── */}
          <div className="space-y-3 pb-4 border-b border-border">
            <h2 className="text-section-title font-semibold text-ink">
              2. Location
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-secondary font-medium text-ink block">Locality</label>
                <select
                  value={locality}
                  onChange={(e) => setLocality(e.target.value)}
                  className="w-full min-h-[48px] px-3 bg-white border border-border rounded-input text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {localitiesList.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-secondary font-medium text-ink block">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Panipat"
                  className="w-full min-h-[48px] px-3.5 bg-white border border-border rounded-input text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
              </div>
            </div>
          </div>

          {/* ── 3. SIZE & PRICING (WITH HARYANA MARLA STANDARDS) ── */}
          <div className="space-y-3 pb-4 border-b border-border">
            <h2 className="text-section-title font-semibold text-ink">
              3. Size & Pricing
            </h2>

            {/* Area Size & Full Unit Options without truncation */}
            <div className="space-y-1.5">
              <label className="text-secondary font-medium text-ink block">Area Size & Unit</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                  type="number"
                  inputMode="numeric"
                  value={sizeValue}
                  onChange={(e) => setSizeValue(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="250"
                  className="w-full min-h-[48px] px-3.5 bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                />

                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value as any)}
                  className="w-full min-h-[48px] px-3 bg-white border border-border rounded-input text-sm font-medium text-ink focus:outline-none focus:ring-2 focus:ring-brand-600"
                >
                  {unitOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-meta text-muted">
                Haryana Marla standard (225 sq ft / 25 Gaj) applied automatically during buyer matching.
              </p>
            </div>

            {/* Asking Price Demand with Real-Time Preview */}
            <div className="p-3.5 rounded-card bg-surface border border-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-secondary font-medium text-ink">
                  Asking Price Demand
                </label>
                <span className="text-sm font-bold text-brand-700">
                  {formattedPricePreview}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted font-bold text-sm">
                  ₹
                </span>
                <input
                  type="number"
                  step="0.5"
                  inputMode="decimal"
                  value={priceInLakhs}
                  onChange={(e) => setPriceInLakhs(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Price in Lakhs (e.g. 85 or 125)"
                  className="w-full pl-8 pr-16 min-h-[48px] bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">
                  Lakhs
                </span>
              </div>
            </div>
          </div>

          {/* ── 4. MEDIA UPLOADS: PHOTOS & WALKTHROUGH VIDEO ── */}
          <div className="space-y-3 pb-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-section-title font-semibold text-ink flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-brand-600" />
                  <span>4. Photos & Walkthrough Video</span>
                </h2>
                <p className="text-secondary text-muted text-xs mt-0.5">
                  Up to 4 property photos and 1 walkthrough video.
                </p>
              </div>
              <span className="text-meta text-muted">
                {photos.length}/4 Photos
              </span>
            </div>

            {/* Photo Previews Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="relative h-24 rounded-card overflow-hidden border border-border bg-slate-100"
                >
                  <img
                    src={photo.url}
                    alt={`Listing photo ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-slate-900/75 hover:bg-danger text-white flex items-center justify-center transition cursor-pointer"
                    title="Remove Photo"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-slate-900/70 text-white px-1.5 py-0.5 rounded font-medium">
                    Photo {idx + 1}
                  </span>
                </div>
              ))}

              {photos.length < 4 && (
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="h-24 rounded-card border-2 border-dashed border-border hover:border-brand-600 bg-surface-hover flex flex-col items-center justify-center gap-1 text-muted hover:text-brand-700 transition cursor-pointer"
                >
                  <Upload className="w-4 h-4 text-brand-600" />
                  <span className="text-xs font-semibold">+ Add Photo</span>
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
            <div className="pt-1">
              {videoPreviewUrl ? (
                <div className="relative rounded-card overflow-hidden border border-brand-200 bg-black">
                  <video
                    src={videoPreviewUrl}
                    controls
                    playsInline
                    className="w-full max-h-48 object-contain"
                  />
                  <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Play className="w-3.5 h-3.5 text-brand-400 fill-current" />
                      <span className="truncate max-w-[200px]">
                        {videoFile?.name || 'Walkthrough Video'}
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={removeVideo}
                      className="text-danger hover:underline text-xs font-semibold cursor-pointer"
                    >
                      Remove Video
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full min-h-[48px] px-4 rounded-input border border-dashed border-border hover:border-brand-600 bg-white flex items-center justify-center gap-2 text-xs font-semibold text-muted hover:text-brand-700 transition cursor-pointer"
                >
                  <VideoIcon className="w-4 h-4 text-brand-600" />
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

          {/* ── 5. OWNER PRIVACY VAULT ── */}
          <div className="p-4 rounded-card bg-surface border border-border space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span className="text-card-title font-semibold text-ink">
                  5. Owner Privacy Vault
                </span>
              </div>
              <span className="text-meta font-medium text-brand-700 bg-brand-50 border border-brand-200/60 px-2 py-0.5 rounded">
                Protected · Hidden on Flyers
              </span>
            </div>

            <p className="text-secondary text-muted text-xs">
              Owner contact information is encrypted and never exposed on shared flyers or public links.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Owner Name (e.g. Rajinder Gupta)"
                className="w-full min-h-[48px] px-3.5 bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
              <input
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                value={ownerPhone}
                onChange={(e) => setOwnerPhone(e.target.value)}
                placeholder="Owner Phone (+91 98120...)"
                className="w-full min-h-[48px] px-3.5 bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* ── 6. HIGHLIGHTS & NOTES ── */}
          <div className="space-y-1.5">
            <label className="text-secondary font-medium text-ink block">
              6. Highlights & Notes
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Wide 40ft road, park facing, modular kitchen, immediate registry title..."
              className="w-full p-3 bg-white border border-border rounded-input text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
            />
          </div>

          {/* ── 7. ACTIONS (SAVE & CANCEL) ── */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              className="w-full sm:flex-1 justify-center min-h-[48px] font-semibold shadow-sm"
            >
              {isSubmitting
                ? isEditMode
                  ? 'Saving Changes...'
                  : 'Saving Property...'
                : isEditMode
                  ? 'Update Property'
                  : 'Save Property'}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => navigate('/app/properties')}
              className="w-full sm:w-auto justify-center min-h-[48px]"
            >
              Cancel
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
  const { toast } = useToast();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [isOwnerRevealed, setIsOwnerRevealed] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<PropertyItem['status']>('available');
  const [activeMediaIndex, setActiveMediaIndex] = useState<number>(0);
  const [activeMediaType, setActiveMediaType] = useState<'photo' | 'video'>('photo');

  const handleDelete = async () => {
    if (!property) return;
    if (window.confirm(`Are you sure you want to permanently delete "${property.title}"?`)) {
      try {
        await deleteProperty(property._id);
        toast('Property listing deleted successfully.', 'success');
        navigate('/app/properties');
      } catch {
        toast('Failed to delete property listing.', 'error');
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
      <div className="p-8 text-center max-w-md mx-auto space-y-4 my-12 bg-white border border-border rounded-card shadow-card">
        <div className="w-12 h-12 rounded-card bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-xl">
          ⚠️
        </div>
        <h2 className="text-card-title font-semibold text-ink">Property Listing Removed</h2>
        <p className="text-secondary text-muted">
          This property listing has been deleted or moved to trash on your account.
        </p>
        <Link
          to="/app/properties"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-input bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Properties</span>
        </Link>
      </div>
    );
  }

  if (!property) {
    return <PropertyDetailSkeleton />;
  }

  const handleStatusChange = async (newStatus: PropertyItem['status']) => {
    setCurrentStatus(newStatus);
    await updatePropertyStatus(property._id, newStatus);
    toast(`Status updated to ${newStatus.toUpperCase()}`, 'success');
  };

  const hasPhotos = property.photos && property.photos.length > 0;
  const hasVideo = !!(property.videoUrl || property.video?.url);

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-16 text-left">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/app/properties"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Properties</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to={`/app/properties/${property._id}/edit`}
            className="px-3 py-1.5 rounded-input border border-border bg-white text-muted hover:text-ink text-xs font-semibold flex items-center gap-1.5 hover:bg-surface-hover transition"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </Link>

          <button
            type="button"
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-input border border-danger/30 bg-danger-bg text-danger text-xs font-semibold flex items-center gap-1.5 hover:bg-danger/10 transition cursor-pointer"
            title="Delete Listing"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>

          <Link to={`/app/properties/${property._id}/share`}>
            <Button size="sm" variant="primary" className="font-semibold text-xs flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Flyer</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Detail Card */}
      <Card className="p-4 sm:p-6 space-y-5 shadow-card">
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-meta font-medium uppercase text-muted px-2 py-0.5 rounded bg-surface border border-border">
                {property.category} · {property.type}
              </span>
              <span className="text-xs text-muted flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                ID: {property._id.slice(-6)}
              </span>
            </div>
            <h1 className="text-page-title font-semibold text-ink mt-1">
              {property.title}
            </h1>
          </div>

          {/* Status Segmented Buttons */}
          <div className="flex p-0.5 bg-surface-hover rounded-input border border-border">
            {(['available', 'hold', 'sold'] as const).map((st) => (
              <button
                key={st}
                onClick={() => handleStatusChange(st)}
                className={clsx(
                  'px-3 py-1.5 rounded-[8px] text-xs font-semibold capitalize transition-colors cursor-pointer',
                  currentStatus === st
                    ? st === 'available'
                      ? 'bg-brand-600 text-white shadow-xs'
                      : st === 'hold'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-900 text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Media Showcase */}
        {(hasPhotos || hasVideo) && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-ink">
              <span className="flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-brand-600" />
                <span>Media Gallery</span>
              </span>
              <span className="text-meta text-muted">
                {activeMediaType === 'photo'
                  ? `Photo ${activeMediaIndex + 1} of ${property.photos?.length || 0}`
                  : 'Video Walkthrough'}
              </span>
            </div>

            {/* Main Stage */}
            <div className="w-full h-64 sm:h-80 md:h-96 rounded-card overflow-hidden bg-slate-950 border border-border relative flex items-center justify-center">
              {activeMediaType === 'photo' && hasPhotos && (
                <img
                  src={property.photos![activeMediaIndex]?.url}
                  alt={`${property.title} preview`}
                  className="w-full h-full object-contain sm:object-cover"
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
            </div>

            {/* Thumbnails Rail */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
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
                      'w-16 h-16 rounded-card overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-100',
                      activeMediaType === 'photo' && activeMediaIndex === idx
                        ? 'border-brand-600 shadow-sm'
                        : 'border-border opacity-70 hover:opacity-100'
                    )}
                  >
                    <img
                      src={photo.url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}

              {hasVideo && (
                <button
                  type="button"
                  onClick={() => setActiveMediaType('video')}
                  className={clsx(
                    'w-16 h-16 rounded-card overflow-hidden shrink-0 border-2 transition-all cursor-pointer bg-slate-900 text-white flex flex-col items-center justify-center gap-1',
                    activeMediaType === 'video'
                      ? 'border-brand-600 shadow-sm'
                      : 'border-border opacity-70 hover:opacity-100'
                  )}
                >
                  <Play className="w-4 h-4 fill-brand-400 text-brand-400" />
                  <span className="text-[9px] font-semibold uppercase text-brand-300">
                    Video
                  </span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Highlight KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3.5 rounded-card bg-brand-50 border border-brand-200/60 space-y-1">
            <span className="text-meta uppercase font-semibold text-brand-700 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5" />
              Asking Price
            </span>
            <span className="text-base font-bold text-ink block">
              {formatRupees(property.priceDemandPaise)}
            </span>
          </div>

          <div className="p-3.5 rounded-card bg-surface border border-border space-y-1">
            <span className="text-meta uppercase font-semibold text-muted flex items-center gap-1">
              <Maximize2 className="w-3.5 h-3.5 text-muted" />
              Size & Area
            </span>
            <span className="text-base font-bold text-ink block">
              {property.size.value} {property.size.unit.toUpperCase()}
            </span>
          </div>

          <div className="p-3.5 rounded-card bg-surface border border-border space-y-1">
            <span className="text-meta uppercase font-semibold text-muted flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-muted" />
              Facing
            </span>
            <span className="text-base font-bold text-ink block">
              {property.facing || 'North-East'}
            </span>
          </div>

          <div className="p-3.5 rounded-card bg-surface border border-border space-y-1">
            <span className="text-meta uppercase font-semibold text-muted flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-muted" />
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
            <span className="font-semibold text-ink text-xs block">
              Property Description & Highlights
            </span>
            <p className="p-3.5 rounded-card bg-surface border border-border text-secondary leading-relaxed">
              {property.description}
            </p>
          </div>
        )}

        {/* Owner Privacy Vault Card */}
        <div className="p-4 rounded-card bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand-600" />
              <div>
                <h4 className="text-xs font-semibold text-ink">
                  Owner Privacy Vault
                </h4>
                <p className="text-meta text-muted">
                  Exclusive broker protection. Contact hidden from public flyers.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOwnerRevealed(!isOwnerRevealed)}
              className="px-3 py-1.5 rounded-input bg-white border border-border hover:border-brand-600 text-xs font-semibold text-brand-700 flex items-center gap-1.5 transition cursor-pointer"
            >
              {isOwnerRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isOwnerRevealed ? 'Hide' : 'Reveal Contact'}</span>
            </button>
          </div>

          <div className="p-3 rounded-card bg-white border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-meta text-muted block font-medium">Owner Name</span>
              <span className="font-semibold text-ink">
                {isOwnerRevealed ? property.owner?.name || 'Direct Owner' : '•••••••• Gupta (Protected)'}
              </span>
            </div>

            <div>
              <span className="text-meta text-muted block font-medium">Phone Number</span>
              <span className="font-semibold text-ink font-mono">
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
  const { toast } = useToast();
  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [copied, setCopied] = useState(false);

  const agencyDisplayName = user?.agency?.name || user?.name || 'Verified Broker';

  useEffect(() => {
    if (id) {
      fetchPropertyById(id).then((p) => {
        setProperty(p);
      });
    }
  }, [id]);

  if (!property) {
    return <PropertyDetailSkeleton />;
  }

  const shareText = `*${property.title}*\nLocation: ${property.locality}, ${property.city || 'Panipat'}\nSize: ${property.size.value} ${property.size.unit.toUpperCase()}\nFacing: ${property.facing || 'Prime Facing'}\nDemand: ${formatRupees(property.priceDemandPaise)}\n\nHighlights: ${property.description || 'Verified clear title property ready for inspection.'}\n\nMarketed by: ${agencyDisplayName} · ${property.city || 'Panipat'}\nView Verified Flyer & Media: https://leadnivash.com/flyer/${property._id}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    toast('WhatsApp share message copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

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
      toast(`Downloaded ${property.photos.length} photos! Attach directly to your WhatsApp chat.`, 'success');
    } else {
      toast('No attached photos found to download.', 'info');
    }
  };

  const handleShareDirectMedia = async () => {
    try {
      if (property.photos && property.photos.length > 0 && typeof navigator.share === 'function') {
        const filesToShare: File[] = [];

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
            // Ignore fetch failure for CORS
          }
        }

        if (filesToShare.length > 0 && navigator.canShare && navigator.canShare({ files: filesToShare })) {
          await navigator.share({
            title: property.title,
            text: shareText,
            files: filesToShare,
          });
          toast('Property flyer and photos shared!', 'success');
          return;
        }
      }

      handleDownloadMediaPack();
      window.open(whatsappUrl, '_blank');
    } catch {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto pb-16 text-left">
      <div className="flex items-center justify-between">
        <Link
          to={`/app/properties/${property._id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Details</span>
        </Link>
        <span className="text-meta font-medium text-brand-700 bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 rounded-full">
          Branded Flyer
        </span>
      </div>

      <Card className="p-4 sm:p-6 space-y-5 shadow-card">
        <div>
          <h1 className="text-page-title font-semibold text-ink leading-tight">
            Share Property Flyer
          </h1>
          <p className="text-secondary text-muted mt-0.5">
            Share with clients on WhatsApp with owner details securely protected.
          </p>
        </div>

        {/* Live Preview Box */}
        <div className="p-4 rounded-card bg-surface border border-border space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-border">
            <span className="font-semibold text-ink">Flyer Preview</span>
            <span className="text-brand-700 font-semibold">{agencyDisplayName}</span>
          </div>

          <div className="space-y-1.5 text-xs font-mono whitespace-pre-wrap bg-white p-3.5 rounded-input border border-border text-slate-700">
            {shareText}
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <Button
            variant="primary"
            size="md"
            onClick={handleShareDirectMedia}
            className="w-full justify-center min-h-[48px] font-semibold gap-2 shadow-sm"
          >
            <Send className="w-4 h-4" />
            <span>Share to WhatsApp with Photos</span>
          </Button>

          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={handleDownloadMediaPack}
              className="w-full justify-center min-h-[48px] text-xs gap-1.5"
            >
              <Download className="w-4 h-4 text-muted" />
              <span>Download Photos</span>
            </Button>

            <Button
              variant="secondary"
              size="md"
              onClick={handleCopy}
              className="w-full justify-center min-h-[48px] text-xs gap-1.5"
            >
              {copied ? <Check className="w-4 h-4 text-brand-600" /> : <Copy className="w-4 h-4 text-muted" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </Button>
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
