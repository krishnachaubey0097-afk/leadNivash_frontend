import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import {
  Sparkles,
  Mic,
  Check,
  Building2,
  Users,
  ShieldCheck,
  AlertCircle,
  Save,
  ArrowUpRight,
  ArrowLeft,
  Share2,
  Eye,
  CheckCircle2,
  Copy,
  Square,
  Clipboard,
  X,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Clock,
  Globe,
  Crown,
  Send,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { CustomSelect } from '../../components/ui/CustomSelect';
import { Modal } from '../../components/ui/Modal';
import { StatusChip } from '../../components/ui/Chip';
import { useToast } from '../../components/ui/Toast';
import { parseMessage, commitParsedItem, type ParseResult } from '../../lib/api/parse';
import { useVoiceDictation } from '../../lib/hooks/useVoiceDictation';
import { fetchProperties, recordPropertyPitch, type PropertyItem } from '../../lib/api/properties';
import { fetchBuyers } from '../../lib/api/buyers';
import { createDeal } from '../../lib/api/deals';
import { formatRupees } from '../../lib/money';
import { useAuth } from '../auth/AuthProvider';
import clsx from 'clsx';

type LanguageChipOption = 'english' | 'hinglish' | 'hindi';

interface RecentExtractionItem {
  id: string;
  rawText: string;
  itemType: 'buyer' | 'listing';
  title: string;
  locality: string;
  priceLabel: string;
  extractedAt: string;
  result: ParseResult;
}

const RECENT_EXTRACTIONS_KEY = 'leadnivash_recent_extractions_v1';

export const PastePage: React.FC = () => {
  const { user } = useAuth();
  const { success, error, toast } = useToast();
  const location = useLocation();

  const agencyDisplayName = user?.agency?.name || user?.name || 'Verified Broker';

  // Workflow Steps: 'paste' (Step 1) | 'review' (Step 2) | 'matches' (Step 3)
  const [currentStep, setCurrentStep] = useState<'paste' | 'review' | 'matches'>('paste');

  const [rawText, setRawText] = useState(() => {
    const state = location.state as { prefill?: string } | null;
    return state?.prefill?.trim() || '';
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [languageOption, setLanguageOption] = useState<LanguageChipOption>('hinglish');
  const dictationLang: 'en-IN' | 'hi-IN' = languageOption === 'hindi' ? 'hi-IN' : 'en-IN';

  const languageLabels: Record<LanguageChipOption, string> = {
    english: 'English',
    hinglish: 'Hinglish',
    hindi: 'हिंदी',
  };

  // Live-updating Recent Extractions (last 5) persisted for session continuity
  const [recentExtractions, setRecentExtractions] = useState<RecentExtractionItem[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_EXTRACTIONS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
      }
    } catch {
      // ignore storage errors
    }
    return [];
  });

  useEffect(() => {
    const state = location.state as { prefill?: string } | null;
    if (state?.prefill?.trim()) {
      setRawText(state.prefill.trim());
    }
  }, [location.state]);

  // Mandatory Classification in Step 2: null until user explicitly picks Buyer or Seller
  const [itemType, setItemType] = useState<'buyer' | 'listing' | null>(null);
  const [suggestedItemType, setSuggestedItemType] = useState<'buyer' | 'listing' | null>(null);
  const [savedPropertyPitchCount, setSavedPropertyPitchCount] = useState<number>(0);

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
  const [savedBuyerIds, setSavedBuyerIds] = useState<Set<string>>(new Set());

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

  // Selectable examples clearly labeled as examples (compact labels to fit single row cleanly)
  const exampleMessages = [
    {
      label: 'Buyer: 3 BHK Model Town',
      text: 'Urgent buyer requirement: Need 3 BHK luxury builder floor in Model Town or Sector 11 Panipat. Budget 1.10 to 1.35 Cr with lift & car parking. Client: Rajesh Sharma 9876543210.',
    },
    {
      label: 'Listing: 250 Gaj Plot',
      text: 'Available for Sale: Residential plot 250 gaj in Ansals Sushant City Sector 18 Panipat. North facing, 40 ft road, demand 85 Lakhs negotiable. Owner: 9812044321.',
    },
    {
      label: 'Buyer: Commercial Shop',
      text: 'Client looking for commercial shop on GT Road or Chandni Bagh Panipat. Budget 70 to 90 Lakhs for rental return. Contact: Vikram Verma 9876500002.',
    },
    {
      label: 'Listing: Sector 18 Floor',
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

  // Helper: Populate Step 2 review fields from a ParseResult
  const applyParseResult = (
    result: ParseResult,
    sourceText: string,
    autoSelectRole = false
  ) => {
    setParseResult(result);
    setSuggestedItemType(result.itemType);
    setItemType(autoSelectRole ? result.itemType : null);
    setSavedRecordId(null);
    setSavedPropertyPitchCount(0);
    setSavedPropertyIds(new Set());
    setSavedBuyerIds(new Set());

    const fallbackCity = user?.agency?.city || 'Panipat';
    const b = result.extracted?.buyer;
    const p = result.extracted?.property;

    if (result.itemType === 'buyer') {
      setRecordName(b?.name || 'Direct Buyer');
      setRecordPhone(b?.phone || '');
      setRecordLocality(b?.localities?.[0] || fallbackCity);
      setRecordCity(fallbackCity);
      setRecordType(b?.propertyType ? b.propertyType.replace(/_/g, ' ') : 'Builder Floor');
      setRecordBudgetLakhs(
        b?.budgetMaxPaise ? Math.max(5, Math.round(b.budgetMaxPaise / 10000000)) : 100
      );
      setRecordPriceRaw(b?.budgetRaw || (b?.budgetMaxPaise ? formatRupees(b.budgetMaxPaise) : '₹1.00 Cr'));
      setRecordBedrooms(b?.bhk?.[0] ? `${b.bhk[0]} BHK` : '3 BHK');
      setRecordArea('200');
      setRecordUnit('gaj');
      setRecordNotes(sourceText);
    } else {
      setRecordName(p?.ownerName || 'Property Owner');
      setRecordPhone(p?.ownerPhone || '');
      setRecordLocality(p?.locality || fallbackCity);
      setRecordCity(p?.city || fallbackCity);
      setRecordType((p as any)?.type || p?.propertyType || 'Builder Floor');
      setRecordPriceRaw(p?.priceDemandRaw || (p?.priceDemandPaise ? formatRupees(p.priceDemandPaise) : '₹1.00 Cr'));
      setRecordBudgetLakhs(
        p?.priceDemandPaise ? Math.max(5, Math.round(p.priceDemandPaise / 10000000)) : 100
      );
      setRecordArea(p?.sizeValue ? String(p.sizeValue) : '200');
      setRecordUnit(p?.sizeUnit || 'gaj');
      setRecordFacing((p as any)?.facing || 'North-East');
      setRecordBedrooms(p?.bhk ? `${p.bhk} BHK` : '3 BHK');
      setRecordNotes(sourceText);
    }
  };

  // STEP 1: Extract details / Analyse Message — ALWAYS proceeds to Step 2 even on unmatched text
  const handleAnalyze = async () => {
    const cleaned = rawText.trim();
    if (cleaned.length < 2) {
      toast('Please write or paste a message first.', 'error');
      return;
    }

    setIsAnalyzing(true);
    try {
      let result: ParseResult;
      try {
        result = await parseMessage(cleaned, Number((user as any)?.preferences?.marlaToGaj) || 30.25);
      } catch {
        result = {
          itemType: 'buyer',
          extracted: {
            buyer: {
              name: 'Client Inquiry',
              localities: [user?.agency?.city || 'Panipat'],
            },
          },
          confidence: { propertyType: 0.4, price: 0.3, locality: 0.4, overall: 0.35 },
          warnings: ['Could not auto-detect structure — please choose Buyer or Seller and complete details below.'],
        };
      }

      if (!result || (result.itemType !== 'buyer' && result.itemType !== 'listing')) {
        result = {
          itemType: 'buyer',
          extracted: {
            buyer: { name: 'Client Inquiry', localities: [user?.agency?.city || 'Panipat'] },
          },
          confidence: { propertyType: 0.4, price: 0.3, locality: 0.4, overall: 0.35 },
          warnings: ['Review details and pick Buyer or Seller to continue.'],
        };
      }

      applyParseResult(result, cleaned, false);

      const loc =
        result.itemType === 'buyer'
          ? result.extracted?.buyer?.localities?.[0] || user?.agency?.city || 'Panipat'
          : result.extracted?.property?.locality || user?.agency?.city || 'Panipat';
      const title =
        result.itemType === 'buyer'
          ? result.extracted?.buyer?.name || 'Buyer Requirement'
          : result.extracted?.property?.title ||
          result.extracted?.property?.propertyType?.replace(/_/g, ' ') ||
          'Property Listing';
      const priceLabel =
        result.itemType === 'buyer'
          ? result.extracted?.buyer?.budgetRaw ||
          (result.extracted?.buyer?.budgetMaxPaise
            ? formatRupees(result.extracted.buyer.budgetMaxPaise)
            : 'Flexible')
          : result.extracted?.property?.priceDemandRaw ||
          (result.extracted?.property?.priceDemandPaise
            ? formatRupees(result.extracted.property.priceDemandPaise)
            : 'On request');

      const entry: RecentExtractionItem = {
        id: `ext_${Date.now()}`,
        rawText: cleaned,
        itemType: result.itemType,
        title,
        locality: loc,
        priceLabel,
        extractedAt: new Date().toISOString(),
        result,
      };

      setRecentExtractions((prev) => {
        const updated = [entry, ...prev.filter((item) => item.rawText !== cleaned)].slice(0, 5);
        try {
          localStorage.setItem(RECENT_EXTRACTIONS_KEY, JSON.stringify(updated));
        } catch {
          // ignore storage quota errors
        }
        return updated;
      });

      setCurrentStep('review');
      success('Proceed to Step 2: Select Buyer or Seller & review details.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Canonical unit conversion to Gaj for accurate ranking across Gaj, Sq.Ft, Marla, Kanal
  const toCanonicalGaj = (val: number, unit: string): number => {
    const n = Number(val) || 0;
    if (n <= 0) return 0;
    const u = (unit || 'gaj').toLowerCase();
    if (u === 'sqft' || u === 'sq.ft') return n / 9;
    if (u === 'marla') return n * (Number((user as any)?.preferences?.marlaToGaj) || 30.25);
    if (u === 'kanal') return n * 605;
    if (u === 'acre') return n * 4840;
    if (u === 'bigha') return n * 1000;
    return n;
  };

  const normalizePropertyTypeBucket = (raw: string): string => {
    const s = (raw || '').toLowerCase();
    if (s.includes('floor')) return 'floor';
    if (s.includes('flat') || s.includes('apartment')) return 'flat';
    if (s.includes('kothi') || s.includes('house') || s.includes('villa')) return 'kothi';
    if (s.includes('shop') || s.includes('commercial') || s.includes('sco')) return 'shop';
    if (s.includes('plot') || s.includes('land')) return 'plot';
    return s.trim();
  };

  const parseDemandPaiseFromInput = (raw: string, fallbackLakhs: number): number => {
    const text = (raw || '').toLowerCase();
    const cr = text.match(/(\d+(?:\.\d+)?)\s*(?:cr|crore)/i);
    const lac = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lacs|lac|l\b)/i);
    if (cr) return Math.round(parseFloat(cr[1]) * 10000000 * 100);
    if (lac) return Math.round(parseFloat(lac[1]) * 100000 * 100);
    const digits = parseFloat(text.replace(/[^0-9.]/g, ''));
    if (!isNaN(digits) && digits > 0) {
      return digits < 500 ? Math.round(digits * 100000 * 100) : Math.round(digits * 100);
    }
    return Math.max(10000, Math.round(fallbackLakhs * 100000 * 100));
  };

  // Shared helper: Persists Buyer or Seller Listing in MongoDB (no duplicates)
  const persistStep2Record = async (silentIfAlreadySaved = false): Promise<string | null> => {
    if (!itemType) {
      error('Please select Buyer or Seller before continuing.');
      return null;
    }

    if (savedRecordId) {
      if (!silentIfAlreadySaved) {
        toast('Record already saved.', 'info');
      }
      return savedRecordId;
    }

    const effectiveLocality = recordLocality.trim() || recordCity.trim() || 'Panipat';
    setIsSaving(true);
    try {
      if (itemType === 'buyer') {
        const budgetMaxPaise = Math.max(100000, Math.round((recordBudgetLakhs || 50) * 100000 * 100));
        const budgetMinPaise = Math.round(budgetMaxPaise * 0.8);
        const areaGaj = Math.round(toCanonicalGaj(Number(recordArea) || 200, recordUnit));

        const res = await commitParsedItem('buyer', {
          name: recordName.trim() || 'Direct Client',
          phone: recordPhone.trim() || user?.phone || '+919999999999',
          localities: [effectiveLocality],
          types: [recordType],
          budget: {
            minPaise: budgetMinPaise,
            maxPaise: budgetMaxPaise,
          },
          sizeGaj: areaGaj > 0 ? { min: Math.round(areaGaj * 0.75), max: Math.round(areaGaj * 1.25) } : undefined,
          notes: `${recordBedrooms} · ${recordNotes}`.trim(),
          rawText,
        });

        const newId =
          (res as any)?.item?._id ||
          (res as any)?.buyer?._id ||
          (res as any)?._id ||
          `buyer_${Date.now()}`;
        setSavedRecordId(newId);
        window.dispatchEvent(new Event('leadnivash_data_changed'));
        return newId;
      } else {
        const pricePaise = parseDemandPaiseFromInput(recordPriceRaw, recordBudgetLakhs);
        const areaVal = Number(recordArea) > 0 ? Number(recordArea) : 200;
        const payload = {
          title: `${recordBedrooms ? `${recordBedrooms} ` : ''}${recordType} in ${effectiveLocality}`,
          locality: effectiveLocality,
          city: recordCity.trim() || 'Panipat',
          type: recordType,
          priceDemandPaise: pricePaise,
          priceDemandRaw: recordPriceRaw,
          size: { value: areaVal, unit: recordUnit },
          sizeGaj: Math.round(toCanonicalGaj(areaVal, recordUnit)) || 200,
          facing: recordFacing,
          ownerName: recordName.trim() || 'Property Owner',
          ownerPhone: recordPhone.trim(),
          description: recordNotes,
        };

        const res = await commitParsedItem('listing', payload);
        const newId =
          (res as any)?.item?._id ||
          (res as any)?.property?._id ||
          (res as any)?._id ||
          `prop_${Date.now()}`;
        setSavedRecordId(newId);
        setSavedPropertyPitchCount((res as any)?.item?.pitchCount || 0);
        window.dispatchEvent(new Event('leadnivash_data_changed'));
        return newId;
      }
    } catch (err: any) {
      error(err?.message || 'Could not save details. Please try again.');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  // STEP 2 Explicit Save button
  const handleSaveRecord = async () => {
    if (isSaving || savedRecordId) return;
    const savedId = await persistStep2Record(false);
    if (savedId) {
      success(
        itemType === 'buyer'
          ? `Buyer "${recordName || 'Client'}" saved to your database!`
          : 'Seller property saved to your inventory!'
      );
    }
  };

  // STEP 2 -> STEP 3: Save record automatically & rank opposite-side matches
  const handleFindMatches = async () => {
    if (!itemType) {
      error('Please select Buyer or Seller first (mandatory).');
      return;
    }

    setIsMatching(true);
    try {
      const savedId = await persistStep2Record(true);
      if (!savedId) return;

      const effectiveLocality = (recordLocality.trim() || 'Panipat').toLowerCase();
      const targetBucket = normalizePropertyTypeBucket(recordType);
      const targetAreaGaj = toCanonicalGaj(Number(recordArea) || 200, recordUnit);

      if (itemType === 'buyer') {
        const properties = (await fetchProperties()) || [];
        setTotalDatabaseCount(properties.length);
        const buyerBudgetPaise = Math.max(100000, Math.round((recordBudgetLakhs || 50) * 100000 * 100));

        const scored = properties
          .filter((p) => p.status === 'available' || !p.status)
          .map((p) => {
            let score = 20;
            const reasons: string[] = [];
            const mismatches: string[] = [];

            // 1. Locality Match (+30)
            const pLoc = (p.locality || '').toLowerCase();
            if (pLoc.includes(effectiveLocality) || effectiveLocality.includes(pLoc)) {
              score += 30;
              reasons.push(`Prime Sector Fit: Located in ${p.locality}.`);
            } else {
              mismatches.push(`Located in ${p.locality} (requested ${recordLocality || 'Panipat'}).`);
            }

            // 2. Budget Fit (+25)
            const askPaise = p.priceDemandPaise || 0;
            if (askPaise > 0 && askPaise <= buyerBudgetPaise) {
              score += 25;
              reasons.push(`Within Budget: Asking ${formatRupees(askPaise)} ≤ ₹${recordBudgetLakhs}L.`);
            } else if (askPaise > 0 && askPaise <= buyerBudgetPaise * 1.15) {
              score += 14;
              reasons.push(`Near Budget (+15% stretch): ${formatRupees(askPaise)}.`);
            } else if (askPaise > 0) {
              mismatches.push(`Above budget by ${Math.round(((askPaise - buyerBudgetPaise) / buyerBudgetPaise) * 100)}%.`);
            }

            // 3. Size Fit (+15)
            const propGaj = toCanonicalGaj(p.size?.value || 0, p.size?.unit || 'gaj');
            if (targetAreaGaj > 0 && propGaj > 0) {
              const diffRatio = Math.abs(propGaj - targetAreaGaj) / targetAreaGaj;
              if (diffRatio <= 0.15) {
                score += 15;
                reasons.push(`Ideal Area Size: ${p.size.value} ${p.size.unit.toUpperCase()} fits target.`);
              } else if (diffRatio <= 0.35) {
                score += 8;
                reasons.push(`Close Area Size: ${p.size.value} ${p.size.unit.toUpperCase()}.`);
              } else {
                mismatches.push(`Area (${p.size.value} ${p.size.unit.toUpperCase()}) differs from ${recordArea} ${recordUnit.toUpperCase()}.`);
              }
            }

            // 4. Property Type Match (+10)
            if (normalizePropertyTypeBucket(p.type || '') === targetBucket) {
              score += 10;
              reasons.push(`Exact Type Match: ${p.type}.`);
            } else {
              mismatches.push(`Property type is ${p.type}.`);
            }

            return {
              property: p,
              score: Math.min(99, Math.max(25, score)),
              reasons,
              mismatches,
            };
          })
          .sort((a, b) => b.score - a.score);

        setMatchedProperties(scored);
        success(`Buyer saved! Ranked ${scored.length} seller properties.`);
      } else {
        const buyers = (await fetchBuyers()) || [];
        setTotalDatabaseCount(buyers.length);
        const sellerAskPaise = parseDemandPaiseFromInput(recordPriceRaw, recordBudgetLakhs);

        const scoredBuyers = buyers
          .filter((b) => b.status === 'active' || !b.status)
          .map((b) => {
            let score = 20;
            const reasons: string[] = [];
            const mismatches: string[] = [];

            // 1. Locality Fit (+30)
            const bLocalities = (b.localities || []).map((l) =>
              (typeof l === 'string' ? l : l.display).toLowerCase()
            );
            const matchesLocality =
              b.anyLocality ||
              bLocalities.some((l) => l.includes(effectiveLocality) || effectiveLocality.includes(l));

            if (matchesLocality) {
              score += 30;
              reasons.push(`Actively seeking ${recordLocality || 'this sector'}.`);
            } else {
              mismatches.push(`Prefers ${bLocalities.join(', ') || 'other sectors'}.`);
            }

            // 2. Budget Fit (+25)
            const maxB = b.budget?.maxPaise || 0;
            if (maxB >= sellerAskPaise) {
              score += 25;
              reasons.push(`Strong Budget: Client capacity up to ${formatRupees(maxB)}.`);
            } else if (maxB >= sellerAskPaise * 0.85) {
              score += 14;
              reasons.push(`Negotiable Budget: Up to ${formatRupees(maxB)}.`);
            } else if (maxB > 0) {
              mismatches.push(`Buyer max budget (${formatRupees(maxB)}) is below demand.`);
            }

            // 3. Size Fit (+15)
            if (b.sizeGaj?.min || b.sizeGaj?.max) {
              const minG = b.sizeGaj.min || 0;
              const maxG = b.sizeGaj.max || minG * 1.4;
              if (targetAreaGaj >= minG * 0.85 && targetAreaGaj <= maxG * 1.15) {
                score += 15;
                reasons.push(`Area Match: Looking for ${minG}–${Math.round(maxG)} Gaj.`);
              }
            }

            // 4. Property Type & Urgency (+10)
            const bTypes = (b.types || []).map((t) => normalizePropertyTypeBucket(t));
            if (bTypes.includes(targetBucket)) {
              score += 8;
              reasons.push(`Looking specifically for ${recordType}.`);
            }
            if (b.urgency === 'hot') {
              score += 5;
              reasons.push('Hot priority buyer.');
            }

            return {
              buyer: b,
              score: Math.min(99, Math.max(25, score)),
              reasons,
              mismatches,
            };
          })
          .sort((a, b) => b.score - a.score);

        setMatchedBuyers(scoredBuyers);
        success(`Seller listing saved! Ranked ${scoredBuyers.length} matching buyers.`);
      }

      setCurrentStep('matches');
    } catch (err: any) {
      error(err?.message || 'Error finding matches.');
    } finally {
      setIsMatching(false);
    }
  };

  // Increment sent/pitch count on a property card + persist via MongoDB API
  const bumpPropertyPitchCount = async (propertyId: string) => {
    setMatchedProperties((prev) =>
      prev.map((m) =>
        m.property._id === propertyId
          ? { ...m, property: { ...m.property, pitchCount: (m.property.pitchCount || 0) + 1 } }
          : m
      )
    );
    if (!propertyId.startsWith('prop_seed_') && !propertyId.startsWith('sim_')) {
      const updated = await recordPropertyPitch(propertyId);
      setMatchedProperties((prev) =>
        prev.map((m) =>
          m.property._id === propertyId
            ? { ...m, property: { ...m.property, pitchCount: updated.pitchCount } }
            : m
        )
      );
    }
  };

  const buildPropertyPitchText = (property: PropertyItem) =>
    `*Verified Property Recommendation*\n\n*${property.title}*\nLocation: ${property.locality}, ${property.city || 'Panipat'}\nType: ${property.type}\nArea: ${property.size.value} ${property.size.unit.toUpperCase()}\nDemand: ${formatRupees(property.priceDemandPaise)}\n\nHighlights: ${property.description || 'Clear title property ready for visit.'}\n\nMarketed by: ${agencyDisplayName}`;

  // WhatsApp Share Helper (Preserving Contact Privacy + Updating Pitch Count)
  const handleShareBuyerQuote = () => {
    const text = `*Client Requirement Update*\n\n*Seeking:* ${recordBedrooms} ${recordType}\n*Location:* ${recordLocality}, ${recordCity || 'Panipat'}\n*Budget:* Up to ₹${recordBudgetLakhs} Lakhs\n*Preferences:* ${recordNotes || 'Ready for site inspection'}\n\nShared via ${agencyDisplayName}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSharePropertyFlyer = (property: PropertyItem) => {
    const text = buildPropertyPitchText(property);
    void bumpPropertyPitchCount(property._id);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyTextSafely = async (text: string) => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
    } catch {
      // Fallback below when clipboard permission is denied (e.g. WebViews)
    }
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    } catch {
      // ignore fallback error
    }
  };

  const handleCopyPropertyFlyer = (property: PropertyItem) => {
    const text = buildPropertyPitchText(property);
    void copyTextSafely(text);
    void bumpPropertyPitchCount(property._id);
    success(`Property pitch copied! Sent count updated for "${property.title}".`);
  };

  const bumpSavedSellerPitch = async () => {
    setSavedPropertyPitchCount((c) => c + 1);
    if (savedRecordId && !savedRecordId.startsWith('sim_')) {
      const res = await recordPropertyPitch(savedRecordId);
      setSavedPropertyPitchCount(res.pitchCount);
    }
  };

  const isAnalyzeEnabled = rawText.trim().length >= 2 && !isAnalyzing;
  const hasRecentExtractions = recentExtractions.length > 0;

  return (
    <div
      className={clsx(
        'space-y-5 pb-16 mx-auto text-left',
        hasRecentExtractions ? 'max-w-[1200px]' : 'max-w-[720px]'
      )}
    >
      {/* ── 1. HEADER (Connected to dark-green Sidebar with 10% dark status badge) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-ink-900 to-brand-700 bg-clip-text text-transparent leading-tight">
            Quick Chat
          </h1>
          <p className="text-xs sm:text-sm text-ink-700 mt-0.5">
            Paste a client message to find relevant properties.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-ink-black text-white text-xs font-semibold border border-white/10 self-start sm:self-auto shrink-0 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0" />
          <span>AI Parser · Privacy Masked</span>
        </span>
      </div>

      {/* Responsive Desktop Layout: 2 cols (>=1280px) with 560px workflow left + Recent extractions right when data exists, otherwise centered <=720px */}
      <div
        className={clsx(
          hasRecentExtractions
            ? 'space-y-6 xl:space-y-0 xl:grid xl:grid-cols-[560px_1fr] xl:gap-6 xl:items-start'
            : 'w-full'
        )}
      >
        <div className="space-y-4 min-w-0">
          {/* ── 2. THREE-STEP STEPPER (Paste · Review · Matches) ── */}
          <div className="flex items-center gap-2 p-1.5 bg-white border border-border rounded-xl shadow-2xs text-xs font-semibold">
            {(
              [
                { id: 'paste', label: 'Paste', num: 1, disabled: false, done: currentStep !== 'paste' },
                { id: 'review', label: 'Review', num: 2, disabled: !parseResult, done: currentStep === 'matches' },
                { id: 'matches', label: 'Matches', num: 3, disabled: !parseResult, done: false },
              ] as const
            ).map((step, idx) => {
              const isCurrent = currentStep === step.id;
              return (
                <React.Fragment key={step.id}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
                  <button
                    type="button"
                    disabled={step.disabled}
                    onClick={() => !step.disabled && setCurrentStep(step.id)}
                    className={clsx(
                      'flex-1 py-2 px-3 rounded-lg text-center transition flex items-center justify-center gap-2 whitespace-nowrap',
                      isCurrent
                        ? 'bg-ink-black border border-ink-black text-white font-bold shadow-2xs cursor-pointer'
                        : !step.disabled
                          ? 'text-ink-700 hover:text-ink-900 hover:bg-lime-soft/50 cursor-pointer'
                          : 'text-ink-500 cursor-not-allowed'
                    )}
                  >
                    <span
                      className={clsx(
                        'w-5 h-5 rounded-full inline-flex items-center justify-center text-[10px] font-bold shrink-0',
                        step.done
                          ? 'bg-brand-600 text-white'
                          : isCurrent
                            ? 'bg-lime text-ink-black'
                            : 'border border-line bg-slate-100 text-ink-500'
                      )}
                    >
                      {step.done ? (
                        <Check className="w-3 h-3" />
                      ) : (
                        step.num
                      )}
                    </span>
                    <span>{step.label}</span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* STEP 1: MESSAGE INPUT, EXAMPLES & EXTRACT ACTION         */}
          {/* ======================================================== */}
          {currentStep === 'paste' && (
            <Card className="p-4 sm:p-5 space-y-4 rounded-[14px] bg-white border border-border">
              {/* Textarea + Unified Footer inside Box */}
              <div className="rounded-xl border border-border bg-white focus-within:ring-2 focus-within:ring-brand-600 focus-within:border-transparent transition-all overflow-hidden">
                <textarea
                  rows={5}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste a buyer requirement or property listing from WhatsApp..."
                  className="w-full bg-transparent p-3.5 text-sm text-ink placeholder-slate-400 focus:outline-none leading-relaxed resize-none"
                />

                {/* Interim Speech Preview — visually separate (italic, ink-400) until finalized */}
                {isListening && interimTranscript && (
                  <div className="px-3.5 pb-2 text-sm italic text-slate-400 leading-relaxed border-t border-slate-100 pt-1.5 bg-slate-50/40">
                    {interimTranscript}
                  </div>
                )}

                {/* Unified Textarea Footer: Single Language Chip ("Hinglish ▾") + Paste/Clear + Mic */}
                <div className="px-3 py-2 bg-slate-50/70 border-t border-border/70 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* ONE Language Chip ("Hinglish ▾": English, Hinglish, हिंदी) */}
                    <DropdownMenu.Root>
                      <DropdownMenu.Trigger asChild>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-border text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer whitespace-nowrap"
                        >
                          <Globe className="w-3.5 h-3.5 text-brand-600" />
                          <span>{languageLabels[languageOption]}</span>
                          <ChevronDown className="w-3 h-3 text-slate-400" />
                        </button>
                      </DropdownMenu.Trigger>
                      <DropdownMenu.Portal>
                        <DropdownMenu.Content
                          className="z-50 min-w-[140px] bg-white border border-border p-1 rounded-[14px] shadow-xl animate-in fade-in zoom-in-95 duration-150"
                          sideOffset={6}
                          align="start"
                        >
                          {(['english', 'hinglish', 'hindi'] as LanguageChipOption[]).map((opt) => (
                            <DropdownMenu.Item
                              key={opt}
                              onClick={() => setLanguageOption(opt)}
                              className={clsx(
                                'flex items-center justify-between px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer outline-none transition-colors',
                                languageOption === opt
                                  ? 'bg-brand-50 text-brand-700'
                                  : 'text-slate-700 hover:bg-slate-100'
                              )}
                            >
                              <span>{languageLabels[opt]}</span>
                              {languageOption === opt && <Check className="w-3.5 h-3.5 text-brand-600" />}
                            </DropdownMenu.Item>
                          ))}
                        </DropdownMenu.Content>
                      </DropdownMenu.Portal>
                    </DropdownMenu.Root>

                    <button
                      type="button"
                      onClick={handleClipboardPaste}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-border bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition cursor-pointer whitespace-nowrap"
                    >
                      <Clipboard className="w-3.5 h-3.5 text-brand-600" />
                      <span>Paste</span>
                    </button>

                    {rawText && (
                      <button
                        type="button"
                        onClick={() => setRawText('')}
                        className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition cursor-pointer"
                        title="Clear text"
                        aria-label="Clear message"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Mic Button with Waveform Feedback */}
                  {isSupported && (
                    <div className="flex items-center gap-2">
                      {isListening && (
                        <div className="flex items-center gap-0.5 h-4 px-1" aria-label="Voice waveform active">
                          <span className="w-0.5 h-2 bg-rose-500 rounded-full animate-pulse" />
                          <span className="w-0.5 h-4 bg-rose-600 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
                          <span className="w-0.5 h-3 bg-rose-500 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
                          <span className="w-0.5 h-3.5 bg-rose-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={toggleListening}
                        className={clsx(
                          'w-9 h-9 rounded-full flex items-center justify-center transition shadow-xs cursor-pointer',
                          isListening
                            ? 'bg-brand-600 text-white shadow-md scale-105 animate-pulse'
                            : 'bg-white border-2 border-brand-600 text-brand-600 hover:bg-brand-50'
                        )}
                        title={isListening ? 'Stop voice input' : 'Speak message (voice input)'}
                        aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
                      >
                        {isListening ? <Square className="w-3.5 h-3.5 fill-current" /> : <Mic className="w-4 h-4" />}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Privacy Note */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0" />
                <span>Phone numbers are hidden before AI reads your message</span>
              </div>

              {/* "Try an example" — Single Row of Chips */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-xs font-semibold text-slate-500 block">
                  Try an example
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                  {exampleMessages.map((ex, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setRawText(ex.text)}
                      className="px-3 py-1.5 rounded-full bg-white hover:bg-lime-soft hover:border-ink-black/30 hover:text-ink-900 text-ink-700 border border-line text-xs font-medium transition shadow-2xs cursor-pointer whitespace-nowrap shrink-0"
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Primary Extract Details Button — Low opacity when empty, full opacity + shine once text entered */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!isAnalyzeEnabled}
                  className={clsx(
                    'group btn-cashfree-primary w-full min-h-[48px] pl-6 pr-2 rounded-[14px] font-semibold text-sm text-white flex items-center justify-between gap-2 transition-all whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-600 focus:ring-offset-1',
                    isAnalyzeEnabled
                      ? 'btn-shine-sweep mobile-shine-primary cursor-pointer opacity-100'
                      : 'cursor-not-allowed opacity-40'
                  )}
                >
                  {isAnalyzing ? (
                    <span className="mx-auto inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-lime border-t-transparent rounded-full animate-spin" />
                      <span>Extracting details...</span>
                    </span>
                  ) : (
                    <>
                      <span className="mx-auto pl-6 inline-flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-lime" />
                        <span>Extract details</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="w-8 h-8 rounded-[9px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      >
                        <ArrowUpRight className="w-4 h-4 stroke-[2.3]" />
                      </span>
                    </>
                  )}
                </button>
              </div>
            </Card>
          )}

          {/* ======================================================== */}
          {/* STEP 2: MANDATORY BUYER / SELLER SELECTION & SAVE        */}
          {/* ======================================================== */}
          {currentStep === 'review' && (
            <Card className="p-4 sm:p-6 space-y-5 rounded-2xl bg-white border border-border shadow-card">
              {/* Step 2 Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3.5 border-b border-border">
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-ink">
                    Step 2: Select Buyer or Seller & Review Details
                  </h2>
                  <p className="text-xs text-muted">
                    Choose Buyer or Seller (required), edit details, then click Next to save & rank matches.
                  </p>
                </div>
                {suggestedItemType && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-lime-soft border border-lime text-[11px] font-semibold text-ink-900 self-start sm:self-auto">
                    <Sparkles className="w-3 h-3 text-brand-700" />
                    <span>AI Suggestion: {suggestedItemType === 'buyer' ? 'Buyer' : 'Seller'}</span>
                  </span>
                )}
              </div>

              {/* MANDATORY 2-CARD SELECTION: BUYER OR SELLER */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-ink-900">
                    1. Who is this message for? <span className="text-danger">*</span>
                  </span>
                  {!itemType && (
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      Required selection
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    data-testid="role-select-buyer"
                    onClick={() => setItemType('buyer')}
                    className={clsx(
                      'p-3.5 rounded-[14px] border text-left transition cursor-pointer flex items-start gap-3',
                      itemType === 'buyer'
                        ? 'bg-ink-black text-white border-ink-black ring-2 ring-lime shadow-sm'
                        : 'bg-white border-line text-ink-900 hover:border-ink-black/40 hover:bg-lime-soft/40'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0',
                        itemType === 'buyer' ? 'bg-lime text-ink-black' : 'bg-brand-50 text-brand-600'
                      )}
                    >
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold">Buyer</span>
                        {itemType === 'buyer' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime text-ink-black">
                            Selected ✓
                          </span>
                        )}
                      </div>
                      <p className={clsx('text-xs mt-0.5', itemType === 'buyer' ? 'text-white/75' : 'text-ink-500')}>
                        Client looking to buy / rent — rank matching Seller Properties next.
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    data-testid="role-select-seller"
                    onClick={() => setItemType('listing')}
                    className={clsx(
                      'p-3.5 rounded-[14px] border text-left transition cursor-pointer flex items-start gap-3',
                      itemType === 'listing'
                        ? 'bg-ink-black text-white border-ink-black ring-2 ring-lime shadow-sm'
                        : 'bg-white border-line text-ink-900 hover:border-ink-black/40 hover:bg-lime-soft/40'
                    )}
                  >
                    <div
                      className={clsx(
                        'w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0',
                        itemType === 'listing' ? 'bg-lime text-ink-black' : 'bg-brand-50 text-brand-600'
                      )}
                    >
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold">Seller</span>
                        {itemType === 'listing' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-lime text-ink-black">
                            Selected ✓
                          </span>
                        )}
                      </div>
                      <p className={clsx('text-xs mt-0.5', itemType === 'listing' ? 'text-white/75' : 'text-ink-500')}>
                        Owner offering a property — rank matching Buyers next.
                      </p>
                    </div>
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
                  <h3 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-brand-600" />
                    <span>
                      1.{' '}
                      {itemType === 'buyer'
                        ? 'Client / Buyer Information'
                        : itemType === 'listing'
                          ? 'Owner / Seller Information'
                          : 'Contact Information (Select Buyer or Seller above)'}
                    </span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink block">
                        {itemType === 'buyer' ? 'Buyer Name' : itemType === 'listing' ? 'Owner / Seller Name' : 'Contact Name'}
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
                  <h3 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-brand-600" />
                    <span>2. Property Type & Locality</span>
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-ink block">
                        Property Type
                      </label>
                      <CustomSelect
                        title="Property Type"
                        value={recordType}
                        onChange={(val) => setRecordType(val)}
                        options={[
                          { value: 'Builder Floor', label: 'Builder Floor' },
                          { value: 'Residential Plot', label: 'Residential Plot' },
                          { value: 'Independent Kothi', label: 'Independent Kothi' },
                          { value: 'Apartment / Flat', label: 'Apartment / Flat' },
                          { value: 'Commercial Shop', label: 'Commercial Shop' },
                          { value: 'Commercial Space', label: 'Commercial Space' },
                        ]}
                        className="min-h-[48px] text-sm font-normal"
                      />
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
                  <h3 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
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
                        <div className="w-1/3">
                          <CustomSelect
                            title="Local Unit"
                            value={recordUnit}
                            onChange={(val) => setRecordUnit(val)}
                            options={[
                              { value: 'gaj', label: 'Gaj' },
                              { value: 'sqft', label: 'Sq. Ft.' },
                              { value: 'marla', label: 'Marla' },
                              { value: 'kanal', label: 'Kanal' },
                            ]}
                            className="min-h-[48px] px-2.5 text-xs"
                          />
                        </div>
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
                    disabled={!itemType || isSaving || Boolean(savedRecordId)}
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
                        <span>
                          Save {itemType === 'buyer' ? 'Buyer' : itemType === 'listing' ? 'Seller Listing' : 'Record'}
                        </span>
                      </span>
                    )}
                  </Button>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  disabled={!itemType || isMatching || isSaving}
                  onClick={handleFindMatches}
                  className={clsx(
                    'w-full sm:w-auto min-h-[48px] font-semibold text-xs gap-1.5 shadow-sm transition-opacity',
                    itemType ? 'mobile-shine-primary' : 'opacity-45'
                  )}
                >
                  {isMatching || isSaving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving & Ranking Matches...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-lime" />
                      <span>Save & Find Matches</span>
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
              {
                itemType === 'buyer' && (
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
                        {matchedProperties.map(({ property, score, reasons, mismatches }, idx) => {
                          const isDealSaved = savedPropertyIds.has(property._id);
                          const isBestOne = idx === 0;
                          const pitchCount = property.pitchCount || 0;

                          return (
                            <Card
                              key={property._id}
                              className={clsx(
                                'p-4 sm:p-5 flex flex-col justify-between rounded-card transition shadow-card space-y-3',
                                isBestOne
                                  ? 'bg-lime-soft/30 border-2 border-ink-black shadow-md'
                                  : 'bg-white border border-border hover:border-brand-600/40'
                              )}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isBestOne && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime text-ink-black text-[11px] font-extrabold border border-ink-black/20 shadow-2xs">
                                        <Crown className="w-3 h-3" />
                                        <span>#1 Best Match</span>
                                      </span>
                                    )}
                                    <h3 className="text-base font-bold text-ink">
                                      {property.title}
                                    </h3>
                                    <Badge variant={score >= 80 ? 'perfect' : 'good'}>
                                      {score}% Match
                                    </Badge>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-line text-[11px] font-semibold text-ink-700">
                                      <Send className="w-3 h-3 text-brand-600" />
                                      <span>Sent to {pitchCount} {pitchCount === 1 ? 'person' : 'people'}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted mt-1">
                                    {property.locality}, {property.city || 'Panipat'} · {property.size.value} {property.size.unit.toUpperCase()}
                                  </p>
                                </div>

                                <div className="sm:text-right shrink-0">
                                  <span className="text-[10px] uppercase font-semibold text-muted block">Asking Price</span>
                                  <span className="text-base font-bold text-ink tabular-nums">
                                    {formatRupees(property.priceDemandPaise)}
                                  </span>
                                </div>
                              </div>

                              {/* Match Explanation */}
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

                              {/* Actions: Inspect + Save + Copy + Send */}
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => setInspectingProperty(property)}
                                  className="text-xs font-semibold text-slate-600 hover:text-ink flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Inspect Details</span>
                                </button>

                                <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    disabled={isDealSaved}
                                    onClick={async () => {
                                      if (savedRecordId && !savedRecordId.startsWith('sim_')) {
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
                                          success('Saved deal to pipeline!');
                                        } catch (err: any) {
                                          error(err?.message || 'Could not save deal.');
                                        }
                                      } else {
                                        setSavedPropertyIds((prev) => new Set([...prev, property._id]));
                                        success('Property match saved!');
                                      }
                                    }}
                                    className="flex-1 sm:flex-initial text-xs font-semibold min-h-[40px]"
                                  >
                                    {isDealSaved ? 'Saved ✓' : 'Save'}
                                  </Button>

                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleCopyPropertyFlyer(property)}
                                    className="flex-1 sm:flex-initial text-xs font-semibold min-h-[40px] gap-1"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copy</span>
                                  </Button>

                                  <button
                                    type="button"
                                    onClick={() => handleSharePropertyFlyer(property)}
                                    className="group btn-cashfree-primary btn-shine-sweep flex-1 sm:flex-initial min-h-[40px] pl-3.5 pr-1.5 rounded-[11px] text-white font-semibold text-xs flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap"
                                  >
                                    <Share2 className="w-3.5 h-3.5 text-lime" />
                                    <span>Send</span>
                                    <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                                    </span>
                                  </button>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              }

              {/* ── Case B: Extracted Item is a Property Listing ── */}
              {
                itemType === 'listing' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-muted px-1 flex-wrap gap-2">
                      <span>{matchedBuyers.length} of {totalDatabaseCount} active buyers ranked</span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 border border-line text-[11px] font-semibold text-ink-700">
                        <Send className="w-3 h-3 text-brand-600" />
                        <span>Property sent to {savedPropertyPitchCount} {savedPropertyPitchCount === 1 ? 'person' : 'people'}</span>
                      </span>
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
                        {matchedBuyers.map(({ buyer, score, reasons, mismatches }, idx) => {
                          const isBestOne = idx === 0;
                          const buyerId = buyer._id || `buyer_${idx}`;
                          const isBuyerSaved = savedBuyerIds.has(buyerId);
                          const waShareText = `Namaste ${buyer.name} ji,\n\nAapki requirement ke hisaab se ek listing available hai:\n\n*${recordType} in ${recordLocality}*\nDemand: ${recordPriceRaw || formatRupees(parseDemandPaiseFromInput(recordPriceRaw, recordBudgetLakhs))}\nArea: ${recordArea} ${recordUnit.toUpperCase()}\n\nInspection ke liye connect karein?\n- ${agencyDisplayName}`;
                          const waUrl = `https://wa.me/${(buyer.phone || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(waShareText)}`;

                          return (
                            <Card
                              key={buyerId}
                              className={clsx(
                                'p-4 sm:p-5 flex flex-col justify-between rounded-card transition shadow-card space-y-3',
                                isBestOne
                                  ? 'bg-lime-soft/30 border-2 border-ink-black shadow-md'
                                  : 'bg-white border border-border hover:border-brand-600/40'
                              )}
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-border">
                                <div>
                                  <div className="flex items-center gap-2 flex-wrap">
                                    {isBestOne && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-lime text-ink-black text-[11px] font-extrabold border border-ink-black/20 shadow-2xs">
                                        <Crown className="w-3 h-3" />
                                        <span>#1 Best Match</span>
                                      </span>
                                    )}
                                    <h3 className="text-base font-bold text-ink">{buyer.name}</h3>
                                    <Badge variant={score >= 80 ? 'perfect' : 'good'}>
                                      {score}% Fit
                                    </Badge>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-line text-[11px] font-semibold text-ink-700">
                                      <Send className="w-3 h-3 text-brand-600" />
                                      <span>Listing sent to {savedPropertyPitchCount} {savedPropertyPitchCount === 1 ? 'person' : 'people'}</span>
                                    </span>
                                  </div>
                                  <p className="text-xs text-muted mt-1">
                                    Budget: <strong className="text-ink">{buyer.budget?.maxPaise ? formatRupees(buyer.budget.maxPaise) : 'Flexible'}</strong>
                                  </p>
                                </div>

                                <div className="sm:text-right">
                                  <span className="text-[10px] uppercase font-semibold text-muted block">Phone</span>
                                  <span className="text-xs font-semibold text-slate-700">
                                    {buyer.phone || (buyer as any).phoneE164 || '—'}
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
                                {Array.isArray(mismatches) && mismatches.map((m: string, i: number) => (
                                  <div key={`mm_${i}`} className="flex items-center gap-1.5 text-amber-800">
                                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>{m}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Actions: Save + Copy + Send */}
                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  disabled={isBuyerSaved}
                                  onClick={async () => {
                                    if (savedRecordId && !savedRecordId.startsWith('sim_') && buyer._id && !buyer._id.startsWith('buyer_seed_')) {
                                      try {
                                        await createDeal({
                                          buyerId: buyer._id,
                                          propertyId: savedRecordId,
                                          propertyTitleSnapshot: `${recordType} in ${recordLocality}`,
                                          valuePaise: parseDemandPaiseFromInput(recordPriceRaw, recordBudgetLakhs),
                                          commission: { mode: 'percent', bps: 100 },
                                          stage: 'interested',
                                        });
                                      } catch {
                                        // gracefully continue
                                      }
                                    }
                                    setSavedBuyerIds((prev) => new Set([...prev, buyerId]));
                                    success(`Matched deal saved for ${buyer.name}!`);
                                  }}
                                  className="text-xs font-semibold min-h-[40px]"
                                >
                                  {isBuyerSaved ? 'Saved ✓' : 'Save'}
                                </Button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    void copyTextSafely(waShareText);
                                    void bumpSavedSellerPitch();
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
                                  onClick={() => {
                                    void bumpSavedSellerPitch();
                                  }}
                                  className="group btn-cashfree-primary btn-shine-sweep min-h-[40px] pl-3.5 pr-1.5 rounded-[11px] text-white font-semibold text-xs flex items-center gap-2 transition"
                                >
                                  <Share2 className="w-3.5 h-3.5 text-lime" />
                                  <span>Send</span>
                                  <span className="w-6 h-6 rounded-[7px] bg-lime text-ink-black inline-flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.3]" />
                                  </span>
                                </a>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )
              }
            </div >
          )}
        </div >

        {/* RIGHT COLUMN (>=1280px): Live-Updating Recent Extractions (last 5) */}
        {
          hasRecentExtractions && (
            <Card className="p-4 sm:p-5 space-y-3.5 rounded-[14px] bg-white border border-border">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-[10px] bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900">
                      Recent extractions
                    </h2>
                    <p className="text-xs text-slate-500">
                      Last {recentExtractions.length} parsed messages
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRecentExtractions([]);
                    try {
                      localStorage.removeItem(RECENT_EXTRACTIONS_KEY);
                    } catch {
                      // ignore
                    }
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-900 cursor-pointer"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2">
                {recentExtractions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setRawText(item.rawText);
                      applyParseResult(item.result, item.rawText);
                      setSavedRecordId(null);
                      setCurrentStep('review');
                    }}
                    className="w-full text-left p-3 rounded-[12px] border border-line bg-white hover:bg-slate-50 lg:hover:border-lime transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {item.title}
                      </span>
                      <StatusChip
                        variant={item.itemType === 'buyer' ? 'brand' : 'neutral'}
                        className="shrink-0"
                      >
                        {item.itemType === 'buyer' ? 'Buyer' : 'Listing'}
                      </StatusChip>
                    </div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                      <span className="truncate">{item.locality}</span>
                      <span className="font-semibold text-slate-800 tabular-nums shrink-0">
                        {item.priceLabel}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {item.rawText}
                    </p>
                  </button>
                ))}
              </div>
            </Card>
          )
        }
      </div >

      {/* Inspect Property Modal */}
      < Modal
        open={Boolean(inspectingProperty)}
        onOpenChange={(open) => {
          if (!open) setInspectingProperty(null);
        }}
        title={inspectingProperty?.title || 'Property details'}
        footerActions={
          inspectingProperty && (
            <>
              <Button size="sm" variant="secondary" onClick={() => setInspectingProperty(null)}>
                Close
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={() => {
                  handleSharePropertyFlyer(inspectingProperty);
                  setInspectingProperty(null);
                }}
                className="gap-1.5"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share on WhatsApp</span>
              </Button>
            </>
          )
        }
      >
        {inspectingProperty && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block font-medium">Locality</span>
                <span className="font-semibold text-slate-900">{inspectingProperty.locality}</span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Asking price</span>
                <span className="font-bold text-slate-900 text-sm tabular-nums">
                  {formatRupees(inspectingProperty.priceDemandPaise)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Area</span>
                <span className="font-semibold text-slate-900">
                  {inspectingProperty.size.value} {inspectingProperty.size.unit.toUpperCase()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block font-medium">Facing</span>
                <span className="font-semibold text-slate-900">{inspectingProperty.facing || 'Open'}</span>
              </div>
            </div>

            {inspectingProperty.description && (
              <p className="text-xs text-slate-700 p-3 rounded-xl bg-slate-50 border border-slate-200">
                {inspectingProperty.description}
              </p>
            )}
          </div>
        )}
      </Modal >
    </div >
  );
};
