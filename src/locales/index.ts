// src/locales/index.ts
import { LanguageCode, LanguageMeta, TranslationsSchema } from './types';
import { en } from './en';
import { hi } from './hi';
import { kn } from './kn';
import { mr } from './mr';
import { te } from './te';
import { ta } from './ta';
import { ml } from './ml';
import { bn } from './bn';
import { gu } from './gu';
import { pa } from './pa';

export * from './types';

export const SUPPORTED_LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', nativeName: 'English', speechLocale: 'en-IN', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', speechLocale: 'hi-IN', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', speechLocale: 'kn-IN', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', speechLocale: 'mr-IN', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', speechLocale: 'te-IN', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', speechLocale: 'ta-IN', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', speechLocale: 'ml-IN', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', speechLocale: 'bn-IN', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', speechLocale: 'gu-IN', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', speechLocale: 'pa-IN', flag: '🇮🇳' },
];

export const DICTIONARIES: Record<LanguageCode, TranslationsSchema> = {
  en,
  hi,
  kn,
  mr,
  te,
  ta,
  ml,
  bn,
  gu,
  pa,
};

/**
 * Retrieves a translated string by dot notation path (e.g., 'farmer.addCropHeading')
 * Falls back to English if the translation or key is missing.
 */
export function getTranslation(
  lang: LanguageCode,
  path: string,
  fallbackText?: string
): string {
  const dict = DICTIONARIES[lang] || DICTIONARIES.en;
  const parts = path.split('.');

  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Fallback to English dictionary
      let fallbackCurrent: any = DICTIONARIES.en;
      for (const fbPart of parts) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && fbPart in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[fbPart];
        } else {
          return fallbackText || path;
        }
      }
      return typeof fallbackCurrent === 'string' ? fallbackCurrent : fallbackText || path;
    }
  }

  return typeof current === 'string' ? current : fallbackText || path;
}
