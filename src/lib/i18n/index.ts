import hu from './locales/hu.json';
import en from './locales/en.json';
import de from './locales/de.json';
import fr from './locales/fr.json';

export const locales = {
  hu,
  en,
  de,
  fr,
} as const;

export type Locale = keyof typeof locales;
export type TranslationKey = keyof typeof hu;

export const languages = [
  { code: 'hu', name: 'Magyar', flag: '🇭🇺', nativeName: 'Hungarian' },
  { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'Angol' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Német' },
  { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Francia' },
] as const;

export const defaultLocale: Locale = 'hu';
