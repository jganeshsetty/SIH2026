import { LanguageMeta } from "../locales/types";
import { SUPPORTED_LANGUAGES } from "../locales";

export { SUPPORTED_LANGUAGES };
export type { LanguageMeta };

/**
 * ============================================================================
 * FARMORA MULTILINGUAL VOICE & SPEECH SERVICE
 * Direct client-side language script detection, Speech Synthesis with GC protection,
 * Chrome keepalive resume loop, clean text sanitization, and continuous voice recognition.
 * ============================================================================
 */

/**
 * Strips markdown symbols, URLs, JSON strings, and technical formatting
 * so SpeechSynthesis speaks clean, natural-sounding sentences.
 */
export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";
  return rawText
    .replace(/```[\s\S]*?```/g, "") // remove code blocks
    .replace(/`([^`]+)`/g, "$1") // remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // replace markdown links with link text
    .replace(/[*#_~>]/g, "") // remove formatting characters
    .replace(/₹\s?(\d+(?:\.\d+)?)/g, "$1 rupees") // convert ₹32 to 32 rupees
    .replace(/\s+/g, " ") // collapse whitespace
    .trim();
}

/**
 * Detect language from text using Unicode character ranges.
 * Very fast, client-side, zero latency.
 */
export function detectLanguageFromScript(text: string): LanguageMeta | null {
  if (!text) return null;

  // Kannada: \u0C80-\u0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return SUPPORTED_LANGUAGES.find((l) => l.code === "kn") || null;
  // Telugu: \u0C00-\u0C7F
  if (/[\u0C00-\u0C7F]/.test(text)) return SUPPORTED_LANGUAGES.find((l) => l.code === "te") || null;
  // Tamil: \u0B80-\u0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) return SUPPORTED_LANGUAGES.find((l) => l.code === "ta") || null;
  // Malayalam: \u0D00-\u0D7F
  if (/[\u0D00-\u0D7F]/.test(text)) return SUPPORTED_LANGUAGES.find((l) => l.code === "ml") || null;
  // Bengali: \u0980-\u09FF
  if (/[\u0980-\u09FF]/.test(text)) return SUPPORTED_LANGUAGES.find((l) => l.code === "bn") || null;
  // Gujarati: \u0A80-\u0AFF
  if (/[\u0A80-\u0AFF]/.test(text)) return SUPPORTED_LANGUAGES.find((l) => l.code === "gu") || null;
  // Punjabi (Gurmukhi): \u0A00-\u0A7F
  if (/[\u0A00-\u0A7F]/.test(text)) return SUPPORTED_LANGUAGES.find((l) => l.code === "pa") || null;
  // Devanagari (Hindi / Marathi): \u0900-\u097F
  if (/[\u0900-\u097F]/.test(text)) {
    if (/\b(आहे|नाही|शेतकरी|बाजारभाव|करा|पाहिजे|होय)\b/i.test(text)) {
      return SUPPORTED_LANGUAGES.find((l) => l.code === "mr") || null;
    }
    return SUPPORTED_LANGUAGES.find((l) => l.code === "hi") || null;
  }

  // English fallback if latin script
  if (/[a-zA-Z]/.test(text)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === "en") || null;
  }

  return null;
}

let activeUtterance: SpeechSynthesisUtterance | null = null;
let activeSafetyTimeout: any = null;
let keepAliveInterval: any = null;

/**
 * Text to Speech Synthesizer with Indian Voice Matching & GC Protection.
 */
export function speakText(
  text: string,
  localeCode: string = "en-IN",
  onStart?: () => void,
  onEnd?: () => void
): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return false;
  }

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) {
    if (onEnd) onEnd();
    return false;
  }

  try {
    cancelSpeech();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    activeUtterance = utterance; // Retain reference in module scope to prevent JS Garbage Collection
    utterance.lang = localeCode;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    const findVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices || voices.length === 0) return null;

      const langPrefix = localeCode.split("-")[0].toLowerCase();
      const langNames: Record<string, string[]> = {
        hi: ["hindi", "हिन्दी", "hi-in", "hi_in"],
        mr: ["marathi", "मराठी", "mr-in", "mr_in"],
        kn: ["kannada", "ಕನ್ನಡ", "kn-in", "kn_in"],
        te: ["telugu", "తెలుగు", "te-in", "te_in"],
        ta: ["tamil", "தமிழ்", "ta-in", "ta_in"],
        ml: ["malayalam", "മലയാളം", "ml-in", "ml_in"],
        bn: ["bengali", "বাংলা", "bn-in", "bn_in"],
        gu: ["gujarati", "ગુજરાતી", "gu-in", "gu_in"],
        pa: ["punjabi", "ਪੰਜਾਬੀ", "pa-in", "pa_in"],
        en: ["english", "en-in", "en-us", "en-gb"],
      };

      // 1. Exact locale match
      let match = voices.find((v) => v.lang.toLowerCase() === localeCode.toLowerCase());
      // 2. Prefix match
      if (!match) match = voices.find((v) => v.lang.toLowerCase().startsWith(langPrefix));
      // 3. Name search match
      if (!match && langNames[langPrefix]) {
        const keywords = langNames[langPrefix];
        match = voices.find((v) =>
          keywords.some((kw) => v.name.toLowerCase().includes(kw) || v.lang.toLowerCase().includes(kw))
        );
      }
      return match || null;
    };

    const matchedVoice = findVoice();
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    let hasEnded = false;
    const cleanupAndEnd = () => {
      if (hasEnded) return;
      hasEnded = true;
      if (activeSafetyTimeout) {
        clearTimeout(activeSafetyTimeout);
        activeSafetyTimeout = null;
      }
      if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
      }
      activeUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onstart = () => {
      if (onStart) onStart();
    };

    utterance.onend = cleanupAndEnd;
    utterance.onerror = (err) => {
      console.warn("Speech synthesis utterance error:", err);
      cleanupAndEnd();
    };

    // Chrome keepalive resume loop to prevent speech dropping mid-sentence
    keepAliveInterval = setInterval(() => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.resume();
        } else {
          clearInterval(keepAliveInterval);
          keepAliveInterval = null;
        }
      }
    }, 1400);

    // Calculate maximum duration for safety timeout (character length * 120ms + 3s buffer)
    const safetyDuration = Math.max(4000, cleanText.length * 120 + 3000);
    activeSafetyTimeout = setTimeout(() => {
      if (!hasEnded) {
        console.warn("Speech synthesis safety timeout triggered.");
        window.speechSynthesis.cancel();
        cleanupAndEnd();
      }
    }, safetyDuration);

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn("Speech synthesis error:", err);
    activeUtterance = null;
    if (onEnd) onEnd();
    return false;
  }
}

/**
 * Cancels current speech synthesis and clears safety timers & keepalive loops.
 */
export function cancelSpeech(): void {
  if (activeSafetyTimeout) {
    clearTimeout(activeSafetyTimeout);
    activeSafetyTimeout = null;
  }
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
  }
  activeUtterance = null;
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}
  }
}

/**
 * Continuous Web Speech API Voice Recognition Controller Interface
 */
export interface ContinuousRecognitionOptions {
  localeCode: string;
  onResult: (transcript: string, isFinal: boolean) => void;
  onInterim?: (interimTranscript: string) => void;
  onError?: (error: any) => void;
  onStateChange?: (state: "LISTENING" | "PAUSED" | "IDLE" | "ERROR") => void;
}

/**
 * Continuous Speech Recognition Controller Class
 */
export class ContinuousSpeechController {
  private recognition: any = null;
  private isActive: boolean = false;
  private isPaused: boolean = false;
  private options: ContinuousRecognitionOptions;

  constructor(options: ContinuousRecognitionOptions) {
    this.options = options;
    this.initRecognition();
  }

  public isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  private initRecognition() {
    if (!this.isSupported()) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    rec.lang = this.options.localeCode;

    rec.onstart = () => {
      if (!this.isPaused && this.options.onStateChange) {
        this.options.onStateChange("LISTENING");
      }
    };

    rec.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (interimTranscript && this.options.onInterim) {
        this.options.onInterim(interimTranscript);
      }

      if (finalTranscript.trim()) {
        this.options.onResult(finalTranscript.trim(), true);
      }
    };

    rec.onerror = (event: any) => {
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      console.warn("Speech recognition error event:", event.error);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        this.isActive = false;
        if (this.options.onStateChange) this.options.onStateChange("ERROR");
      }
      if (this.options.onError) {
        this.options.onError(event.error);
      }
    };

    rec.onend = () => {
      if (this.isActive && !this.isPaused) {
        try {
          rec.start();
        } catch (e) {}
      } else if (this.isPaused && this.options.onStateChange) {
        this.options.onStateChange("PAUSED");
      } else if (!this.isActive && this.options.onStateChange) {
        this.options.onStateChange("IDLE");
      }
    };

    this.recognition = rec;
  }

  public setLanguage(localeCode: string) {
    this.options.localeCode = localeCode;
    if (this.recognition) {
      const wasListening = this.isActive && !this.isPaused;
      this.recognition.lang = localeCode;
      if (wasListening) {
        try {
          this.recognition.abort();
          this.recognition.start();
        } catch (e) {}
      }
    }
  }

  public start() {
    if (!this.recognition) {
      if (this.options.onError) {
        this.options.onError("NOT_SUPPORTED");
      }
      return;
    }

    this.isActive = true;
    this.isPaused = false;
    try {
      this.recognition.start();
    } catch (e) {}
  }

  public pause() {
    this.isPaused = true;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.options.onStateChange) {
      this.options.onStateChange("PAUSED");
    }
  }

  public resume() {
    this.isPaused = false;
    if (this.recognition) {
      try {
        this.recognition.start();
      } catch (e) {}
    }
  }

  public stop() {
    this.isActive = false;
    this.isPaused = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
    }
    if (this.options.onStateChange) {
      this.options.onStateChange("IDLE");
    }
  }
}
