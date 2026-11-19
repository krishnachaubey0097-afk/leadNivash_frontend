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
import clsx from 'clsx';

export const PastePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, toast } = useToast();

  // Workflow Step: 'paste' (Step 1) | 'buyer-details' (Step 2) | 'matches' (Step 3) | 'listing-review'
  const [currentStep, setCurrentStep] = useState<'paste' | 'buyer-details' | 'matches' | 'listing-review'>('paste');

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
        setCurrentStep('listing-review');
        success('Property listing extracted successfully.');
      }
    } catch (err: any) {
      error(err.message || 'Could not parse message. Try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // STEP 2 -> STEP 3: AI Find Matching Properties
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
      const properties = await fetchProperties();

      // Transparent scoring against inventory
      const scored = properties
        .filter((p) => p.status === 'available')
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
      success(`Found ${scored.length} potential property match${scored.length === 1 ? '' : 'es'} in inventory.`);
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
    const text = `*Verified Property Recommendation*\n\n*${property.title}*\nLocation: ${property.locality}, Panipat\nType: ${property.type}\nArea: ${property.size.value} ${property.size.unit.toUpperCase()}\nDemand: ${formatRupees(property.priceDemandPaise)}\n\nHighlights: ${property.description || 'Verified clear title property ready for inspection.'}\n\nView Verified Flyer & Media: https://leadnivash.com/flyer/${property._id}\n\nShared via Sharma Real Estate Agency`;
    const cleanPhone = buyerPhone.replace(/\D/g, '');
    const url = cleanPhone.length === 10 || cleanPhone.length === 12
      ? `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;

    window.open(url, '_blank');
  };

  // Handle Listing Commit
  const handleCommitListing = async () => {
    if (!parseResult) return;
    setIsSavingListing(true);
    try {
      await commitParsedItem('listing', parseResult.extracted.property || {});
      success('Property has been added to your inventory.');
      setTimeout(() => navigate('/app/properties'), 800);
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
              Quick Paste & Client Matching
            </h1>
            <Badge variant="brand">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              AI Workflow
            </Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Convert WhatsApp messages into buyer requirements and match them with property listings instantly.
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
            currentStep === 'matches'
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

          {/* TWO ACTIONS ONLY AT THIS STAGE: OPTION A vs OPTION B */}
          <div className="pt-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Option A — Fill Buyer Details */}
            <button
              type="button"
              onClick={() => setIsEditingBuyer(!isEditingBuyer)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <FileCheck className="w-4 h-4 text-slate-500" />
              <span>{isEditingBuyer ? 'Hide Extra Fields' : 'Edit / Complete Details'}</span>
            </button>

            {/* Option B — AI Find Matching Properties */}
            <Button
              size="md"
              pill
              onClick={handleFindMatches}
              disabled={isMatching || !buyerLocation.trim()}
              className="w-full sm:w-auto font-bold text-xs shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2"
            >
              {isMatching ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Searching Inventory...</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Find Matching Properties</span>
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentStep('buyer-details')}
                className="px-3.5 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-border text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-ink transition cursor-pointer"
              >
                Edit Buyer Info
              </button>
              <button
                onClick={() => setCurrentStep('paste')}
                className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-bold transition cursor-pointer"
              >
                + New Paste
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-muted px-1">
            <span>{matchedProperties.length} Inventory Properties Evaluated</span>
            <span>Transparent Match Reasons</span>
          </div>

          {matchedProperties.length === 0 ? (
            <Card className="p-8 text-center space-y-3">
              <Building2 className="w-8 h-8 text-muted mx-auto" />
              <h4 className="text-sm font-bold text-ink">No Direct Inventory Matches Found</h4>
              <p className="text-xs text-muted max-w-sm mx-auto">
                No currently available listings matched {buyerLocation} at ₹{buyerBudgetLakhs} Lakhs. Add a new listing to inventory or broadcast this buyer request.
              </p>
              <Link to="/app/properties/new">
                <Button size="sm" pill className="font-bold text-xs mt-2">
                  + Add New Property Listing
                </Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {matchedProperties.map(({ property, score, reasons, mismatches }) => {
                const isSaved = savedPropertyIds.has(property._id);

                return (
                  <Card
                    key={property._id}
                    className="p-5 space-y-4 border-slate-200 hover:border-emerald-500/40 transition-all duration-200 shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/80">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-ink font-heading">
                            {property.title}
                          </h4>
                          <span
                            className={clsx(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold',
                              score >= 80
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            )}
                          >
                            {score}% Match
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
                    <div className="space-y-1.5 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-border">
                      <span className="text-[10px] uppercase font-bold text-muted block tracking-wider">
                        Why this matches:
                      </span>
                      {reasons.map((r, i) => (
                        <div key={i} className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
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

                    {/* STEP 4: TWO CLEAR MATCH RESULT ACTIONS */}
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
                        {/* Action 1 — Save Property */}
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
                              <span>Save Property</span>
                            </span>
                          )}
                        </Button>

                        {/* Action 2 — Share on WhatsApp */}
                        <button
                          type="button"
                          onClick={() => handleShareOnWhatsApp(property)}
                          className="flex-1 sm:flex-none py-2 px-4 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share on WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* LISTING REVIEW CARD (When message was a Property)        */}
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
                <span className="text-[10px] text-muted">Review details and save to inventory</span>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('paste')}
              className="text-xs text-muted hover:text-ink font-bold flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Title & Type</span>
              <p className="font-bold text-ink">
                {parseResult.extracted.property?.title || 'Property Listing'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Asking Demand</span>
              <p className="font-black text-emerald-700 text-sm">
                {parseResult.extracted.property?.priceDemandRaw || 'Contact for price'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Locality</span>
              <p className="font-bold text-ink">
                {parseResult.extracted.property?.locality || 'Panipat'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted">Owner (Vault Protected)</span>
              <p className="font-bold text-ink">
                {parseResult.extracted.property?.ownerPhone || '+91 ••••• ••••• (Shielded)'}
              </p>
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
              <span>Save to Inventory</span>
            </Button>
          </div>
        </Card>
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
