import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles,
  Mic,
  MicOff,
  Check,
  Building2,
  Users,
  ShieldCheck,
  AlertCircle,
  Save,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Share2,
  Eye,
  CheckCircle2,
  FileCheck,
  Copy,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { parseMessage, commitParsedItem, type ParseResult } from '../../lib/api/parse';
import { useVoiceDictation } from '../../lib/hooks/useVoiceDictation';
import { fetchProperties, type PropertyItem } from '../../lib/api/properties';
import { createBuyer, fetchBuyers } from '../../lib/api/buyers';
import { createDeal } from '../../lib/api/deals';
import { formatRupees } from '../../lib/money';
import { useAuth } from '../auth/AuthProvider';
import { apiClient } from '../../lib/api/client';
import clsx from 'clsx';

export const PastePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error, toast } = useToast();

  const agencyDisplayName = user?.agency?.name || user?.name || 'Verified Broker';

  // Workflow Step: 'paste' (Step 1) | 'buyer-details' (Step 2) | 'matches' (Step 3) | 'listing-review' | 'listing-saved-matches'
  const [currentStep, setCurrentStep] = useState<
    'paste' | 'buyer-details' | 'matches' | 'listing-review' | 'listing-saved-matches'
  >('paste');

  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [dictationLang, setDictationLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');

  // Step 2: Editable Buyer Details
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerLocation, setBuyerLocation] = useState('Model Town');
  const [buyerType, setBuyerType] = useState('Floor');
  const [buyerBudgetLakhs, setBuyerBudgetLakhs] = useState<number>(100);
  const [buyerBedrooms, setBuyerBedrooms] = useState('3 BHK');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [isEditingBuyer, setIsEditingBuyer] = useState(false);
  const [buyerDuplicateWarning, setBuyerDuplicateWarning] = useState<string | null>(null);

  // Step 2: Editable Property Listing Details
  const [listingTitle, setListingTitle] = useState('');
  const [listingLocality, setListingLocality] = useState('');
  const [listingCity, setListingCity] = useState('Panipat');
  const [listingType, setListingType] = useState('Builder Floor');
  const [listingPrice, setListingPrice] = useState('');
  const [listingArea, setListingArea] = useState('200');
  const [listingUnit, setListingUnit] = useState('gaj');
  const [listingFacing, setListingFacing] = useState('North-East');
  const [listingOwnerPhone, setListingOwnerPhone] = useState('');
  const [listingNotes, setListingNotes] = useState('');
  const [savedPropertyId, setSavedPropertyId] = useState<string>('');

  // Saved active buyer record
  const [activeBuyerId, setActiveBuyerId] = useState<string | null>(null);

  // Step 3: Matching properties state
  const [matchedProperties, setMatchedProperties] = useState<
    Array<{
      property: PropertyItem;
      score: number;
      reasons: string[];
      mismatches: string[];
    }>
  >([]);
  const [isMatching, setIsMatching] = useState(false);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [inspectingProperty, setInspectingProperty] = useState<PropertyItem | null>(null);

  // Listing review state
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [listingBuyerMatches, setListingBuyerMatches] = useState<any[]>([]);
  const [totalBuyersCount, setTotalBuyersCount] = useState<number>(0);
  const [isLoadingListingMatches, setIsLoadingListingMatches] = useState<boolean>(false);

  // Voice dictation hook — GUARANTEED NON-REPEATING
  const { isListening, isSupported, interimTranscript, toggleListening } = useVoiceDictation({
    lang: dictationLang,
    onFinalTranscript: (finalChunk) => {
      // Append only finalized, non-repeating chunk to text
      setRawText((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk));
    },
  });

  // Pre-fill test samples
  const samples = [
    {
      label: 'Buyer: 3 BHK Gurgaon (80L)',
      text: 'Client wants a 3 BHK flat in Gurgaon, budget 80 lakh, preferably near a metro station. Contact: 9811223344.',
    },
    {
      label: 'Buyer: 3 BHK Model Town',
      text: 'Urgent buyer requirement: Need 3 BHK builder floor in Model Town or Sector 11 Panipat. Budget 1.10 to 1.35 Cr with lift & car parking. Client: Rajesh Sharma 9876543210.',
    },
    {
      label: 'Listing: 250 Gaj Sushant City',
      text: 'Available for Sale: Residential plot 250 gaj in Ansals Sushant City Sector 18 Panipat. North facing, 40 ft road, demand 85 Lakhs negotiable. Owner: 9812044321.',
    },
    {
      label: 'Buyer: Commercial Shop',
      text: 'Client looking for commercial shop on GT Road or Chandni Bagh Panipat. Budget 70 to 90 Lakhs for rental return. Contact: Vikram Verma 9876500002.',
    },
  ];

  // STEP 1: Analyse Message
  const handleAnalyze = async () => {
    if (!rawText.trim() || rawText.trim().length < 5) {
      toast('Please paste a WhatsApp property message or client requirement with at least 5 characters.', 'error');
      return;
    }

    setIsAnalyzing(true);
    setBuyerDuplicateWarning(null);
    try {
      const result = await parseMessage(rawText);
      setParseResult(result);

      if (result.itemType === 'buyer') {
        const b = result.extracted.buyer;
        const name = b?.name || 'Prospective Buyer';
        const phone = b?.phone || '';
        const loc = b?.localities?.[0] || 'Model Town';
        const typeStr = b?.propertyType?.replace(/_/g, ' ') || 'Floor';
        const budgetLakhs = b?.budgetMaxPaise
          ? Math.round(b.budgetMaxPaise / 10000000)
          : 120;
        const bhkStr = b?.bhk?.[0] ? `${b.bhk[0]} BHK` : '3 BHK';

        setBuyerName(name);
        setBuyerPhone(phone);
        setBuyerLocation(loc);
        setBuyerType(typeStr);
        setBuyerBudgetLakhs(budgetLakhs);
        setBuyerBedrooms(bhkStr);
        setBuyerNotes(rawText);

        // Check if phone number already exists in database
        if (phone) {
          const cleanPhone = phone.replace(/\D/g, '');
          const existingBuyers = await fetchBuyers();
          const match = existingBuyers.find((eb) => eb.phone.includes(cleanPhone));
          if (match) {
            setBuyerDuplicateWarning(
              `Existing client found: A buyer record already exists for ${match.name} (${match.phone}). This requirement can be linked to their account.`
            );
          }
        }

        setCurrentStep('buyer-details');
        success('Client requirement extracted successfully.');
      } else {
        const p = result.extracted.property;
        setListingTitle(p?.title || '3 BHK Luxury Builder Floor');
        setListingLocality(p?.locality || 'Model Town');
        setListingCity(p?.city || 'Panipat');
        setListingType((p as any)?.type || p?.propertyType || 'Builder Floor');
        setListingPrice(p?.priceDemandRaw || '₹1.25 Cr');
        setListingArea(p?.sizeValue ? String(p.sizeValue) : '200');
        setListingUnit(p?.sizeUnit || 'gaj');
        setListingFacing((p as any)?.facing || 'East');
        setListingOwnerPhone(p?.ownerPhone || '9876543210');
        setListingNotes(rawText);
        setCurrentStep('listing-review');
        success('Property listing extracted successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Could not parse message. Try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // DIRECT ACTION 1: Share Buyer Requirement on WhatsApp
  const handleShareBuyerRequirement = () => {
    const text = `*Client Property Requirement*\n\n*Buyer:* ${buyerName || 'Direct Client'}\n*Seeking:* ${buyerBedrooms} ${buyerType}\n*Location:* ${buyerLocation}, Panipat\n*Budget:* Up to ₹${buyerBudgetLakhs} Lakhs\n*Preferences:* ${buyerNotes || 'Ready to close deals'}\n\nShared via ${agencyDisplayName}`;
    const cleanPhone = buyerPhone.replace(/\D/g, '');
    const url = cleanPhone.length === 10 || cleanPhone.length === 12
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // DIRECT ACTION 2: Save Buyer directly to records
  const handleDirectSaveBuyer = async () => {
    if (!buyerLocation.trim()) {
      error('Please specify a preferred location.');
      return;
    }
    try {
      const budgetMaxPaise = buyerBudgetLakhs * 10000000;
      const budgetMinPaise = Math.round(budgetMaxPaise * 0.85);
      await createBuyer({
        name: buyerName || 'Direct Client',
        phone: buyerPhone || '+919876543210',
        localities: [buyerLocation],
        types: [buyerType],
        budget: {
          minPaise: budgetMinPaise,
          maxPaise: budgetMaxPaise,
        },
        notes: `${buyerBedrooms} · ${buyerNotes}`,
      });
      success(`Buyer requirement for "${buyerName}" saved to Buyer records!`);
      setTimeout(() => navigate('/app/buyers'), 600);
    } catch (err: any) {
      error(err.message || 'Could not save buyer.');
    }
  };

  // STEP 2 -> STEP 3: AI Find Matching Properties & Proceed to Share/Deals
  const handleFindMatches = async () => {
    if (!buyerLocation.trim()) {
      error('Please specify a preferred location for matching.');
      return;
    }

    setIsMatching(true);
    try {
      // Create or update buyer record in database
      const budgetMaxPaise = buyerBudgetLakhs * 10000000;
      const budgetMinPaise = Math.round(budgetMaxPaise * 0.85);

      const buyerRecord = await createBuyer({
        name: buyerName || 'Direct Client',
        phone: buyerPhone || '+919876543210',
        localities: [buyerLocation],
        types: [buyerType],
        budget: {
          minPaise: budgetMinPaise,
          maxPaise: budgetMaxPaise,
        },
        notes: `${buyerBedrooms} · ${buyerNotes}`,
      });

      setActiveBuyerId(buyerRecord._id);

      // Query real property inventory
      let properties = await fetchProperties();
      if (!properties) {
        properties = [];
      }

      // Transparent scoring against inventory
      const scored = properties
        .filter((p) => p.status === 'available' || !p.status)
        .map((p) => {
          let score = 50;
          const reasons: string[] = [];
          const mismatches: string[] = [];

          // Location match
          const pLoc = p.locality.toLowerCase();
          const bLoc = buyerLocation.toLowerCase();
          if (pLoc.includes(bLoc) || bLoc.includes(pLoc)) {
            score += 25;
            reasons.push(`Location: Situated in target sector "${p.locality}".`);
          } else {
            mismatches.push(`Location: In "${p.locality}" vs requested "${buyerLocation}".`);
          }

          // Type match
          if (p.type.toLowerCase() === buyerType.toLowerCase()) {
            score += 15;
            reasons.push(`Type: Direct match for "${p.type}".`);
          } else {
            mismatches.push(`Type: Listed as "${p.type}" vs requested "${buyerType}".`);
          }

          // Budget match
          const propLakhs = p.priceDemandPaise / 10000000;
          if (propLakhs <= buyerBudgetLakhs * 1.1) {
            score += 10;
            reasons.push(`Budget: Demanding ₹${propLakhs.toFixed(2)}L within client's ₹${buyerBudgetLakhs}L limit.`);
          } else {
            mismatches.push(`Budget: ₹${propLakhs.toFixed(2)}L is slightly above requested ₹${buyerBudgetLakhs}L.`);
          }

          return {
            property: p,
            score: Math.min(score, 98),
            reasons,
            mismatches,
          };
        })
        .sort((a, b) => b.score - a.score);

      setMatchedProperties(scored);
      setCurrentStep('matches');
      success(`Found ${scored.length} matching propert${scored.length === 1 ? 'y' : 'ies'} ready to save or share!`);
    } catch (err: any) {
      error(err.message || 'Error finding matches.');
    } finally {
      setIsMatching(false);
    }
  };

  // STEP 4: Save Property Against Buyer / Deal
  const handleSavePropertyMatch = async (property: PropertyItem) => {
    if (!activeBuyerId) {
      error('Buyer record not found.');
      return;
    }

    try {
      await createDeal({
        buyerId: activeBuyerId,
        propertyId: property._id,
        propertyTitleSnapshot: property.title,
        valuePaise: property.priceDemandPaise,
        commission: {
          mode: 'percent',
          bps: 100, // 1%
        },
        stage: 'interested',
        notes: `Matched from Quick Paste inquiry for ${buyerName}`,
      });

      setSavedPropertyIds((prev) => new Set([...prev, property._id]));
      success(`Property "${property.title}" saved to client deal pipeline!`);
    } catch (err: any) {
      error(err.message || 'Could not save deal.');
    }
  };

  // STEP 4: Share on WhatsApp
  const handleShareOnWhatsApp = (property: PropertyItem) => {
    const text = `*Verified Property Recommendation*\n\n*${property.title}*\nLocation: ${property.locality}, Panipat\nType: ${property.type}\nArea: ${property.size.value} ${property.size.unit.toUpperCase()}\nDemand: ${formatRupees(property.priceDemandPaise)}\n\nHighlights: ${property.description || 'Verified clear title property ready for inspection.'}\n\nView Verified Flyer & Media: https://leadnivash.com/flyer/${property._id}\n\nShared via ${agencyDisplayName}`;
    const cleanPhone = buyerPhone.replace(/\D/g, '');
    const url = cleanPhone.length === 10 || cleanPhone.length === 12
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  // Handle Listing Commit (STAYS IN SAME TAB -> Transitions to AI Match & Share)
  const handleCommitListing = async () => {
    setIsSavingListing(true);
    try {
      const payload = {
        title: listingTitle,
        locality: listingLocality,
        city: listingCity,
        type: listingType,
        priceDemandRaw: listingPrice,
        size: { value: Number(listingArea) || 200, unit: listingUnit },
        facing: listingFacing,
        ownerPhone: listingOwnerPhone,
        description: listingNotes,
      };
      const res = await commitParsedItem('listing', payload);
      const newId = (res as any)?.property?._id || (res as any)?._id || 'prop_' + Date.now();
      setSavedPropertyId(newId);
      success('Property saved to inventory successfully!');
      setCurrentStep('listing-saved-matches');

      // Fetch real buyer matches for this newly saved property from the backend
      setIsLoadingListingMatches(true);
      try {
        const [matchesRes, buyersList] = await Promise.allSettled([
          apiClient.get<any, any>(`/properties/${newId}/matches`),
          fetchBuyers(),
        ]);

        if (matchesRes.status === 'fulfilled' && matchesRes.value) {
          const list = Array.isArray(matchesRes.value) ? matchesRes.value : ((matchesRes.value as any)?.data || []);
          setListingBuyerMatches(list);
        } else {
          setListingBuyerMatches([]);
        }

        if (buyersList.status === 'fulfilled' && Array.isArray(buyersList.value)) {
          setTotalBuyersCount(buyersList.value.length);
        } else {
          setTotalBuyersCount(0);
        }
      } catch (err) {
        console.warn('Could not fetch matches for property:', err);
        setListingBuyerMatches([]);
      } finally {
        setIsLoadingListingMatches(false);
      }
    } catch (err: any) {
      error(err.message || 'Saving failed. Please try again.');
    } finally {
      setIsSavingListing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 text-left">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Quick Chat — Client & Property Matcher
            </h1>
            <Badge variant="brand">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              AI Matcher
            </Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Speak or type your client's requirements naturally. LeadNivash extracts filters and finds matching properties directly from your real inventory.
          </p>
        </div>

        {/* Dictation Language Switcher */}
        {isSupported && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-border/70 text-xs">
            <button
              onClick={() => setDictationLang('hi-IN')}
              className={clsx(
                'px-3 py-1 rounded-full font-bold transition cursor-pointer',
                dictationLang === 'hi-IN'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              हिंदी
            </button>
            <button
              onClick={() => setDictationLang('en-IN')}
              className={clsx(
                'px-3 py-1 rounded-full font-bold transition cursor-pointer',
                dictationLang === 'en-IN'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              English
            </button>
          </div>
        )}
      </div>

      {/* Workflow Progress Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-bold text-slate-500 overflow-x-auto pb-1">
        <span
          className={clsx(
            'px-3 py-1 rounded-full transition',
            currentStep === 'paste'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          )}
        >
          1. Paste Message
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span
          className={clsx(
            'px-3 py-1 rounded-full transition',
            currentStep === 'buyer-details' || currentStep === 'listing-review'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          )}
        >
          2. Extracted Details
        </span>
        <ArrowRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
        <span
          className={clsx(
            'px-3 py-1 rounded-full transition',
            currentStep === 'matches' || currentStep === 'listing-saved-matches'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600'
          )}
        >
          3. AI Matches & Share
        </span>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: PASTE OR TRANSCRIBE MESSAGE                     */}
      {/* ======================================================== */}
      {currentStep === 'paste' && (
        <Card className="p-4 sm:p-6 space-y-4 border-emerald-500/20 shadow-card">
          {/* Quick Sample Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-muted uppercase tracking-wider">Try Demo:</span>
            {samples.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setRawText(s.text);
                  setParseResult(null);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-700 dark:hover:text-emerald-400 border border-border text-[11px] font-medium transition cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Textarea with Non-Duplicating Voice Input */}
          <div className="relative">
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste forwarded WhatsApp property message or client requirement here... or click the mic to speak in Hindi/English."
              className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
            />

            {/* Action buttons inside bottom right */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              {rawText && (
                <button
                  onClick={() => {
                    setRawText('');
                    setParseResult(null);
                  }}
                  className="p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs transition cursor-pointer"
                  title="Clear text"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}

              {isSupported && (
                <button
                  onClick={toggleListening}
                  className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer',
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200 dark:ring-rose-950'
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  )}
                  title={isListening ? 'Stop Recording' : 'Start Voice Input'}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Live listening feedback pill without text mutation */}
          {isListening && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between">
              <span className="flex items-center gap-2 font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                <span>Listening ({dictationLang === 'hi-IN' ? 'Hindi' : 'English'})...</span>
                {interimTranscript && (
                  <span className="font-normal italic text-slate-700 dark:text-slate-300">
                    "{interimTranscript}"
                  </span>
                )}
              </span>
              <button
                onClick={toggleListening}
                className="font-bold underline text-[11px] cursor-pointer"
              >
                Stop
              </button>
            </div>
          )}

          {/* Privacy & Primary Action: Analyse Message */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-[11px] text-muted">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Owner contacts & buyer numbers are masked in your encrypted vault.</span>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !rawText.trim()}
              pill
              className="w-full sm:w-auto font-bold text-xs shadow-md shadow-emerald-700/20"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Analysing Message...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Analyse Message</span>
                </span>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 2: SHOW BUYER DETAILS & TWO CLEAR ACTIONS          */}
      {/* ======================================================== */}
      {currentStep === 'buyer-details' && (
        <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/40 shadow-xl bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-black text-ink font-heading">
                  Buyer Requirement Details
                </h3>
                <span className="text-[10px] text-muted">Step 2: Review or edit before matching</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('paste')}
              className="text-xs text-muted hover:text-ink font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Message</span>
            </button>
          </div>

          {/* Duplicate phone warning if applicable */}
          {buyerDuplicateWarning && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{buyerDuplicateWarning}</span>
            </div>
          )}

          {/* Option A: Editable Form Controls */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Buyer Name
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 text-xs font-bold text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Client Mobile Number
                </label>
                <input
                  type="tel"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 text-xs font-bold text-ink"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Target Locality
                </label>
                <input
                  type="text"
                  value={buyerLocation}
                  onChange={(e) => setBuyerLocation(e.target.value)}
                  placeholder="e.g. Model Town, Sector 18"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 text-xs font-bold text-ink"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Property Type
                </label>
                <select
                  value={buyerType}
                  onChange={(e) => setBuyerType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 text-xs font-bold text-ink"
                >
                  <option value="Floor">Builder Floor</option>
                  <option value="Plot">Residential Plot</option>
                  <option value="Kothi">Kothi / House</option>
                  <option value="Flat">Apartment / Flat</option>
                  <option value="Shop">Commercial Shop</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Client Budget (Max)
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-muted">₹</span>
                  <input
                    type="number"
                    value={buyerBudgetLakhs}
                    onChange={(e) => setBuyerBudgetLakhs(Number(e.target.value))}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 text-xs font-black text-emerald-700 dark:text-emerald-400"
                  />
                  <span className="text-muted font-bold text-xs">Lakhs</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                Layout / Notes / Additional Preferences
              </label>
              <textarea
                rows={2}
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                placeholder="e.g. Lift and car parking required, immediate closing..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-border rounded-xl p-2.5 text-xs text-ink"
              />
            </div>
          </div>

          {/* STEP 2 ACTIONS: Edit, Save directly, Share to WhatsApp, or Proceed to Matching Deals */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsEditingBuyer(!isEditingBuyer)}
                className="px-3.5 py-2 rounded-full border border-border hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5 text-slate-500" />
                <span>{isEditingBuyer ? 'Hide Extra Fields' : 'Edit Details'}</span>
              </button>

              <button
                type="button"
                onClick={handleDirectSaveBuyer}
                className="px-3.5 py-2 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Save className="w-3.5 h-3.5 text-emerald-600" />
                <span>Save Buyer</span>
              </button>

              <button
                type="button"
                onClick={handleShareBuyerRequirement}
                className="px-3.5 py-2 rounded-full border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Share Requirement</span>
              </button>
            </div>

            {/* Primary Action — Find Matches & Proceed to Step 3 */}
            <Button
              size="md"
              pill
              onClick={handleFindMatches}
              disabled={isMatching || !buyerLocation.trim()}
              className="font-bold text-xs shadow-md shadow-emerald-700/20 flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching Inventory...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Find Matches & Deals</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </span>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 3: AI PROPERTY MATCHING RESULTS                     */}
      {/* ======================================================== */}
      {currentStep === 'matches' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl border border-emerald-500/30">
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300 tracking-wider block">
                Active Client Matched
              </span>
              <h3 className="text-base font-black text-ink font-heading">
                {buyerName} · Budget ₹{buyerBudgetLakhs} Lakhs
              </h3>
              <p className="text-xs text-muted">Target: {buyerLocation} ({buyerType})</p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleShareBuyerRequirement}
                className="px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Requirement</span>
              </button>
              <button
                onClick={() => setCurrentStep('buyer-details')}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-ink transition cursor-pointer"
              >
                Edit Buyer Info
              </button>
              <button
                onClick={() => setCurrentStep('paste')}
                className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
              >
                + New Paste
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-muted px-1">
            <span>{matchedProperties.length} Inventory Properties Evaluated</span>
            <span>Real Database Matches</span>
          </div>

          {matchedProperties.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <Building2 className="w-8 h-8 text-muted mx-auto" />
              <h4 className="text-sm font-bold text-ink">Please add your properties first</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No data is available to display yet. Add properties to your inventory so Quick Chat can automatically match client requirements.
              </p>
              <div className="flex items-center justify-center gap-2 pt-2">
                <Link to="/app/properties/new">
                  <Button size="sm" pill className="font-bold text-xs">
                    + Add Property
                  </Button>
                </Link>
                <Link to="/app/buyers/new">
                  <Button variant="secondary" size="sm" pill className="font-bold text-xs">
                    + Add Buyer
                  </Button>
                </Link>
              </div>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* 1. Exact Matches (Score >= 80) */}
              {matchedProperties.filter((m) => m.score >= 80).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                    <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Exact Matches ({matchedProperties.filter((m) => m.score >= 80).length})
                    </span>
                    <span className="text-[10px] text-muted font-medium">All key criteria match</span>
                  </div>

                  <div className="space-y-4">
                    {matchedProperties
                      .filter((m) => m.score >= 80)
                      .map(({ property, score, reasons, mismatches }) => {
                        const isSaved = savedPropertyIds.has(property._id);
                        return (
                          <Card
                            key={property._id}
                            className="p-5 space-y-4 border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-200 shadow-sm bg-gradient-to-br from-white via-emerald-50/20 to-white dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-black text-ink font-heading">
                                    {property.title}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                                    Exact Match · {score}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted">
                                  {property.locality}, {property.city} · {property.size.value} {property.size.unit.toUpperCase()}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-muted block">Demand</span>
                                <span className="text-base font-black text-emerald-700 dark:text-emerald-400">
                                  {formatRupees(property.priceDemandPaise)}
                                </span>
                              </div>
                            </div>

                            {/* Transparent Match Reasons */}
                            <div className="space-y-1.5 text-xs bg-emerald-50/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-emerald-500/20">
                              <span className="text-[10px] uppercase font-bold text-muted block tracking-wider">
                                Why this matches:
                              </span>
                              {reasons.map((r, i) => (
                                <div key={i} className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                  <span>{r}</span>
                                </div>
                              ))}
                              {mismatches.map((m, i) => (
                                <div key={i} className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{m}</span>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80">
                              <button
                                type="button"
                                onClick={() => setInspectingProperty(property)}
                                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-ink flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Listing</span>
                              </button>

                              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  pill
                                  disabled={isSaved}
                                  onClick={() => handleSavePropertyMatch(property)}
                                  className={clsx(
                                    'flex-1 sm:flex-none text-xs font-bold',
                                    isSaved && 'text-emerald-700 border-emerald-300'
                                  )}
                                >
                                  {isSaved ? (
                                    <span className="flex items-center gap-1.5">
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Saved ✓</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5">
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Save Deal</span>
                                    </span>
                                  )}
                                </Button>

                                <button
                                  type="button"
                                  onClick={() => handleShareOnWhatsApp(property)}
                                  className="flex-1 sm:flex-none py-2 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>Share Quote</span>
                                </button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Notice when no exact matches exist */}
              {matchedProperties.filter((m) => m.score >= 80).length === 0 &&
                matchedProperties.filter((m) => m.score < 80).length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>
                      No exact match found in your inventory for "{buyerLocation}" ({buyerType}). Showing close matches and alternative options below:
                    </span>
                  </div>
                )}

              {/* 2. Close Matches (Score < 80) */}
              {matchedProperties.filter((m) => m.score < 80).length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 px-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-xs font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                      Close Matches ({matchedProperties.filter((m) => m.score < 80).length})
                    </span>
                    <span className="text-[10px] text-muted font-medium">Alternative / Nearby options</span>
                  </div>

                  <div className="space-y-4">
                    {matchedProperties
                      .filter((m) => m.score < 80)
                      .map(({ property, score, reasons, mismatches }) => {
                        const isSaved = savedPropertyIds.has(property._id);
                        return (
                          <Card
                            key={property._id}
                            className="p-5 space-y-4 border-amber-300/50 hover:border-amber-500/60 transition-all duration-200 shadow-sm bg-gradient-to-br from-white via-amber-50/10 to-white dark:from-slate-900 dark:via-amber-950/10 dark:to-slate-900"
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-base font-black text-ink font-heading">
                                    {property.title}
                                  </h4>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/50">
                                    Close Match · {score}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted">
                                  {property.locality}, {property.city} · {property.size.value} {property.size.unit.toUpperCase()}
                                </p>
                              </div>

                              <div className="text-right">
                                <span className="text-[10px] uppercase font-bold text-muted block">Demand</span>
                                <span className="text-base font-black text-amber-800 dark:text-amber-400">
                                  {formatRupees(property.priceDemandPaise)}
                                </span>
                              </div>
                            </div>

                            {/* Transparent Match Reasons */}
                            <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-border">
                              <span className="text-[10px] uppercase font-bold text-muted block tracking-wider">
                                Match analysis:
                              </span>
                              {reasons.map((r, i) => (
                                <div key={i} className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                                  <span>{r}</span>
                                </div>
                              ))}
                              {mismatches.map((m, i) => (
                                <div key={i} className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                                  <span>{m}</span>
                                </div>
                              ))}
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-border/80">
                              <button
                                type="button"
                                onClick={() => setInspectingProperty(property)}
                                className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-ink flex items-center gap-1.5 cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>Inspect Listing</span>
                              </button>

                              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  pill
                                  disabled={isSaved}
                                  onClick={() => handleSavePropertyMatch(property)}
                                  className={clsx(
                                    'flex-1 sm:flex-none text-xs font-bold',
                                    isSaved && 'text-emerald-700 border-emerald-300'
                                  )}
                                >
                                  {isSaved ? (
                                    <span className="flex items-center gap-1.5">
                                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Saved ✓</span>
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1.5">
                                      <Save className="w-3.5 h-3.5" />
                                      <span>Save Deal</span>
                                    </span>
                                  )}
                                </Button>

                                <button
                                  type="button"
                                  onClick={() => handleShareOnWhatsApp(property)}
                                  className="flex-1 sm:flex-none py-2 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                                >
                                  <Share2 className="w-3.5 h-3.5" />
                                  <span>Share Quote</span>
                                </button>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* LISTING REVIEW CARD (Editable Fields Before Saving)       */}
      {/* ======================================================== */}
      {currentStep === 'listing-review' && parseResult && (
        <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/40 shadow-xl bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </span>
              <div>
                <h3 className="text-base font-black text-ink font-heading">
                  Property Listing Extracted
                </h3>
                <span className="text-[10px] text-muted">Review, edit any field, and save to inventory</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('paste')}
              className="text-xs text-muted hover:text-ink font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Message</span>
            </button>
          </div>

          {/* Editable Property Fields */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Property Title / Headline
                </label>
                <input
                  type="text"
                  value={listingTitle}
                  onChange={(e) => setListingTitle(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Asking Price / Demand
                </label>
                <input
                  type="text"
                  value={listingPrice}
                  onChange={(e) => setListingPrice(e.target.value)}
                  placeholder="e.g. ₹1.25 Cr"
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-emerald-700 font-black focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Locality / Sector
                </label>
                <input
                  type="text"
                  value={listingLocality}
                  onChange={(e) => setListingLocality(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Property Type
                </label>
                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="Builder Floor">Builder Floor</option>
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Independent Kothi">Independent Kothi</option>
                  <option value="Commercial Shop">Commercial Shop</option>
                  <option value="Agricultural Land">Agricultural Land</option>
                  <option value="Industrial Shed">Industrial Shed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Facing / Direction
                </label>
                <input
                  type="text"
                  value={listingFacing}
                  onChange={(e) => setListingFacing(e.target.value)}
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  Area Size & Unit
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={listingArea}
                    onChange={(e) => setListingArea(e.target.value)}
                    className="w-2/3 bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                  <select
                    value={listingUnit}
                    onChange={(e) => setListingUnit(e.target.value)}
                    className="w-1/3 bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="gaj">Gaj</option>
                    <option value="sqft">Sq. Ft.</option>
                    <option value="marla">Marla</option>
                    <option value="kanal">Kanal</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center justify-between">
                  <span>Owner Contact (Encrypted Vault)</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Shielded
                  </span>
                </label>
                <input
                  type="tel"
                  value={listingOwnerPhone}
                  onChange={(e) => setListingOwnerPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-muted">
                Raw Notes / WhatsApp Message Details
              </label>
              <textarea
                rows={2}
                value={listingNotes}
                onChange={(e) => setListingNotes(e.target.value)}
                className="w-full bg-surface border border-border rounded-xl p-2.5 text-xs text-ink font-normal focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between gap-3">
            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={() => setCurrentStep('paste')}
              className="text-xs"
            >
              Cancel
            </Button>

            <Button
              size="md"
              pill
              onClick={handleCommitListing}
              isLoading={isSavingListing}
              className="font-bold text-xs shadow-md shadow-emerald-700/20"
            >
              <Save className="w-4 h-4 mr-1.5" />
              <span>Save to Inventory & Find Matches</span>
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* LISTING SAVED + SAME-TAB MATCHES & WHATSAPP SHARE         */}
      {/* ======================================================== */}
      {currentStep === 'listing-saved-matches' && (
        <div className="space-y-5 animate-hero-up">
          {/* Saved Confirmation Banner */}
          <Card className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/40 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-black text-emerald-950 dark:text-emerald-200 font-heading">
                      Property Saved to Inventory!
                    </h3>
                    <Badge variant="brand">ID #{savedPropertyId.slice(-6)}</Badge>
                  </div>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300">
                    {listingTitle} · {listingLocality} · {listingPrice}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  to={`/flyer/${savedPropertyId}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-300 text-xs font-bold hover:bg-emerald-100 transition"
                >
                  View Flyer
                </Link>
                <Link
                  to="/app/properties"
                  className="px-3 py-1.5 rounded-full bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition"
                >
                  All Inventory
                </Link>
              </div>
            </div>
          </Card>

          {/* Instant AI Matches Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/60">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-ink font-heading leading-tight">
                  Instant Buyer Matches for this Property
                </h2>
                <Badge variant={listingBuyerMatches.length > 0 ? 'brand' : 'neutral'}>
                  {listingBuyerMatches.length} {listingBuyerMatches.length === 1 ? 'Matched' : 'Matched'}
                </Badge>
              </div>
              <p className="text-xs text-muted">
                Pre-matched buyer leads in your database. Share the property flyer directly with clients via WhatsApp.
              </p>
            </div>

            <Button
              variant="secondary"
              size="sm"
              pill
              onClick={() => {
                setRawText('');
                setParseResult(null);
                setCurrentStep('paste');
              }}
              className="text-xs font-bold whitespace-nowrap self-start sm:self-auto shrink-0 shadow-2xs"
            >
              + Paste Another Message
            </Button>
          </div>

          {/* Matching Buyers Cards */}
          {isLoadingListingMatches ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
          ) : listingBuyerMatches.length === 0 ? (
            <Card className="p-8 text-center space-y-3 bg-white dark:bg-slate-900 border-border">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-muted flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-muted" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-ink">
                  {totalBuyersCount === 0
                    ? 'No Buyer Requirements Added Yet'
                    : 'No Matching Buyers Found in Your Database'}
                </h4>
                <p className="text-xs text-muted max-w-md mx-auto leading-relaxed">
                  {totalBuyersCount === 0
                    ? 'This property has been saved to your inventory. Add your client requirements in Buyer Leads, and Quick Chat will automatically match them here!'
                    : `None of your active buyers currently match ${listingLocality || 'this location'} within ${listingPrice || 'asking price'}. You can still share this property flyer directly with clients on WhatsApp.`}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Link to="/app/buyers/new">
                  <Button size="sm" pill className="font-bold text-xs">
                    + Add Buyer Requirement
                  </Button>
                </Link>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `*Verified Property Available*\n\n*${listingTitle}*\n📍 Location: ${listingLocality}, Panipat\n💰 Asking: ${listingPrice}\n📐 Area: ${listingArea} ${listingUnit.toUpperCase()}\n\nView Verified Flyer & Photos:\nhttps://leadnivash.com/flyer/${savedPropertyId}\n\nMarketed by: ${agencyDisplayName}`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-1.5 px-3.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Flyer on WhatsApp</span>
                </a>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {listingBuyerMatches.map((item, idx) => {
                const lead = item.buyer || item;
                const score = item.score || 90;
                const buyerBudgetFormatted = lead.budget?.maxPaise
                  ? formatRupees(lead.budget.maxPaise)
                  : lead.budget || 'Budget Flexible';
                const flyerUrl = `https://leadnivash.com/flyer/${savedPropertyId}`;
                const whatsappShareText = `Namaste ${lead.name} ji,\n\nAapki requirement ke hisaab se ek prime property inventory mein aayi hai:\n\n*${listingTitle}*\n📍 Location: ${listingLocality}, Panipat\n💰 Asking: ${listingPrice}\n📐 Area: ${listingArea} ${listingUnit.toUpperCase()}\n\nVerified Flyer & Photos yahan dekhein:\n${flyerUrl}\n\nKya hum kal iska inspection plan kar sakte hain?\n- ${agencyDisplayName}`;
                const waLink = `https://wa.me/${(lead.phoneE164 || lead.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(whatsappShareText)}`;

                return (
                  <Card
                    key={lead.id || lead._id || idx}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-slate-200 hover:border-emerald-500/50 transition shadow-sm bg-white dark:bg-slate-900"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center justify-center font-black text-sm shrink-0 border border-emerald-200">
                        {score}%
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-ink text-sm">{lead.name}</h4>
                          <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                            Max Budget: {buyerBudgetFormatted}
                          </span>
                          {lead.urgency && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase">
                              {lead.urgency}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted font-normal">
                          Matches criteria in <span className="font-semibold text-ink">{listingLocality || 'Panipat'}</span>
                        </p>
                        <span className="text-[11px] text-slate-500 font-mono block">
                          {lead.phoneE164 || lead.phone || '—'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(whatsappShareText);
                          success(`WhatsApp flyer message copied for ${lead.name}!`);
                        }}
                        className="p-2 rounded-full border border-border hover:bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                        title="Copy Share Message"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <a
                        href={waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2 px-4 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share on WhatsApp</span>
                      </a>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Inspect Property Modal */}
      {inspectingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <Card className="w-full max-w-lg p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-black text-ink">{inspectingProperty.title}</h3>
              <button
                onClick={() => setInspectingProperty(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted block text-[10px] font-bold uppercase">Locality</span>
                <span className="font-bold text-ink">{inspectingProperty.locality}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px] font-bold uppercase">Demand</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {formatRupees(inspectingProperty.priceDemandPaise)}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px] font-bold uppercase">Area</span>
                <span className="font-bold text-ink">
                  {inspectingProperty.size.value} {inspectingProperty.size.unit.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px] font-bold uppercase">Facing</span>
                <span className="font-bold text-ink">{inspectingProperty.facing || 'Open'}</span>
              </div>
            </div>

            {inspectingProperty.description && (
              <p className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                {inspectingProperty.description}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button size="sm" pill variant="secondary" onClick={() => setInspectingProperty(null)}>
                Close
              </Button>
              <button
                type="button"
                onClick={() => {
                  handleShareOnWhatsApp(inspectingProperty);
                  setInspectingProperty(null);
                }}
                className="py-1.5 px-4 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share on WhatsApp</span>
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
