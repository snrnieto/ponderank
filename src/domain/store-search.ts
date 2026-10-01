/** Tiendas donde se puede buscar una opción con un clic. */
export type Store = 'amazon' | 'mercadolibre';

export const STORES: Store[] = ['amazon', 'mercadolibre'];

export type StoreSearchConfig = {
  /** Tag de Amazon Associates (p. ej. `ponderank-20`). Sin tag, la búsqueda funciona pero no genera comisión. */
  amazonTag?: string;
  /** Dominio de Amazon. Por defecto `amazon.com`. */
  amazonDomain?: string;
  /** Dominio de Mercado Libre del país. Por defecto `mercadolibre.com.co`. */
  mercadoLibreDomain?: string;
  /**
   * Parámetros de afiliado de Mercado Libre tal como los entrega su portal (`clave=valor&clave2=valor2`).
   * Sin parámetros, la búsqueda funciona pero no genera comisión.
   */
  mercadoLibreAffiliateQuery?: string;
};

function clean(value: string | undefined): string {
  return (value ?? '').trim();
}

/** Slug que usa Mercado Libre en sus listados: minúsculas, palabras separadas por guion. */
function mercadoLibreSlug(query: string): string {
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => encodeURIComponent(word))
    .join('-');
}

/** URL de búsqueda del texto en la tienda, o `null` si no hay nada que buscar. */
export function storeSearchUrl(store: Store, query: string, config: StoreSearchConfig = {}): string | null {
  const text = query.trim().replace(/\s+/g, ' ');
  if (!text) return null;

  if (store === 'amazon') {
    const domain = clean(config.amazonDomain) || 'amazon.com';
    const tag = clean(config.amazonTag);
    const params = new URLSearchParams({ k: text });
    if (tag) params.set('tag', tag);
    return `https://www.${domain}/s?${params.toString()}`;
  }

  const domain = clean(config.mercadoLibreDomain) || 'mercadolibre.com.co';
  const affiliate = clean(config.mercadoLibreAffiliateQuery).replace(/^[?&]+/, '');
  const base = `https://listado.${domain}/${mercadoLibreSlug(text)}`;
  return affiliate ? `${base}?${affiliate}` : base;
}

/** Si la tienda tiene configurado un código de afiliado (para mostrar el aviso de comisiones). */
export function hasAffiliate(store: Store, config: StoreSearchConfig): boolean {
  return store === 'amazon' ? !!clean(config.amazonTag) : !!clean(config.mercadoLibreAffiliateQuery);
}
