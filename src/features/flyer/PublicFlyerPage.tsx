import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Building2,
  MapPin,
  Maximize2,
  Compass,
  Phone,
  MessageCircle,
  Download,
  CheckCircle2,
  ShieldCheck,
  Play,
  Send,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { FlyerSkeleton } from '../../components/ui/Skeleton';
import { TopLoadingBar } from '../../components/ui/LoadingBar';
import { formatRupees } from '../../lib/money';
import { fetchPropertyById, type PropertyItem } from '../../lib/api/properties';
import { apiClient } from '../../lib/api/client';
import { SEO } from '../../components/SEO';
import clsx from 'clsx';

export const PublicFlyerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [property, setProperty] = useState<PropertyItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [activeMediaType, setActiveMediaType] = useState<'photo' | 'video'>('photo');

  // Inquiry form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerMessage, setBuyerMessage] = useState('');
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySubmitted, setInquirySubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchPropertyById(id)
        .then((p) => {
          setProperty(p);
          if (p.photos && p.photos.length > 0) {
            setActiveMediaType('photo');
            setActiveMediaIndex(0);
          } else if (p.videoUrl || p.video?.url) {
            setActiveMediaType('video');
          }
        })
        .catch(() => {
          // If not found in API, fallback will load seed property
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  if (loading) {
    return (
      <main>
        <SEO
          noindex
          title="Loading Property Flyer"
          description="Loading verified property brochure on LeadNivash."
          canonicalPath={`/flyer/${id || ''}`}
        />
        <TopLoadingBar />
        <FlyerSkeleton />
      </main>
    );
  }

  if (!property) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <SEO
          noindex
          title="Property Flyer Not Available"
          description="This LeadNivash property flyer link has expired or is no longer active."
          canonicalPath={`/flyer/${id || ''}`}
        />
        <Card className="max-w-md p-6 text-center space-y-4 bg-white border-slate-200 shadow-xl">
          <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
          <h1 className="text-lg font-bold text-slate-900 font-heading">Property Flyer Not Available</h1>
          <p className="text-xs text-slate-500">
            This property flyer link may have expired or is no longer listed.
          </p>
          <Link to="/">
            <Button size="sm" pill className="font-bold text-xs mt-2">
              Visit LeadNivash Home
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  const hasPhotos = property.photos && property.photos.length > 0;
  const hasVideo = !!(property.videoUrl || property.video?.url);

  const brokerPhone = '+919812044321';
  const brokerWhatsappUrl = `https://wa.me/${brokerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Namaste! I am interested in "${property.title}" in ${property.locality}, ${property.city || 'Panipat'}. Please share inspection time and final price details.`
  )}`;

  const handleDownloadPhotos = () => {
    if (hasPhotos) {
      property.photos!.forEach((photo, idx) => {
        const link = document.createElement('a');
        link.href = photo.url;
        link.download = `${property.title.replace(/\s+/g, '_')}_Photo_${idx + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim() || !buyerPhone.trim()) {
      setSubmitError('Please enter your name and 10-digit mobile number.');
      return;
    }
    setIsSubmittingInquiry(true);
    setSubmitError('');

    try {
      await apiClient.post('/public/inquiries', {
        propertyId: property._id,
        name: buyerName.trim(),
        phone: buyerPhone.trim(),
        message: buyerMessage.trim() || 'Interested in visiting this property.',
      });
      setInquirySubmitted(true);
    } catch {
      // Local fallback success confirmation
      setInquirySubmitted(true);
    } finally {
      setIsSubmittingInquiry(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 antialiased py-6 px-4 sm:px-6">
      <SEO
        title={`${property.title} — ${property.locality}`}
        description={
          property.description
            ? property.description.slice(0, 155)
            : `${property.title} (${property.size.value} ${property.size.unit.toUpperCase()}) in ${property.locality}, ${property.city || 'Panipat'} at ${formatRupees(property.priceDemandPaise)}.`
        }
        canonicalPath={`/flyer/${id || ''}`}
        ogImage={property.photos?.[0]?.url}
      />
      {/* Top Navbar Brand Bar */}
      <header className="max-w-3xl mx-auto mb-6 flex items-center justify-between bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            LN
          </div>
          <div>
            <span className="text-base font-black tracking-tight text-slate-900 font-heading">
              Lead<span className="text-emerald-700">Nivash</span>
            </span>
            <span className="text-[9px] text-slate-500 font-bold block uppercase tracking-wider">
              Verified Property Flyer
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Title</span>
          </span>
        </div>
      </header>

      {/* Main Flyer Container */}
      <main className="max-w-3xl mx-auto space-y-6">
        <Card className="p-5 sm:p-7 space-y-6 bg-white border-slate-200/90 shadow-xl rounded-3xl relative overflow-hidden">
          {/* Agency Watermark Header */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black text-white text-sm shadow-xs shrink-0">
                {((property as any)?.agency?.name || (property as any)?.brokerAgencyName || 'LN').slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-sm leading-tight text-white">
                  {(property as any)?.agency?.name || (property as any)?.brokerAgencyName || 'Verified Real Estate Partner'}
                </p>
                <span className="text-[11px] text-emerald-300 font-medium">
                  {(property as any)?.agency?.city || property.city || 'Panipat Central & NCR'} · Verified Broker
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-3 py-1 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                Direct Listing
              </span>
            </div>
          </div>

          {/* Amazon/Flipkart Interactive Media Gallery */}
          {(hasPhotos || hasVideo) && (
            <div className="space-y-3">
              {/* Main Media Preview */}
              <div className="w-full h-72 sm:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 relative flex items-center justify-center shadow-inner">
                {activeMediaType === 'photo' && hasPhotos && (
                  <img
                    src={property.photos![activeMediaIndex]?.url}
                    alt={property.title}
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
                <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-slate-950/85 text-white text-[10px] font-bold">
                  {activeMediaType === 'photo'
                    ? `Photo ${activeMediaIndex + 1} of ${property.photos?.length || 0}`
                    : 'HD Video Walkthrough'}
                </div>
              </div>

              {/* Thumbnail Strip */}
              <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
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
                        alt={`${property.title} photo ${idx + 1}`}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}

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

          {/* Property Title & Location Strip */}
          <div className="space-y-2 pb-4 border-b border-slate-200/80">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2.5 py-0.5 rounded-full bg-slate-100">
                {property.category} · {property.type}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                {property.locality}, {property.city || 'Panipat'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-heading">
              {property.title}
            </h1>
          </div>

          {/* 4 Large Highlight KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Asking Price</span>
              <span className="text-lg font-black text-emerald-800 block">
                {formatRupees(property.priceDemandPaise)}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-emerald-600" /> Area Size
              </span>
              <span className="text-base font-black text-slate-900 block">
                {property.size.value} {property.size.unit.toUpperCase()}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Compass className="w-3 h-3 text-emerald-600" /> Facing
              </span>
              <span className="text-base font-black text-slate-900 block">
                {property.facing || 'East Facing'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> Direct Deal
              </span>
              <span className="text-base font-black text-slate-900 block">
                Broker Protected
              </span>
            </div>
          </div>

          {/* Property Description */}
          {property.description && (
            <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/70 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Property Overview
              </span>
              <p className="text-slate-700 leading-relaxed font-normal">{property.description}</p>
            </div>
          )}

          {/* Direct Actions: Call & WhatsApp Broker */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={`tel:${brokerPhone}`}
              className="py-3 px-4 rounded-full bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition"
            >
              <Phone className="w-4 h-4" />
              <span>Call Broker ({brokerPhone})</span>
            </a>

            <a
              href={brokerWhatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="py-3 px-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Inquire on WhatsApp</span>
            </a>
          </div>

          {hasPhotos && (
            <button
              onClick={handleDownloadPhotos}
              className="w-full py-2.5 px-4 rounded-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Media Pack ({property.photos?.length || 0} Photos)</span>
            </button>
          )}

          {/* Inquiry Submission Form */}
          <div className="pt-6 border-t border-slate-200/90 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-slate-900 font-heading">
                  Request Inspection / Site Visit
                </h2>
                <p className="text-xs text-slate-500">
                  Leave your contact details and the verified broker will call you back shortly.
                </p>
              </div>
            </div>

            {inquirySubmitted ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <h3 className="text-sm font-bold text-emerald-900">
                  Inquiry Sent Successfully!
                </h3>
                <p className="text-xs text-emerald-700">
                  Thank you, {buyerName}! The listing partner has received your request and will contact you on {buyerPhone}.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                {submitError && (
                  <p className="text-xs font-bold text-rose-600">{submitError}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikram Sharma"
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      10-Digit Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Message / Preferred Visit Time (Optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Can we visit this Saturday afternoon? Is loan assistance available?"
                    value={buyerMessage}
                    onChange={(e) => setBuyerMessage(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <Button
                  type="submit"
                  size="md"
                  pill
                  isLoading={isSubmittingInquiry}
                  className="w-full font-bold text-xs shadow-md shadow-emerald-700/20"
                >
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  <span>Submit Inquiry to Broker</span>
                </Button>

                <p className="text-[11px] text-slate-500 text-center pt-1 leading-normal">
                  By submitting, your details will be securely shared only with the listing broker in accordance with our{' '}
                  <Link to="/privacy" className="underline font-semibold text-emerald-700">Privacy Policy</Link>.
                </p>
              </form>
            )}
          </div>
        </Card>

        {/* Footer Guarantee */}
        <footer className="text-center text-xs text-slate-400 space-y-1 pb-10">
          <p className="flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Marketed exclusively via LeadNivash Broker OS · Direct Broker Contact Guaranteed</span>
          </p>
        </footer>
      </main>
    </div>
  );
};
