import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { formatNumber, localeFromTag, type Locale } from '@/domain';
import { en } from '@/i18n/messages/en';
import { es, type Messages } from '@/i18n/messages/es';

/** «system» sigue el idioma del navegador o del teléfono. */
export type LanguagePreference = Locale | 'system';

const STORAGE_KEY = 'ponderank:language';
const MESSAGES: Record<Locale, Messages> = { es, en };

/** Idioma del navegador o del sistema operativo. */
export function detectSystemLocale(): Locale {
  if (Platform.OS === 'web' && typeof navigator !== 'undefined') {
    const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
    return localeFromTag(tags[0]);
  }
  try {
    return localeFromTag(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch {
    return 'es';
  }
}

type I18nValue = {
  locale: Locale;
  preference: LanguagePreference;
  setPreference: (preference: LanguagePreference) => void;
  t: Messages;
  /** Número con separadores del idioma activo (máx. 2 decimales por defecto). */
  n: (value: number, maxDecimals?: number, minDecimals?: number) => string;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<LanguagePreference>('system');
  const [systemLocale] = useState<Locale>(detectSystemLocale);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && (stored === 'es' || stored === 'en' || stored === 'system')) setPreferenceState(stored);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((next: LanguagePreference) => {
    setPreferenceState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const locale: Locale = preference === 'system' ? systemLocale : preference;

  // Mantiene el atributo lang del documento (lectores de pantalla, traducción del navegador).
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      preference,
      setPreference,
      t: MESSAGES[locale],
      n: (v, maxDecimals = 2, minDecimals = 0) => formatNumber(v, locale, maxDecimals, minDecimals),
    }),
    [locale, preference, setPreference],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
