import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Mic,
  Check,
  Building2,
  Users,
  ShieldCheck,
  AlertCircle,
  Save,
  ArrowRight,
  ArrowLeft,
  Share2,
  Eye,
  CheckCircle2,
  Copy,
  Square,
  Clipboard,
  X,
  ChevronRight,
  Maximize2,
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
import clsx from 'clsx';

export const PastePage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, toast } = useToast();

  const agencyDisplayName = user?.agency?.name || user?.name || 'Verified Broker';

  // Workflow Steps: 'paste' (Step 1) | 'review' (Step 2) | 'matches' (Step 3)
  const [currentStep, setCurrentStep] = useState<'paste' | 'review' | 'matches'>('paste');

  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [dictationLang, setDictationLang] = useState<'en-IN' | 'hi-IN'>('en-IN');

  // Classification: 'buyer' or 'listing'
  const [itemType, setItemType] = useState<'buyer' | 'listing'>('buyer');

  // Step 2: Editable Extracted Fields
  const [recordName, setRecordName] = useState('');
  const [recordPhone, setRecordPhone] = useState('');
  const [recordLocality, setRecordLocality] = useState('Model Town');
  const [recordCity, setRecordCity] = useState('Panipat');
  const [recordType, setRecordType] = useState('Builder Floor');
  const [recordBudgetLakhs, setRecordBudgetLakhs] = useState<number>(100);
  const [recordPriceRaw, setRecordPriceRaw] = useState('');
  const [recordArea, setRecordArea] = useState('200');
  const [recordUnit, setRecordUnit] = useState('gaj');
  const [recordFacing, setRecordFacing] = useState('North-East');
  const [recordBedrooms, setRecordBedrooms] = useState('3 BHK');
  const [recordNotes, setRecordNotes] = useState('');

  // Save states
  const [isSaving, setIsSaving] = useState(false);
  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  // Step 3: Real Matching State
  const [isMatching, setIsMatching] = useState(false);
  const [matchedProperties, setMatchedProperties] = useState<
    Array<{
      property: PropertyItem;
      score: number;
      reasons: string[];
      mismatches: string[];
    }>
  >([]);
  const [matchedBuyers, setMatchedBuyers] = useState<any[]>([]);
  const [totalDatabaseCount, setTotalDatabaseCount] = useState<number>(0);
  const [savedPropertyIds, setSavedPropertyIds] = useState<Set<string>>(new Set());
  const [inspectingProperty, setInspectingProperty] = useState<PropertyItem | null>(null);

  // Voice dictation hook — commits finalized segment only once, separates interim transcript
  const { isListening, isSupported, interimTranscript, toggleListening } = useVoiceDictation({
    lang: dictationLang,
    onFinalTranscript: (finalChunk) => {
      setRawText((prev) => (prev ? `${prev} ${finalChunk}` : finalChunk));
    },
  });

  // Selectable examples clearly labeled as examples
  const exampleMessages = [
    {
      label: 'Buyer: 3 BHK Model Town',
      text: 'Urgent buyer requirement: Need 3 BHK luxury builder floor in Model Town or Sector 11 Panipat. Budget 1.10 to 1.35 Cr with lift & car parking. Client: Rajesh Sharma 9876543210.',
    },
    {
      label: 'Listing: 250 Gaj Sushant City',
      text: 'Available for Sale: Residential plot 250 gaj in Ansals Sushant City Sector 18 Panipat. North facing, 40 ft road, demand 85 Lakhs negotiable. Owner: 9812044321.',
    },
    {
      label: 'Buyer: Commercial Shop',
      text: 'Client looking for commercial shop on GT Road or Chandni Bagh Panipat. Budget 70 to 90 Lakhs for rental return. Contact: Vikram Verma 9876500002.',
    },
    {
      label: 'Listing: 3 BHK Builder Floor',
      text: 'Direct listing: Newly built 3 BHK builder floor in Sector 18 Panipat. Ready to move, lift, stilt parking, asking 1.25 Cr. Contact: 9876543210.',
    },
  ];

  // Clipboard Paste Helper
  const handleClipboardPaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setRawText(text.trim());
          success('Pasted message from clipboard');
        } else {
          toast('Clipboard is empty or contains no text.', 'info');
        }
      } else {
        toast('Clipboard access is restricted. Please paste directly using your keyboard.', 'info');
      }
    } catch {
      toast('Please paste directly into the box using your keyboard or long-press.', 'info');
    }
  };

  // STEP 1: Analyse Message
  const handleAnalyze = async () => {
    if (!rawText.trim() || rawText.trim().length < 5) {
      toast('Please paste a WhatsApp message with at least 5 characters.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await parseMessage(rawText);
      setParseResult(result);
      setItemType(result.itemType);

      if (result.itemType === 'buyer') {
        const b = result.extracted.buyer;
        setRecordName(b?.name || 'Direct Buyer');
        setRecordPhone(b?.phone || '');
        setRecordLocality(b?.localities?.[0] || 'Model Town');
        setRecordType(b?.propertyType ? b.propertyType.replace(/_/g, ' ') : 'Builder Floor');
        setRecordBudgetLakhs(
          b?.budgetMaxPaise ? Math.round(b.budgetMaxPaise / 10000000) : 120
        );
        setRecordPriceRaw(b?.budgetRaw || (b?.budgetMaxPaise ? formatRupees(b.budgetMaxPaise) : ''));
        setRecordBedrooms(b?.bhk?.[0] ? `${b.bhk[0]} BHK` : '3 BHK');
        setRecordNotes(rawText);
      } else {
        const p = result.extracted.property;
        setRecordName(p?.ownerName || 'Property Owner');
        setRecordPhone(p?.ownerPhone || '');
        setRecordLocality(p?.locality || 'Model Town');
        setRecordCity(p?.city || 'Panipat');
        setRecordType((p as any)?.type || p?.propertyType || 'Builder Floor');
        setRecordPriceRaw(p?.priceDemandRaw || (p?.priceDemandPaise ? formatRupees(p.priceDemandPaise) : '₹1.25 Cr'));
        setRecordArea(p?.sizeValue ? String(p.sizeValue) : '200');
        setRecordUnit(p?.sizeUnit || 'gaj');
        setRecordFacing((p as any)?.facing || 'North-East');
        setRecordNotes(rawText);
      }

      setCurrentStep('review');
      success('Message analysed! Review extracted details below.');
    } catch (err: any) {
      error(err?.message || 'Could not analyse message. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // STEP 2: Save Extracted Record (Prevent Duplicate Saves)
  const handleSaveRecord = async () => {
    if (isSaving || savedRecordId) return;

    if (!recordLocality.trim()) {
      error('Please specify a locality or sector.');
      return;
    }

    setIsSaving(true);
    try {
      if (itemType === 'buyer') {
        const budgetMaxPaise = recordBudgetLakhs * 10000000;
        const budgetMinPaise = Math.round(budgetMaxPaise * 0.85);

        const buyerRecord = await createBuyer({
          name: recordName || 'Direct Client',
          phone: recordPhone || user?.phone || '',
          localities: [recordLocality],
          types: [recordType],
          budget: {
            minPaise: budgetMinPaise,
            maxPaise: budgetMaxPaise,
          },
          notes: `${recordBedrooms} · ${recordNotes}`,
        });

        setSavedRecordId(buyerRecord._id);
        success(`Buyer inquiry for "${recordName}" saved successfully!`);
      } else {
        const payload = {
          title: `${recordBedrooms ? `${recordBedrooms} ` : ''}${recordType} in ${recordLocality}`,
          locality: recordLocality,
          city: recordCity,
          type: recordType,
          priceDemandRaw: recordPriceRaw,
          size: { value: Number(recordArea) || 200, unit: recordUnit },
          facing: recordFacing,
          ownerPhone: recordPhone,
          description: recordNotes,
        };

        const res = await commitParsedItem('listing', payload);
        const newId = (res as any)?.property?._id || (res as any)?._id || 'prop_' + Date.now();
        setSavedRecordId(newId);
        success('Property listing saved to inventory!');
      }
    } catch (err: any) {
      error(err?.message || 'Could not save record.');
    } finally {
      setIsSaving(false);
    }
  };

  // STEP 2 -> STEP 3: Find Matches against Real Database
  const handleFindMatches = async () => {
    if (!recordLocality.trim()) {
      error('Please specify a locality for matching.');
      return;
    }

    setIsMatching(true);
    try {
      if (itemType === 'buyer') {
        // Match buyer against broker's real property inventory
        const properties = (await fetchProperties()) || [];
        setTotalDatabaseCount(properties.length);

        const scored = properties
          .filter((p) => p.status === 'available' || !p.status)
          .map((p) => {
            let score = 50;
            const reasons: string[] = [];
            const mismatches: string[] = [];

            // Location
            const pLoc = (p.locality || '').toLowerCase();
            const bLoc = recordLocality.toLowerCase();
            if (pLoc.includes(bLoc) || bLoc.includes(pLoc)) {
              score += 25;
              reasons.push(`Target Sector: Situated in "${p.locality}".`);
            } else {
              mismatches.push(`Located in "${p.locality}" vs requested "${recordLocality}".`);
            }

            // Type
            if ((p.type || '').toLowerCase() === recordType.toLowerCase()) {
              score += 15;
              reasons.push(`Property Type: Direct match for "${p.type}".`);
            } else {
              mismatches.push(`Type is "${p.type}" vs requested "${recordType}".`);
            }

            // Budget
            const propLakhs = (p.priceDemandPaise || 0) / 10000000;
            if (propLakhs <= recordBudgetLakhs * 1.1) {
              score += 10;
              reasons.push(`Price: Demanding ₹${propLakhs.toFixed(2)}L within client budget limit.`);
            } else {
              mismatches.push(`Price ₹${propLakhs.toFixed(2)}L is slightly above ₹${recordBudgetLakhs}L.`);
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
      } else {
        // Match listing against broker's real buyer records
        const buyers = (await fetchBuyers()) || [];
        setTotalDatabaseCount(buyers.length);

        const scoredBuyers = buyers
          .filter((b) => b.status === 'active' || !b.status)
          .map((b) => {
            let score = 50;
            const reasons: string[] = [];
            const mismatches: string[] = [];

            // Locality match
            const bLocalities = (b.localities || []).map((l) =>
              (typeof l === 'string' ? l : l.display).toLowerCase()
            );
            const matchesLocality =
              b.anyLocality ||
              bLocalities.some((l) => l.includes(recordLocality.toLowerCase()) || recordLocality.toLowerCase().includes(l));

            if (matchesLocality) {
              score += 25;
              reasons.push(`Client looking for properties in ${recordLocality}.`);
            } else {
              mismatches.push(`Client prefers ${bLocalities.join(', ') || 'other sectors'}.`);
            }

            // Property type
            const bTypes = (b.types || []).map((t) => t.toLowerCase());
            if (bTypes.some((t) => t.includes(recordType.toLowerCase()) || recordType.toLowerCase().includes(t))) {
              score += 15;
              reasons.push(`Looking for ${recordType}.`);
            }

            // Budget
            if (b.budget?.maxPaise) {
              reasons.push(`Buyer budget up to ${formatRupees(b.budget.maxPaise)}.`);
            }

            return {
              buyer: b,
              score: Math.min(score, 96),
              reasons,
              mismatches,
            };
          })
          .sort((a, b) => b.score - a.score);

        setMatchedBuyers(scoredBuyers);
      }

      setCurrentStep('matches');
    } catch (err: any) {
      error(err?.message || 'Error finding matches.');
    } finally {
      setIsMatching(false);
    }
  };

  // WhatsApp Share Helper (Preserving Contact Privacy)
  const handleShareBuyerQuote = () => {
    const text = `*Client Requirement Update*\n\n*Seeking:* ${recordBedrooms} ${recordType}\n*Location:* ${recordLocality}, Panipat\n*Budget:* Up to ₹${recordBudgetLakhs} Lakhs\n*Preferences:* ${recordNotes || 'Ready for site inspection'}\n\nShared via ${agencyDisplayName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSharePropertyFlyer = (property: PropertyItem) => {
    const text = `*Verified Property Recommendation*\n\n*${property.title}*\nLocation: ${property.locality}, ${property.city || 'Panipat'}\nType: ${property.type}\nArea: ${property.size.value} ${property.size.unit.toUpperCase()}\nDemand: ${formatRupees(property.priceDemandPaise)}\n\nHighlights: ${property.description || 'Clear title property ready for visit.'}\n\nView Flyer: https://leadnivash.com/flyer/${property._id}\n\nMarketed by: ${agencyDisplayName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-16 text-left">
      {/* ── 1. HEADER (Prompt 5 Spec) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-ink leading-tight">
            Quick Chat
          </h1>
          <p className="text-xs sm:text-sm text-secondary text-muted mt-0.5">
            Paste a client message to find relevant properties.
          </p>
        </div>

        {/* Dictation Language Switcher */}
        {isSupported && currentStep === 'paste' && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-full border border-border text-xs self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setDictationLang('en-IN')}
              className={clsx(
                'px-3 py-1 rounded-full font-semibold transition cursor-pointer',
                dictationLang === 'en-IN'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              Hinglish / English
            </button>
            <button
              type="button"
              onClick={() => setDictationLang('hi-IN')}
              className={clsx(
                'px-3 py-1 rounded-full font-semibold transition cursor-pointer',
                dictationLang === 'hi-IN'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'text-muted hover:text-ink'
              )}
            >
              हिंदी
            </button>
          </div>
        )}
      </div>

      {/* ── 2. THREE-STEP WORKFLOW BAR (Prompt 5 Spec) ── */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-border rounded-xl shadow-xs text-xs font-semibold">
        <button
          type="button"
          onClick={() => setCurrentStep('paste')}
          className={clsx(
            'flex-1 py-1.5 px-2 rounded-lg text-center transition flex items-center justify-center gap-1',
            currentStep === 'paste'
              ? 'bg-brand-600 text-white font-bold shadow-xs'
              : 'text-muted hover:text-ink'
          )}
        >
          <span className="w-4 h-4 rounded-full bg-black/10 inline-flex items-center justify-center text-[10px]">
            1
          </span>
          <span>Paste message</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

        <button
          type="button"
          disabled={!parseResult}
          onClick={() => parseResult && setCurrentStep('review')}
          className={clsx(
            'flex-1 py-1.5 px-2 rounded-lg text-center transition flex items-center justify-center gap-1',
            currentStep === 'review'
              ? 'bg-brand-600 text-white font-bold shadow-xs'
              : parseResult
              ? 'text-muted hover:text-ink cursor-pointer'
              : 'text-slate-300 cursor-not-allowed'
          )}
        >
          <span className="w-4 h-4 rounded-full bg-black/10 inline-flex items-center justify-center text-[10px]">
            2
          </span>
          <span>Review details</span>
        </button>

        <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />

        <button
          type="button"
          disabled={!parseResult}
          onClick={() => parseResult && setCurrentStep('matches')}
          className={clsx(
            'flex-1 py-1.5 px-2 rounded-lg text-center transition flex items-center justify-center gap-1',
            currentStep === 'matches'
              ? 'bg-brand-600 text-white font-bold shadow-xs'
              : parseResult
              ? 'text-muted hover:text-ink cursor-pointer'
              : 'text-slate-300 cursor-not-allowed'
          )}
        >
          <span className="w-4 h-4 rounded-full bg-black/10 inline-flex items-center justify-center text-[10px]">
            3
          </span>
          <span>View matches</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: MESSAGE INPUT, EXAMPLES & ANALYSE ACTION         */}
      {/* ======================================================== */}
      {currentStep === 'paste' && (
        <Card className="p-4 sm:p-5 space-y-4 rounded-2xl bg-white border border-border shadow-card">
          {/* Multiline Message Input */}
          <div className="relative">
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder="Paste a buyer requirement or property listing from WhatsApp..."
              className="w-full bg-white border border-border rounded-xl p-3.5 pr-14 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600 transition shadow-xs leading-relaxed"
            />

            {/* Quick Actions in Textarea */}
            <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5">
              {rawText && (
                <button
                  type="button"
                  onClick={() => setRawText('')}
                  className="p-2 rounded-full text-muted hover:text-ink transition cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={clsx(
                    'w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer',
                    isListening
                      ? 'bg-rose-600 text-white animate-pulse ring-4 ring-rose-200'
                      : 'bg-brand-600 text-white hover:bg-brand-700'
                  )}
                  title={isListening ? 'Stop Voice Input' : 'Speak Message (Voice Input)'}
                >
                  {isListening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>

          {/* Voice Input Live Interim Feedback */}
          {isListening && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span className="font-semibold text-rose-800">
                  Listening ({dictationLang === 'hi-IN' ? 'Hindi' : 'Hinglish'})...
                </span>
                {interimTranscript && (
                  <span className="text-slate-700 italic truncate max-w-xs">
                    "{interimTranscript}"
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={toggleListening}
                className="px-2.5 py-1 rounded bg-rose-600 text-white font-semibold text-[11px] cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

          {/* Input Support Actions (Paste from clipboard & Clear) */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleClipboardPaste}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition cursor-pointer"
            >
              <Clipboard className="w-3.5 h-3.5 text-brand-600" />
              <span>Paste from clipboard</span>
            </button>

            {rawText && (
              <button
                type="button"
                onClick={() => setRawText('')}
                className="text-xs font-semibold text-muted hover:text-ink cursor-pointer"
              >
                Clear input
              </button>
            )}
          </div>

          {/* Selectable Examples (Prompt 5 Spec) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-muted block">
              Select an example to try:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {exampleMessages.map((ex, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setRawText(ex.text)}
                  className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-brand-700 border border-slate-200/80 text-[11px] font-medium transition cursor-pointer"
                >
                  {ex.label}
                </button>
              ))}
            </div>
          </div>

          {/* Full-Width Emerald Analyse Button (Prompt 5 Spec) */}
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={handleAnalyze}
              disabled={isAnalyzing || !rawText.trim() || rawText.trim().length < 5}
              className="w-full min-h-[48px] font-semibold text-sm shadow-sm gap-2"
            >
              {isAnalyzing ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Analysing Message...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyse Message</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 2: EDITABLE EXTRACTION DETAILS (Prompt 5 Spec)       */}
      {/* ======================================================== */}
      {currentStep === 'review' && (
        <Card className="p-4 sm:p-6 space-y-5 rounded-2xl bg-white border border-border shadow-card">
          {/* Step 2 Header & Classification */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-border">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                Review Extracted Details
              </h2>
              <p className="text-xs text-muted">
                Step 2: Correct any values before saving or searching inventory matches.
              </p>
            </div>

            {/* Classification Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-border text-xs self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setItemType('buyer')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1',
                  itemType === 'buyer'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                )}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Buyer Requirement</span>
              </button>
              <button
                type="button"
                onClick={() => setItemType('listing')}
                className={clsx(
                  'px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1',
                  itemType === 'listing'
                    ? 'bg-brand-600 text-white shadow-xs'
                    : 'text-muted hover:text-ink'
                )}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Property Listing</span>
              </button>
            </div>
          </div>

          {/* Missing or Uncertain Values Banner */}
          {(!recordPhone || !recordLocality) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                {!recordPhone && !recordLocality
                  ? 'Client contact number and target sector were not detected. Please enter them below.'
                  : !recordPhone
                  ? 'Contact phone number was missing from the message. Please fill in client contact.'
                  : 'Target locality was not detected clearly. Please review location.'}
              </span>
            </div>
          )}

          {/* Editable Groups */}
          <div className="space-y-4 text-xs">
            {/* Group 1: Identity & Contact */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-600" />
                <span>1. {itemType === 'buyer' ? 'Client / Buyer Information' : 'Owner / Seller Information'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    {itemType === 'buyer' ? 'Buyer Name' : 'Owner Name'}
                  </label>
                  <input
                    type="text"
                    value={recordName}
                    onChange={(e) => setRecordName(e.target.value)}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink flex items-center justify-between">
                    <span>WhatsApp Contact Number</span>
                    <span className="text-[11px] font-normal text-muted flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Vault Protected
                    </span>
                  </label>
                  <input
                    type="tel"
                    value={recordPhone}
                    onChange={(e) => setRecordPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
              </div>
            </div>

            {/* Group 2: Property Type & Location */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-600" />
                <span>2. Property Type & Locality</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Property Type
                  </label>
                  <select
                    value={recordType}
                    onChange={(e) => setRecordType(e.target.value)}
                    className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                  >
                    <option value="Builder Floor">Builder Floor</option>
                    <option value="Residential Plot">Residential Plot</option>
                    <option value="Independent Kothi">Independent Kothi</option>
                    <option value="Apartment / Flat">Apartment / Flat</option>
                    <option value="Commercial Shop">Commercial Shop</option>
                    <option value="Commercial Space">Commercial Space</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Locality / Sector
                  </label>
                  <input
                    type="text"
                    value={recordLocality}
                    onChange={(e) => setRecordLocality(e.target.value)}
                    placeholder="e.g. Model Town, Sector 18"
                    className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    City
                  </label>
                  <input
                    type="text"
                    value={recordCity}
                    onChange={(e) => setRecordCity(e.target.value)}
                    placeholder="e.g. Panipat"
                    className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                </div>
              </div>
            </div>

            {/* Group 3: Budget or Asking Price */}
            <div className="space-y-3 pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-brand-600" />
                <span>3. {itemType === 'buyer' ? 'Target Budget' : 'Asking Price / Demand'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {itemType === 'buyer' ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink block">
                      Maximum Budget (in Lakhs)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        value={recordBudgetLakhs}
                        onChange={(e) => setRecordBudgetLakhs(Number(e.target.value))}
                        className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-brand-600"
                      />
                      <span className="text-xs font-bold text-brand-700 shrink-0">
                        = {formatRupees(recordBudgetLakhs * 10000000)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-ink block">
                      Asking Price / Demand
                    </label>
                    <input
                      type="text"
                      value={recordPriceRaw}
                      onChange={(e) => setRecordPriceRaw(e.target.value)}
                      placeholder="e.g. ₹1.25 Cr"
                      className="w-full min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-ink block">
                    Area Size & Local Unit
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={recordArea}
                      onChange={(e) => setRecordArea(e.target.value)}
                      placeholder="e.g. 250"
                      className="w-2/3 min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-sm text-ink font-bold focus:outline-none focus:ring-2 focus:ring-brand-600"
                    />
                    <select
                      value={recordUnit}
                      onChange={(e) => setRecordUnit(e.target.value)}
                      className="w-1/3 min-h-[48px] bg-white border border-border rounded-input px-3 py-2 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-brand-600 cursor-pointer"
                    >
                      <option value="gaj">Gaj</option>
                      <option value="sqft">Sq. Ft.</option>
                      <option value="marla">Marla</option>
                      <option value="kanal">Kanal</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Group 4: Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-ink block">
                Additional Notes / Extracted Preferences
              </label>
              <textarea
                rows={2}
                value={recordNotes}
                onChange={(e) => setRecordNotes(e.target.value)}
                className="w-full min-h-[60px] bg-white border border-border rounded-input p-3 text-xs text-ink placeholder-muted focus:outline-none focus:ring-2 focus:ring-brand-600"
              />
            </div>
          </div>

          {/* Step 2 Actions Bar */}
          <div className="pt-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setCurrentStep('paste')}
                className="flex-1 sm:flex-initial min-h-[48px] font-semibold text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                <span>Back</span>
              </Button>

              <Button
                type="button"
                variant="secondary"
                size="md"
                disabled={isSaving || Boolean(savedRecordId)}
                onClick={handleSaveRecord}
                className="flex-1 sm:flex-initial min-h-[48px] font-semibold text-xs text-emerald-800 bg-emerald-50 border-emerald-300 hover:bg-emerald-100"
              >
                {savedRecordId ? (
                  <span className="flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Saved ✓</span>
                  </span>
                ) : isSaving ? (
                  <span>Saving...</span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Save className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Save {itemType === 'buyer' ? 'Buyer' : 'Listing'}</span>
                  </span>
                )}
              </Button>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isMatching || !recordLocality.trim()}
              onClick={handleFindMatches}
              className="w-full sm:w-auto min-h-[48px] font-semibold text-xs gap-1.5 shadow-sm"
            >
              {isMatching ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Searching Matches...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Find Matches & View Results</span>
                  <ArrowRight className="w-4 h-4 ml-0.5" />
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STEP 3: REAL MATCHES & ACTIONS (Prompt 5 Spec)          */}
      {/* ======================================================== */}
      {currentStep === 'matches' && (
        <div className="space-y-4">
          {/* Header Summary Card */}
          <Card className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-brand-700 uppercase tracking-wider block">
                {itemType === 'buyer' ? 'Buyer Requirement Matches' : 'Matching Buyer Inquiries'}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                {recordName} · {itemType === 'buyer' ? `Budget ₹${recordBudgetLakhs}L` : recordPriceRaw}
              </h2>
              <p className="text-xs text-muted">
                Target: {recordLocality} ({recordType})
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setCurrentStep('review')}
                className="px-3 py-1.5 rounded-lg bg-white border border-border text-xs font-semibold text-slate-700 hover:text-ink transition cursor-pointer"
              >
                Edit Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setRawText('');
                  setParseResult(null);
                  setSavedRecordId(null);
                  setCurrentStep('paste');
                }}
                className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition cursor-pointer shadow-xs"
              >
                + Paste Another
              </button>
            </div>
          </Card>

          {/* ── Case A: Extracted Item is a Buyer Requirement ── */}
          {itemType === 'buyer' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted px-1">
                <span>{matchedProperties.length} of {totalDatabaseCount} properties matched</span>
                <span>Evaluated against real inventory</span>
              </div>

              {matchedProperties.length === 0 ? (
                <Card className="p-8 text-center space-y-3 rounded-2xl bg-white border border-border shadow-card">
                  <Building2 className="w-8 h-8 text-muted mx-auto" />
                  <h3 className="text-sm font-bold text-ink">
                    No matching properties in your inventory
                  </h3>
                  <p className="text-xs text-secondary text-muted max-w-sm mx-auto">
                    None of your current listings match "{recordLocality}" ({recordType}) within ₹{recordBudgetLakhs}L. Add listings or share the requirement with your network.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Link to="/app/properties/new">
                      <Button size="sm" variant="primary" className="text-xs font-semibold">
                        + Add Property
                      </Button>
                    </Link>
                    <button
                      type="button"
                      onClick={handleShareBuyerQuote}
                      className="px-3.5 py-1.5 rounded-lg border border-border bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp</span>
                    </button>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {matchedProperties.map(({ property, score, reasons, mismatches }) => {
                    const isDealSaved = savedPropertyIds.has(property._id);

                    return (
                      <Card
                        key={property._id}
                        className="p-4 sm:p-5 flex flex-col justify-between rounded-card bg-white border border-border hover:border-brand-600/40 transition shadow-card space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-ink">
                                {property.title}
                              </h3>
                              <Badge variant={score >= 80 ? 'perfect' : 'good'}>
                                {score}% Match
                              </Badge>
                            </div>
                            <p className="text-xs text-muted mt-0.5">
                              {property.locality}, {property.city || 'Panipat'} · {property.size.value} {property.size.unit.toUpperCase()}
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-[10px] uppercase font-semibold text-muted block">Asking Price</span>
                            <span className="text-base font-bold text-ink">
                              {formatRupees(property.priceDemandPaise)}
                            </span>
                          </div>
                        </div>

                        {/* Match Explanation (Prompt 5 Spec) */}
                        <div className="space-y-1 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          {reasons.map((r, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{r}</span>
                            </div>
                          ))}
                          {mismatches.map((m, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-amber-800">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                              <span>{m}</span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => setInspectingProperty(property)}
                            className="text-xs font-semibold text-slate-600 hover:text-ink flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Details</span>
                          </button>

                          <div className="flex items-center gap-2 w-full sm:w-auto">
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isDealSaved}
                              onClick={async () => {
                                if (savedRecordId) {
                                  try {
                                    await createDeal({
                                      buyerId: savedRecordId,
                                      propertyId: property._id,
                                      propertyTitleSnapshot: property.title,
                                      valuePaise: property.priceDemandPaise,
                                      commission: {
                                        mode: 'percent',
                                        bps: 100,
                                      },
                                      stage: 'interested',
                                    });
                                    setSavedPropertyIds((prev) => new Set([...prev, property._id]));
                                    success('Deal created and saved to pipeline!');
                                  } catch (err: any) {
                                    error(err?.message || 'Could not save deal.');
                                  }
                                } else {
                                  setSavedPropertyIds((prev) => new Set([...prev, property._id]));
                                  success('Property marked as interested!');
                                }
                              }}
                              className="flex-1 sm:flex-initial text-xs font-semibold min-h-[40px]"
                            >
                              {isDealSaved ? 'Saved ✓' : 'Save Deal'}
                            </Button>

                            <button
                              type="button"
                              onClick={() => handleSharePropertyFlyer(property)}
                              className="flex-1 sm:flex-initial min-h-[40px] px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
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
              )}
            </div>
          )}

          {/* ── Case B: Extracted Item is a Property Listing ── */}
          {itemType === 'listing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-muted px-1">
                <span>{matchedBuyers.length} of {totalDatabaseCount} active buyers matched</span>
                <span>Evaluated against real client leads</span>
              </div>

              {matchedBuyers.length === 0 ? (
                <Card className="p-8 text-center space-y-3 rounded-2xl bg-white border border-border shadow-card">
                  <Users className="w-8 h-8 text-muted mx-auto" />
                  <h3 className="text-sm font-bold text-ink">
                    No matching buyers found in your records
                  </h3>
                  <p className="text-xs text-secondary text-muted max-w-sm mx-auto">
                    None of your active buyers are currently looking for "{recordLocality}" ({recordType}) in this price range.
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <Link to="/app/buyers/new">
                      <Button size="sm" variant="primary" className="text-xs font-semibold">
                        + Add Buyer Inquiry
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="space-y-3">
                  {matchedBuyers.map(({ buyer, score, reasons }, idx) => {
                    const waShareText = `Namaste ${buyer.name} ji,\n\nAapki requirement ke hisaab se ek listing available hai:\n\n*${recordType} in ${recordLocality}*\nDemand: ${recordPriceRaw}\nArea: ${recordArea} ${recordUnit.toUpperCase()}\n\nInspection ke liye connect karein?\n- ${agencyDisplayName}`;
                    const waUrl = `https://wa.me/${(buyer.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waShareText)}`;

                    return (
                      <Card
                        key={buyer._id || idx}
                        className="p-4 sm:p-5 flex flex-col justify-between rounded-card bg-white border border-border hover:border-brand-600/40 transition shadow-card space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-base font-bold text-ink">{buyer.name}</h3>
                              <Badge variant={score >= 80 ? 'perfect' : 'good'}>
                                {score}% Fit
                              </Badge>
                            </div>
                            <p className="text-xs text-muted mt-0.5">
                              Budget: <strong className="text-ink">{buyer.budget?.maxPaise ? formatRupees(buyer.budget.maxPaise) : 'Flexible'}</strong>
                            </p>
                          </div>

                          <div className="sm:text-right">
                            <span className="text-[10px] uppercase font-semibold text-muted block">Phone</span>
                            <span className="text-xs font-semibold text-slate-700">
                              {buyer.phone || '—'}
                            </span>
                          </div>
                        </div>

                        {/* Match Reasons */}
                        <div className="space-y-1 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                          {reasons.map((r: string, i: number) => (
                            <div key={i} className="flex items-center gap-1.5 text-emerald-800">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{r}</span>
                            </div>
                          ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(waShareText);
                              success(`Message copied for ${buyer.name}!`);
                            }}
                            className="min-h-[40px] px-3 py-1.5 rounded-lg border border-border hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 transition shadow-xs"
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
        </div>
      )}

      {/* Inspect Property Modal */}
      {inspectingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <Card className="w-full max-w-lg p-5 space-y-4 bg-white border border-border rounded-2xl shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-ink">{inspectingProperty.title}</h3>
              <button
                type="button"
                onClick={() => setInspectingProperty(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-ink cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted block text-[10px] font-semibold uppercase">Locality</span>
                <span className="font-semibold text-ink">{inspectingProperty.locality}</span>
              </div>
              <div>
                <span className="text-muted block text-[10px] font-semibold uppercase">Asking Price</span>
                <span className="font-bold text-ink text-sm">
                  {formatRupees(inspectingProperty.priceDemandPaise)}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px] font-semibold uppercase">Area</span>
                <span className="font-semibold text-ink">
                  {inspectingProperty.size.value} {inspectingProperty.size.unit.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-muted block text-[10px] font-semibold uppercase">Facing</span>
                <span className="font-semibold text-ink">{inspectingProperty.facing || 'Open'}</span>
              </div>
            </div>

            {inspectingProperty.description && (
              <p className="text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {inspectingProperty.description}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button size="sm" variant="secondary" onClick={() => setInspectingProperty(null)}>
                Close
              </Button>
              <button
                type="button"
                onClick={() => {
                  handleSharePropertyFlyer(inspectingProperty);
                  setInspectingProperty(null);
                }}
                className="py-1.5 px-3.5 rounded-lg bg-emerald-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
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
