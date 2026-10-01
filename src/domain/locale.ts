/** Idiomas soportados por Ponderank. */
export type Locale = 'es' | 'en';

export const LOCALES: Locale[] = ['es', 'en'];

/** Locale BCP-47 para formatear números y fechas en cada idioma. */
export const NUMBER_LOCALE: Record<Locale, string> = { es: 'es-CO', en: 'en-US' };

/**
 * Idioma a usar para una etiqueta de idioma del sistema o navegador ("es-CO", "en-US", "pt-BR"…).
 * Español si empieza por "es"; inglés en cualquier otro caso.
 */
export function localeFromTag(tag: string | null | undefined): Locale {
  return tag && tag.toLowerCase().startsWith('es') ? 'es' : 'en';
}

/** Formatea un número según el idioma (separador de miles y decimales). */
export function formatNumber(value: number, locale: Locale, maxDecimals = 2, minDecimals = 0): string {
  return value.toLocaleString(NUMBER_LOCALE[locale], {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  });
}
