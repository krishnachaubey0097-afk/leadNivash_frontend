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
  const restartTimeoutRef = useRef<any>(null);
  const currentInterimRef = useRef<string>('');
  const lastFinalIndexRef = useRef<number>(-1);

  // Store callbacks in refs to avoid rebuilding SpeechRecognition on every render
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  onFinalTranscriptRef.current = onFinalTranscript;
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

  const flushInterim = useCallback(() => {
    const raw = currentInterimRef.current.trim();
    if (raw) {
      const normalized = normalizeRealEstateVoiceTranscript(raw);
      if (normalized) {
        setFinalTranscript((prev) => (prev ? `${prev} ${normalized}` : normalized));
        if (onFinalTranscriptRef.current) {
          onFinalTranscriptRef.current(normalized);
        }
        if (onTranscriptRef.current) {
          onTranscriptRef.current(normalized, true);
        }
      }
    }
    currentInterimRef.current = '';
    setInterimTranscript('');
  }, []);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let activeInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const rawText = item[0]?.transcript?.trim() || '';
        const text = normalizeRealEstateVoiceTranscript(rawText);

        if (item.isFinal) {
          // Guard: Only process each final segment once
          if (i > lastFinalIndexRef.current) {
            lastFinalIndexRef.current = i;
            if (text) {
              setFinalTranscript((prev) => (prev ? `${prev} ${text}` : text));
              if (onFinalTranscriptRef.current) {
                onFinalTranscriptRef.current(text);
              }
              if (onTranscriptRef.current) {
                onTranscriptRef.current(text, true);
              }
            }
          }
        } else {
          // Accumulate interim results
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
      console.warn('Speech recognition warning/event:', event.error);
      // 'no-speech' happens on natural conversational pauses. DO NOT terminate listening.
      if (event.error === 'no-speech') {
        return;
      }

      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        userWantsListeningRef.current = false;
        setError(
          event.error === 'not-allowed'
            ? 'Microphone permission was denied. Please allow microphone access in your browser.'
            : 'No microphone was detected on your device.'
        );
        setIsListening(false);
      }
    };

    recognition.onend = () => {
      // If user still wants listening, continuously resume without stopping
      if (userWantsListeningRef.current) {
        // Flush any interim speech that browser did not mark isFinal before ending the chunk
        flushInterim();
        lastFinalIndexRef.current = -1;

        if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = setTimeout(() => {
          if (userWantsListeningRef.current && recognitionRef.current) {
            try {
              recognitionRef.current.start();
              setIsListening(true);
            } catch (err: any) {
              // Recognition might already be running or transitioning
              console.warn('SpeechRecognition auto-restart transition:', err?.message || err);
            }
          }
        }, 60);
        return;
      }

      setIsListening(false);
      currentInterimRef.current = '';
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    // If user was listening and lang changed, restart recognition with new language
    if (userWantsListeningRef.current) {
      try {
        recognition.start();
      } catch {
        // ignore
      }
    }

    return () => {
      if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang, flushInterim]);

  const startListening = useCallback(() => {
    setError(null);
    setInterimTranscript('');
    currentInterimRef.current = '';
    lastFinalIndexRef.current = -1;
    userWantsListeningRef.current = true;

    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err: any) {
      console.warn('Could not start speech recognition:', err);
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    userWantsListeningRef.current = false;
    if (restartTimeoutRef.current) clearTimeout(restartTimeoutRef.current);

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
