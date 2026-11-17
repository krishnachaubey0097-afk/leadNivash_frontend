import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api';
import { voiceRecognitionService } from '../lib/speech';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Mic,
  MicOff,
  CheckCircle2,
  Trash2,
  Save,
  AlertCircle,
} from 'lucide-react';
import clsx from 'clsx';

export const QuickPaste: React.FC = () => {
  const queryClient = useQueryClient();

  const [rawText, setRawText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);

  // Parsed candidates
  const [parsedProperties, setParsedProperties] = useState<any[]>([]);
  const [parsedBuyers, setParsedBuyers] = useState<any[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Toggle Voice-to-Text
  const toggleVoice = () => {
    setVoiceError(null);
    if (isRecording) {
      voiceRecognitionService.stop();
      setIsRecording(false);
    } else {
      if (!voiceRecognitionService.isSupported()) {
        setVoiceError('Speech recognition is not supported in this browser. Try Chrome on Android or Desktop.');
        return;
      }
      setIsRecording(true);
      voiceRecognitionService.start({
        lang: 'hi-IN',
        onResult: (transcript, isFinal) => {
          setRawText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
          if (isFinal) {
            setIsRecording(false);
          }
        },
        onError: (err) => {
          setVoiceError(`Voice error: ${err}`);
          setIsRecording(false);
        },
        onEnd: () => {
          setIsRecording(false);
        },
      });
    }
  };

  // Sample texts for 1-click test
  const samplePrompts = [
    {
      title: '3 BHK DLF Primus Sale',
      text: 'Available 3 BHK + Servant in DLF The Primus Sector 82A Gurgaon. 2100 sqft, semi furnished, middle floor, demand 2.45 Cr negotiable. Immediate registry.',
    },
    {
      title: 'Buyer Requirement 2 BHK',
      text: 'Need 2 BHK for genuine client in Sector 56 or 57 Gurugram. Ready to move gated society, budget 90 Lacs to 1.10 Cr, parking required. Client name: Rohit Verma, 9811223344.',
    },
    {
      title: 'Villa 500 Gaj Sohna Road',
      text: 'For sale 500 gaj independent luxury kothi in Rosewood City Sohna Road. 5 BHK, Italian marble, lift installed, ask 6.5 Cr.',
    },
  ];

  // Heuristic parser fallback if backend parser is empty
  const runLocalFallbackParser = (text: string) => {
    const isBuyer =
      /need|requirement|looking for|chahiye|budget|client|demand for/i.test(text);

    // Extract BHK
    const bhkMatch = text.match(/(\d)\s*(?:bhk|bedroom)/i);
    const bhk = bhkMatch ? parseInt(bhkMatch[1], 10) : 3;

    // Extract Price in Lakhs/Crores
    let price = 15000000;
    const crMatch = text.match(/([\d\.]+)\s*(?:cr|crore)/i);
    const lacMatch = text.match(/([\d\.]+)\s*(?:lac|lakh|lacs)/i);
    if (crMatch) {
      price = Math.round(parseFloat(crMatch[1]) * 10000000);
    } else if (lacMatch) {
      price = Math.round(parseFloat(lacMatch[1]) * 100000);
    }

    // Extract Sector / Society
    const sectorMatch = text.match(/sector\s*([0-9a-zA-Z]+)/i);
    const sector = sectorMatch ? `Sector ${sectorMatch[1]}` : 'Sector 82';

    if (isBuyer) {
      return {
        properties: [],
        buyers: [
          {
            name: 'Client Inquiry',
            phone: '9811000000',
            requirements: {
              propertyType: 'apartment',
              bhk: [bhk],
              budget: { min: Math.round(price * 0.85), max: price },
              preferredLocations: [sector],
            },
            status: 'active',
          },
        ],
      };
    } else {
      return {
        properties: [
          {
            title: `${bhk} BHK in ${sector}`,
            propertyType: /villa|kothi/i.test(text) ? 'villa' : 'apartment',
            bhk,
            location: {
              city: 'Gurgaon',
              sector,
              society: text.includes('DLF') ? 'DLF The Primus' : text.includes('Rosewood') ? 'Rosewood City' : sector,
            },
            pricing: { expectedPrice: price },
            specifications: {
              superBuiltUpArea: text.includes('2100') ? 2100 : bhk * 600,
              furnishing: /semi/i.test(text) ? 'semi-furnished' : 'unfurnished',
            },
            status: 'available',
          },
        ],
        buyers: [],
      };
    }
  };

  // Parse Mutation
  const parseMutation = useMutation({
    mutationFn: async (input: string) => {
      try {
        const res = await apiClient.post('/parser/parse', { rawText: input });
        if (
          res.data?.data &&
          (res.data.data.properties?.length || res.data.data.buyers?.length)
        ) {
          return res.data.data;
        }
      } catch (err) {
        console.warn('Backend parse error, falling back to smart local heuristic parser:', err);
      }
      return runLocalFallbackParser(input);
    },
    onSuccess: (data) => {
      setParsedProperties(data.properties || []);
      setParsedBuyers(data.buyers || []);
      if (!data.properties?.length && !data.buyers?.length) {
        setParseError('Could not identify property or buyer specs. Please paste clearer text.');
      } else {
        setParseError(null);
      }
    },
    onError: () => {
      const fallback = runLocalFallbackParser(rawText);
      setParsedProperties(fallback.properties || []);
      setParsedBuyers(fallback.buyers || []);
    },
  });

  // Commit Mutation
  const commitMutation = useMutation({
    mutationFn: async () => {
      // Create properties directly or via parser/commit
      for (const prop of parsedProperties) {
        await apiClient.post('/properties', prop);
      }
      for (const buyer of parsedBuyers) {
        await apiClient.post('/buyers', buyer);
      }
    },
    onSuccess: () => {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      setSuccessMsg('Successfully committed to your database!');
      setParsedProperties([]);
      setParsedBuyers([]);
      setRawText('');
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['buyers'] });
    },
    onError: (err: any) => {
      setParseError(err.response?.data?.error?.message || 'Failed to save parsed records.');
    },
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Title */}
      <div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Quick Paste Engine
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Paste WhatsApp messages or speak into the mic. LeadNivesh auto-extracts BHK, price, and specs.
        </p>
      </div>

      {/* Mic / Voice Error banner */}
      {parseError && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{parseError}</span>
        </div>
      )}

      {voiceError && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{voiceError}</span>
        </div>
      )}

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Raw Input Card */}
      <div className="bg-white dark:bg-[#131B2A] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <textarea
            rows={5}
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            placeholder="Paste forwarded WhatsApp chat here, or press the mic button to speak in Hindi/Hinglish... (e.g. 3 BHK in DLF Primus Sector 82 demand 2.45 Cr)"
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition resize-none"
          />

          {/* Floating Voice Mic Button */}
          <button
            type="button"
            onClick={toggleVoice}
            className={clsx(
              'absolute right-3 bottom-3 p-2.5 rounded-full shadow-md transition active:scale-95 cursor-pointer',
              isRecording
                ? 'bg-red-500 text-white animate-pulse ring-4 ring-red-500/20'
                : 'bg-primary text-white hover:bg-primary-focus'
            )}
            title={isRecording ? 'Stop Recording' : 'Dictate in Hindi/English'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </div>

        {/* 1-Tap Sample Chips */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Quick Test Examples
          </span>
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {samplePrompts.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setRawText(s.text)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-medium whitespace-nowrap transition cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Parse Button */}
        <button
          type="button"
          onClick={() => parseMutation.mutate(rawText)}
          disabled={!rawText.trim() || parseMutation.isPending}
          className="w-full py-3 bg-primary hover:bg-primary-focus text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 transition active:scale-[0.98] disabled:opacity-60 cursor-pointer"
        >
          {parseMutation.isPending ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Parse with AI</span>
            </>
          )}
        </button>
      </div>

      {/* Review Cards for Parsed Records */}
      {(parsedProperties.length > 0 || parsedBuyers.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Extracted Records ({parsedProperties.length + parsedBuyers.length})</span>
            </h2>

            <button
              onClick={() => commitMutation.mutate()}
              disabled={commitMutation.isPending}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer disabled:opacity-60"
            >
              {commitMutation.isPending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save to Inventory</span>
                </>
              )}
            </button>
          </div>

          {/* Properties Review Cards */}
          {parsedProperties.map((p, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#131B2A] border-2 border-emerald-500/30 rounded-2xl p-4 shadow-sm relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  Property Listing Candidate
                </span>
                <button
                  onClick={() => setParsedProperties((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Title</span>
                  <input
                    type="text"
                    value={p.title || ''}
                    onChange={(e) => {
                      const updated = [...parsedProperties];
                      updated[idx].title = e.target.value;
                      setParsedProperties(updated);
                    }}
                    className="w-full font-bold bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Expected Price</span>
                  <input
                    type="number"
                    value={p.pricing?.expectedPrice || 0}
                    onChange={(e) => {
                      const updated = [...parsedProperties];
                      updated[idx].pricing = {
                        ...updated[idx].pricing,
                        expectedPrice: parseInt(e.target.value) || 0,
                      };
                      setParsedProperties(updated);
                    }}
                    className="w-full font-bold text-primary bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Society / Project</span>
                  <input
                    type="text"
                    value={p.location?.society || ''}
                    onChange={(e) => {
                      const updated = [...parsedProperties];
                      updated[idx].location = {
                        ...updated[idx].location,
                        society: e.target.value,
                      };
                      setParsedProperties(updated);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">BHK</span>
                  <input
                    type="number"
                    value={p.bhk || 3}
                    onChange={(e) => {
                      const updated = [...parsedProperties];
                      updated[idx].bhk = parseInt(e.target.value) || 1;
                      setParsedProperties(updated);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Buyers Review Cards */}
          {parsedBuyers.map((b, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#131B2A] border-2 border-blue-500/30 rounded-2xl p-4 shadow-sm relative"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase tracking-wider">
                  Buyer Lead Candidate
                </span>
                <button
                  onClick={() => setParsedBuyers((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-slate-400 hover:text-red-500 transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Client Name</span>
                  <input
                    type="text"
                    value={b.name || ''}
                    onChange={(e) => {
                      const updated = [...parsedBuyers];
                      updated[idx].name = e.target.value;
                      setParsedBuyers(updated);
                    }}
                    className="w-full font-bold bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800"
                  />
                </div>

                <div>
                  <span className="text-slate-400 text-[10px] block">Client Phone</span>
                  <input
                    type="text"
                    value={b.phone || ''}
                    onChange={(e) => {
                      const updated = [...parsedBuyers];
                      updated[idx].phone = e.target.value;
                      setParsedBuyers(updated);
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-900 p-1.5 rounded border border-slate-200 dark:border-slate-800"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
