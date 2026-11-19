import { useState, useEffect, useCallback, useRef } from 'react';

interface VoiceDictationOptions {
  lang?: 'hi-IN' | 'en-IN';
  onFinalTranscript?: (finalChunk: string) => void;
  onTranscript?: (interimOrFinal: string, isFinal: boolean) => void;
}

export function useVoiceDictation({
  lang = 'hi-IN',
  onFinalTranscript,
  onTranscript,
}: VoiceDictationOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const lastFinalIndexRef = useRef<number>(-1);

  // Store callbacks in refs to avoid rebuilding SpeechRecognition on every render
  const onFinalTranscriptRef = useRef(onFinalTranscript);
  onFinalTranscriptRef.current = onFinalTranscript;
  const onTranscriptRef = useRef(onTranscript);
  onTranscriptRef.current = onTranscript;

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
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        const text = item[0]?.transcript?.trim() || '';

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
          currentInterim += (currentInterim ? ' ' : '') + text;
        }
      }

      setInterimTranscript(currentInterim);
      if (currentInterim && onTranscriptRef.current) {
        onTranscriptRef.current(currentInterim, false);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`);
      }
      setIsListening(false);
      isListeningRef.current = false;
    };

    recognition.onend = () => {
      setIsListening(false);
      isListeningRef.current = false;
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [lang]);

  const startListening = useCallback(() => {
    setError(null);
    setInterimTranscript('');
    lastFinalIndexRef.current = -1;
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.start();
      setIsListening(true);
      isListeningRef.current = true;
    } catch (err: any) {
      console.warn('Could not start speech recognition:', err);
      // Already running or permission issue
      setIsListening(true);
      isListeningRef.current = true;
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.warn('Could not stop speech recognition:', err);
    }
    setIsListening(false);
    isListeningRef.current = false;
    setInterimTranscript('');
  }, []);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current) {
      stopListening();
    } else {
      startListening();
    }
  }, [startListening, stopListening]);

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
