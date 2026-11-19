// Web Speech API Voice Recognition

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SpeechListenerOptions {
  lang?: 'hi-IN' | 'en-IN' | 'en-US';
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

export class VoiceRecognition {
  private recognition: any = null;
  private isListening = false;
  private lastFinalIndex = -1;

  constructor() {
    const SpeechClass = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechClass) {
      this.recognition = new SpeechClass();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
  }

  public isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  public start(options: SpeechListenerOptions) {
    if (!this.recognition) {
      options.onError?.('Speech recognition is not supported in this browser. Please use Chrome or Safari.');
      return;
    }

    if (this.isListening) {
      this.stop();
    }

    this.lastFinalIndex = -1;
    this.recognition.lang = options.lang || 'hi-IN'; // Default to Hindi/Hinglish

    this.recognition.onresult = (event: any) => {
      let finalChunk = '';
      let interimChunk = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        const text = item[0]?.transcript?.trim() || '';

        if (item.isFinal) {
          if (i > this.lastFinalIndex) {
            this.lastFinalIndex = i;
            if (text) {
              finalChunk += (finalChunk ? ' ' : '') + text;
            }
          }
        } else {
          if (text) {
            interimChunk += (interimChunk ? ' ' : '') + text;
          }
        }
      }

      if (finalChunk) {
        options.onResult(finalChunk, true);
      } else if (interimChunk) {
        options.onResult(interimChunk, false);
      }
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      options.onError?.(event.error || 'Voice input error');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      options.onEnd?.();
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (err: any) {
      options.onError?.(err?.message || 'Could not start microphone');
    }
  }

  public stop() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {}
      this.isListening = false;
    }
  }

  public get active(): boolean {
    return this.isListening;
  }
}

export const voiceRecognitionService = new VoiceRecognition();
