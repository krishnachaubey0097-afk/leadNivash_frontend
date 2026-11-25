import { useState, useEffect, useCallback, useRef } from 'react';
import { normalizeRealEstateVoiceTranscript } from '../voiceNormalizer';

export type DictationLang = 'en-IN' | 'hi-IN';

interface VoiceDictationOptions {
  lang?: DictationLang;
  onFinalTranscript?: (finalChunk: string) => void;
  onTranscript?: (interimOrFinal: string, isFinal: boolean) => void;
}

export function useVoiceDictation({
  lang = 'en-IN',
  onFinalTranscript,
  onTranscript,
}: VoiceDictationOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const userWantsListeningRef = useRef(false);
  const isStartingOrRunningRef = useRef(false);
  const restartTimeoutRef = useRef<any>(null);
  const currentInterimRef = useRef<string>('');
  const committedIndicesRef = useRef<Set<number>>(new Set());
  const lastCommittedSegmentRef = useRef<{ text: string; at: number }>({ text: '', at: 0 });

  // Store callbacks in refs to avoid rebuilding SpeechRecognition on every render
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  onFinalTranscriptRef.current = onFinalTranscript;
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const commitFinalText = useCallback((normalized: string) => {
    const clean = normalized.trim();
    if (!clean) return;

    const now = Date.now();
    // Deduplicate back-to-back identical final chunks triggered by browser restart races
    if (
      lastCommittedSegmentRef.current.text === clean &&
      now - lastCommittedSegmentRef.current.at < 1200
    ) {
      return;
    }

    lastCommittedSegmentRef.current = { text: clean, at: now };
    setFinalTranscript((prev) => (prev ? `${prev} ${clean}` : clean));
    if (onFinalTranscriptRef.current) {
      onFinalTranscriptRef.current(clean);
    }
    if (onTranscriptRef.current) {
      onTranscriptRef.current(clean, true);
    }
  }, []);

  const flushInterim = useCallback(() => {
    const raw = currentInterimRef.current.trim();
    currentInterimRef.current = '';
    setInterimTranscript('');

    if (raw) {
      const normalized = normalizeRealEstateVoiceTranscript(raw);
      if (normalized) {
        commitFinalText(normalized);
      }
    }
  }, [commitFinalText]);

  // Initialize SpeechRecognition (detach old listeners cleanly to prevent duplicate commits)
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    let cancelled = false;
    setIsSupported(true);

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      if (cancelled) return;
      let activeInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const rawText = item[0]?.transcript?.trim() || '';
        const text = normalizeRealEstateVoiceTranscript(rawText);

        if (item.isFinal) {
          // Guard: Commit each finalized segment index strictly once
          if (!committedIndicesRef.current.has(i)) {
            committedIndicesRef.current.add(i);
            if (text) {
              commitFinalText(text);
            }
          }
        } else if (!committedIndicesRef.current.has(i)) {
          // Keep interim text strictly separate until finalized
          activeInterim += (activeInterim ? ' ' : '') + text;
        }
      }

      currentInterimRef.current = activeInterim;
      setInterimTranscript(activeInterim);
      if (activeInterim && onTranscriptRef.current) {
        onTranscriptRef.current(activeInterim, false);
      }
    };

    recognition.onerror = (event: any) => {
      if (cancelled) return;
      console.warn('Speech recognition warning/event:', event.error);
      // 'no-speech' happens on natural conversational pauses. DO NOT terminate listening.
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        userWantsListeningRef.current = false;
        isStartingOrRunningRef.current = false;
        setError(
          event.error === 'not-allowed'
            ? 'Microphone permission was denied. Please allow microphone access in your browser.'
            : 'No microphone was detected on your device.'
        );
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      isStartingOrRunningRef.current = false;
      if (cancelled) return;

      // Flush any leftover interim segment from the ended recognition chunk
      flushInterim();
      committedIndicesRef.current.clear();

      // If user still wants listening, resume this active instance cleanly
      if (userWantsListeningRef.current) {
        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (
            !cancelled &&
            userWantsListeningRef.current &&
            recognitionRef.current === recognition &&
            !isStartingOrRunningRef.current
          ) {
            try {
              isStartingOrRunningRef.current = true;
              recognition.start();
              setIsListening(true);
            } catch (err: any) {
              isStartingOrRunningRef.current = false;
              console.warn('SpeechRecognition auto-restart transition:', err?.message || err);
            }
          }
        }, 80);
        return;
      }

      setIsListening(false);
    };

    recognitionRef.current = recognition;

    // If user was actively listening when language switched, start the new instance once
    if (userWantsListeningRef.current && !isStartingOrRunningRef.current) {
      committedIndicesRef.current.clear();
      try {
        isStartingOrRunningRef.current = true;
        recognition.start();
        setIsListening(true);
      } catch {
        isStartingOrRunningRef.current = false;
      }
    }

    return () => {
      cancelled = true;
      isStartingOrRunningRef.current = false;
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
      // Detach all listeners BEFORE aborting so stale onresult/onend never fire
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.abort();
      } catch {
        // ignore
      }
      if (recognitionRef.current === recognition) {
        recognitionRef.current = null;
      }
    };
  }, [lang, commitFinalText, flushInterim]);

  const startListening = useCallback(() => {
    setError(null);
    setInterimTranscript('');
    currentInterimRef.current = '';
    committedIndicesRef.current.clear();
    lastCommittedSegmentRef.current = { text: '', at: 0 };
    userWantsListeningRef.current = true;

    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (!recognitionRef.current || isStartingOrRunningRef.current) return;
    try {
      isStartingOrRunningRef.current = true;
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      isStartingOrRunningRef.current = false;
      console.warn('Could not start speech recognition:', err);
    }
  }, []);

  const stopListening = useCallback(() => {
    userWantsListeningRef.current = false;
    isStartingOrRunningRef.current = false;
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Flush any uncommitted interim speech so user never loses their last spoken words
    flushInterim();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Could not stop speech recognition:', err);
      }
    }
    setIsListening(false);
  }, [flushInterim]);

  const toggleListening = useCallback(() => {
    if (userWantsListeningRef.current || isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  return {
    isListening,
    interimTranscript,
    finalTranscript,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    setFinalTranscript,
  };
}
