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

    this.recognition.lang = options.lang || 'hi-IN'; // Default to Hindi/Hinglish

    this.recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const text = (finalTranscript || interimTranscript).trim();
      if (text) {
        options.onResult(text, !!finalTranscript);
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
