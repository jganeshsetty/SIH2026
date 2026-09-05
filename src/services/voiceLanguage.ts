export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  speechLocale: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-IN' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN' }
];

export const TRANSLATIONS: Record<string, Record<string, string>> = {
  mr: {
    marketIntelligence: 'बाजार बुद्धिमत्ता आणि बाजार भाव',
    mandiPrices: 'कृषी उत्पन्न बाजार समिती (APMC) भाव',
    aiMarketAdvisor: 'एआय कृषी सल्लागार (विक्री / साठवणूक / गट)',
    sellNow: 'आत्ताच विक्री करा',
    store: 'कोल्ड स्टोरेजमध्ये साठवा',
    aggregate: 'FPO शेतकरी गटाद्वारे एकत्रित करा',
    smartMatching: 'स्मार्ट खरेदीदार जुळणी',
    buyerDemand: 'खरेदीदार मागणी आणि गुणवत्ता',
    fpoAggregation: 'FPO शेतकरी उत्पादक कंपनी',
    coldStorage: 'जवळपासचे गोदाम आणि कोल्ड स्टोरेज',
    ecosystemMap: 'कृषी परिसंस्था नकाशा (मंडी, गोदामे, FPO)',
    voiceAssistant: 'आवाज सहाय्यक (बोलून प्रश्न विचारा)'
  },
  hi: {
    marketIntelligence: 'बाजार बुद्धिमत्ता एवं मंडी भाव',
    mandiPrices: 'कृषि उपज मंडी (APMC) भाव',
    aiMarketAdvisor: 'एआई कृषि सलाहकार (बिक्री / भंडारण / समूह)',
    sellNow: 'अभी बिक्री करें',
    store: 'कोल्ड स्टोरेज में स्टोर करें',
    aggregate: 'FPO किसान समूह से एकत्र करें',
    smartMatching: 'स्मार्ट खरीदार मैचिंग',
    buyerDemand: 'खरीदार मांग एवं गुणवत्ता',
    fpoAggregation: 'FPO किसान उत्पादक समूह',
    coldStorage: 'निकटतम गोदाम एवं कोल्ड स्टोरेज',
    ecosystemMap: 'कृषि पारिस्थितिकी तंत्र मानचित्र',
    voiceAssistant: 'ध्वनि सहायक (बोलकर प्रश्न पूछें)'
  }
};

/**
 * Text to Speech Synthesizer using Web Speech API
 */
export function speakText(text: string, localeCode: string = 'mr-IN'): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel(); // Stop any active speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = localeCode;
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }
}

/**
 * Web Speech API Voice Recognition Wrapper
 */
export function createSpeechRecognition(
  localeCode: string = 'mr-IN',
  onResult: (transcript: string) => void,
  onError?: (err: any) => void
): { start: () => void; stop: () => void } | null {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    console.warn('Web Speech Recognition API is not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = localeCode;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
  };

  if (onError) {
    recognition.onerror = onError;
  }

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop()
  };
}
