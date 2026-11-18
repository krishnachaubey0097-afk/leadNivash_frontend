import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Mic,
  MicOff,
  Copy,
  Check,
  Building2,
  Users,
  ShieldCheck,
  AlertCircle,
  Save,
  RotateCcw,
  MapPin,
  Tag,
  DollarSign,
  Maximize2,
  Phone,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../components/ui/Toast';
import { parseMessage, commitParsedItem, type ParseResult } from '../../lib/api/parse';
import { useVoiceDictation } from '../../lib/hooks/useVoiceDictation';
import { formatRupees } from '../../lib/money';
import clsx from 'clsx';

export const PastePage: React.FC = () => {
  const navigate = useNavigate();
  const { success, error, toast } = useToast();

  const [rawText, setRawText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [selectedType, setSelectedType] = useState<'listing' | 'buyer'>('listing');
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dictationLang, setDictationLang] = useState<'hi-IN' | 'en-IN'>('hi-IN');

  // Voice dictation hook
  const { isListening, isSupported, toggleListening } = useVoiceDictation({
    lang: dictationLang,
    onTranscript: (spoken) => {
      setRawText((prev) => (prev ? `${prev} ${spoken}` : spoken));
    },
  });

  // Pre-fill samples
  const samples = [
    {
      label: '3 BHK Model Town',
      text: '3 BHK Luxury Builder Floor in Model Town Panipat demand 1.25 Cr. Semi-furnished, 2nd floor with lift & car parking. Owner 9876543210.',
    },
    {
      label: '250 Gaj Plot Sushant City',
      text: 'Residential plot 250 gaj available in Ansals Sushant City Sector 18 Panipat. North facing, 40 ft road, demand 85 Lakhs negotiable.',
    },
    {
      label: 'Buyer: Budget 90 Lakhs',
      text: 'Urgent buyer requirement: Looking for 3 BHK flat or builder floor in Sector 18 or Model Town Panipat. Budget 80 to 95 Lakhs. Immediate closing.',
    },
  ];

  const handleAnalyze = async () => {
    if (!rawText.trim() || rawText.trim().length < 5) {
      toast('Please paste a property description or buyer requirement with at least 5 characters.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await parseMessage(rawText);
      setParseResult(result);
      setSelectedType(result.itemType);
      success(`Extracted successfully as ${result.itemType === 'listing' ? 'Property Listing' : 'Buyer Requirement'}.`);
    } catch (err: any) {
      error(err.message || 'Could not parse message. Try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCommit = async () => {
    if (!parseResult) return;

    setIsSaving(true);
    try {
      const payload =
        selectedType === 'listing'
          ? parseResult.extracted.property || {}
          : parseResult.extracted.buyer || {};

      await commitParsedItem(selectedType, payload);

      success(
        selectedType === 'listing'
          ? 'Property has been added to your inventory.'
          : 'Buyer requirement logged and active for matching.'
      );

      // Redirect to appropriate section
      setTimeout(() => {
        if (selectedType === 'listing') {
          navigate('/app/properties');
        } else {
          navigate('/app/buyers');
        }
      }, 800);
    } catch (err: any) {
      error(err.message || 'Saving failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyClean = () => {
    if (!parseResult) return;
    const prop = parseResult.extracted.property;
    const buyer = parseResult.extracted.buyer;

    const summary =
      selectedType === 'listing' && prop
        ? `🏡 *${prop.title || 'Property Listing'}*\n📍 Locality: ${prop.locality || 'Panipat'}\n📐 Size: ${prop.sizeGaj || prop.sizeValue || '-'} ${prop.sizeUnit || 'Gaj'}\n💰 Demand: ${prop.priceDemandRaw || (prop.priceDemandPaise ? formatRupees(prop.priceDemandPaise) : 'Contact for price')}\n\nShared via leadNivash`
        : `👥 *Client Requirement*\n📍 Preferred: ${buyer?.localities?.join(', ') || 'Panipat'}\n🏠 Type: ${buyer?.propertyType || 'Residential'}\n💰 Budget: ${buyer?.budgetRaw || 'Negotiable'}\n⚡ Urgency: ${buyer?.urgency || 'Immediate'}\n\nShared via leadNivash`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    success('Clean summary copied to clipboard for WhatsApp sharing.');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-ink font-heading tracking-tight">
              Quick Paste & Voice Dictation
            </h1>
            <Badge variant="brand">
              <Sparkles className="w-3 h-3 mr-1 inline" />
              AI Parser
            </Badge>
          </div>
          <p className="text-xs text-muted mt-1">
            Convert unstructured WhatsApp forwards and voice notes into structured deals instantly.
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

      {/* Input Card */}
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

        {/* Textarea with Voice Dictation Overlay */}
        <div className="relative">
          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste forwarded WhatsApp property message or client requirement here... or click the mic to speak in Hindi/English."
            className="w-full bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-xs sm:text-sm text-ink placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition"
          />

          {/* Action buttons embedded in bottom right */}
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
                title={isListening ? 'Stop Listening' : 'Start Voice Dictation'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Listening indicator */}
        {isListening && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-400 flex items-center justify-between animate-pulse">
            <span className="flex items-center gap-2 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              Listening ({dictationLang === 'hi-IN' ? 'Hindi' : 'English'})... Speak clearly into your mic.
            </span>
            <button
              onClick={toggleListening}
              className="font-bold underline text-[11px] cursor-pointer"
            >
              Stop
            </button>
          </div>
        )}

        {/* Privacy Shield & Submit Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2 text-[11px] text-muted">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Strict Privacy: Phone numbers & client contacts are masked and secured.</span>
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
                <span>Extracting with AI...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Extract & Review</span>
              </span>
            )}
          </Button>
        </div>
      </Card>

      {/* ======================================================== */}
      {/* EXTRACTED RESULT REVIEW CARD                             */}
      {/* ======================================================== */}
      {parseResult && (
        <Card className="p-5 sm:p-6 space-y-5 border-emerald-500/40 shadow-xl bg-white dark:bg-slate-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
          {/* Card Top: Intent Switcher & Accuracy Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/80">
            <div className="flex items-center gap-2">
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-full border border-border">
                <button
                  onClick={() => setSelectedType('listing')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer',
                    selectedType === 'listing'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Property Listing</span>
                </button>
                <button
                  onClick={() => setSelectedType('buyer')}
                  className={clsx(
                    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer',
                    selectedType === 'buyer'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-muted hover:text-ink'
                  )}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Buyer Requirement</span>
                </button>
              </div>
            </div>

            <Badge variant="perfect">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5"></span>
              {Math.round((parseResult.confidence.overall || 0.94) * 100)}% Extraction Confidence
            </Badge>
          </div>

          {/* Warnings if any */}
          {parseResult.warnings.length > 0 && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-bold">Attention:</span>
                {parseResult.warnings.map((w, i) => (
                  <p key={i}>{w}</p>
                ))}
              </div>
            </div>
          )}

          {/* Field Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Field: Title / Category */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-600" />
                Category & Type
              </span>
              <p className="font-bold text-ink text-sm">
                {selectedType === 'listing'
                  ? parseResult.extracted.property?.title ||
                    `${parseResult.extracted.property?.propertyType?.replace(/_/g, ' ') || 'Property'}`
                  : `Requirement: ${parseResult.extracted.buyer?.propertyType?.replace(/_/g, ' ') || 'Residential'}`}
              </p>
            </div>

            {/* Field: Price / Budget */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-emerald-600" />
                {selectedType === 'listing' ? 'Demand / Asking Price' : 'Client Budget'}
              </span>
              <p className="font-black text-emerald-700 dark:text-emerald-400 text-sm">
                {selectedType === 'listing'
                  ? parseResult.extracted.property?.priceDemandRaw ||
                    (parseResult.extracted.property?.priceDemandPaise
                      ? formatRupees(parseResult.extracted.property.priceDemandPaise)
                      : 'Call for Price')
                  : parseResult.extracted.buyer?.budgetRaw ||
                    (parseResult.extracted.buyer?.budgetMaxPaise
                      ? formatRupees(parseResult.extracted.buyer.budgetMaxPaise)
                      : 'Negotiable')}
              </p>
            </div>

            {/* Field: Locality */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" />
                Target Locality
              </span>
              <p className="font-bold text-ink text-sm">
                {selectedType === 'listing'
                  ? `${parseResult.extracted.property?.locality || 'Panipat'}, ${parseResult.extracted.property?.city || 'Haryana'}`
                  : parseResult.extracted.buyer?.localities?.join(', ') || 'Panipat Central'}
              </p>
            </div>

            {/* Field: Size / BHK */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-border space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <Maximize2 className="w-3 h-3 text-emerald-600" />
                Area / Layout
              </span>
              <p className="font-bold text-ink text-sm">
                {selectedType === 'listing'
                  ? `${parseResult.extracted.property?.sizeGaj || parseResult.extracted.property?.sizeValue || '180'} ${parseResult.extracted.property?.sizeUnit || 'Gaj'} · ${parseResult.extracted.property?.bhk ? `${parseResult.extracted.property.bhk} BHK` : 'Residential Plot'}`
                  : `${parseResult.extracted.buyer?.bhk ? parseResult.extracted.buyer.bhk.join(', ') + ' BHK' : '2-3 BHK'} · Urgency: ${parseResult.extracted.buyer?.urgency || 'Immediate'}`}
              </p>
            </div>
          </div>

          {/* Contact & Owner Vault */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                  {selectedType === 'listing' ? 'Owner Contact' : 'Buyer Contact'}
                </span>
                <p className="font-bold text-ink">
                  {selectedType === 'listing'
                    ? parseResult.extracted.property?.ownerPhone || '+91 ••••• ••••• (Shielded)'
                    : parseResult.extracted.buyer?.phone || '+91 ••••• ••••• (Shielded)'}
                </p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full">
              Vault Protected
            </span>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-border">
            <button
              onClick={handleCopyClean}
              className="w-full sm:w-auto px-4 py-2.5 rounded-full border border-border hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-muted hover:text-ink flex items-center justify-center gap-2 transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Summary Copied' : 'Copy Clean WhatsApp Format'}</span>
            </button>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="secondary"
                size="md"
                pill
                onClick={() => setParseResult(null)}
                className="flex-1 sm:flex-none text-xs"
              >
                Reset
              </Button>

              <Button
                size="md"
                pill
                onClick={handleCommit}
                disabled={isSaving}
                className="flex-1 sm:flex-none font-bold text-xs shadow-md shadow-emerald-700/20"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Saving Deal...</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Save className="w-4 h-4" />
                    <span>
                      {selectedType === 'listing' ? 'Save as Property' : 'Save as Buyer'}
                    </span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
