class SpeechService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;
  private isPaused: boolean = false;
  private rate: number = 1.0;
  private pitch: number = 1.0;

  private onStateChangeCallback: ((speaking: boolean, paused: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices();
    }
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  public setOnStateChange(cb: (speaking: boolean, paused: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  private notifyState() {
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback(this.isSpeaking, this.isPaused);
    }
  }

  public speak(text: string, langCode: string = 'en-US', onEnd?: () => void) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop(); // Cancel existing playback

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    // Find best voice matching target language
    const cleanLang = langCode.split('-')[0].toLowerCase();
    const matchingVoice = this.voices.find(
      (v) => v.lang.toLowerCase() === langCode.toLowerCase() || v.lang.toLowerCase().startsWith(cleanLang)
    );

    if (matchingVoice) {
      utterance.voice = matchingVoice;
      utterance.lang = matchingVoice.lang;
    } else {
      utterance.lang = langCode;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.isPaused = false;
      this.notifyState();
    };

    utterance.onpause = () => {
      this.isPaused = true;
      this.notifyState();
    };

    utterance.onresume = () => {
      this.isPaused = false;
      this.notifyState();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.isPaused = false;
      this.notifyState();
      if (onEnd) onEnd();
    };

    utterance.onerror = (e) => {
      console.error('Speech Synthesis Error:', e);
      this.isSpeaking = false;
      this.isPaused = false;
      this.notifyState();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (this.synth && this.isSpeaking && !this.isPaused) {
      this.synth.pause();
      this.isPaused = true;
      this.notifyState();
    }
  }

  public resume() {
    if (this.synth && this.isSpeaking && this.isPaused) {
      this.synth.resume();
      this.isPaused = false;
      this.notifyState();
    }
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.isPaused = false;
      this.notifyState();
    }
  }

  public setRate(newRate: number) {
    this.rate = newRate;
    if (this.isSpeaking && this.currentUtterance && !this.isPaused) {
      // Re-trigger speak from text if rate changed on the fly
      const text = this.currentUtterance.text;
      const lang = this.currentUtterance.lang;
      this.speak(text, lang);
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public getStatus() {
    return {
      speaking: this.isSpeaking,
      paused: this.isPaused,
    };
  }
}

export const speechService = new SpeechService();

/**
 * Speech Recognition Helper (Dictation Mic Input)
 */
export function startVoiceRecognition(
  onResult: (text: string) => void,
  onError: (err: string) => void,
  lang: string = 'en-US'
): { stop: () => void } | null {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang;

  recognition.onresult = (event: any) => {
    if (event.results && event.results[0]) {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    }
  };

  recognition.onerror = (event: any) => {
    onError(event.error || 'Voice recognition error');
  };

  recognition.start();

  return {
    stop: () => recognition.stop(),
  };
}
