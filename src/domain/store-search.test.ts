import { describe, expect, it } from 'vitest';

import { hasAffiliate, storeSearchUrl } from './store-search';

describe('storeSearchUrl', () => {
  it('returns null for an empty query', () => {
    expect(storeSearchUrl('amazon', '   ')).toBeNull();
    expect(storeSearchUrl('mercadolibre', '')).toBeNull();
  });

  it('builds an Amazon search without tag', () => {
    expect(storeSearchUrl('amazon', ' Lenovo  ThinkPad T14 ')).toBe('https://www.amazon.com/s?k=Lenovo+ThinkPad+T14');
  });

  it('adds the Amazon tag and custom domain', () => {
    expect(storeSearchUrl('amazon', 'Kindle', { amazonTag: 'ponderank-20', amazonDomain: 'amazon.es' })).toBe(
      'https://www.amazon.es/s?k=Kindle&tag=ponderank-20',
    );
  });

  it('builds a Mercado Libre listing slug', () => {
    expect(storeSearchUrl('mercadolibre', 'Mazda 3 Grand Touring')).toBe(
      'https://listado.mercadolibre.com.co/mazda-3-grand-touring',
    );
  });

  it('encodes special characters in the Mercado Libre slug', () => {
    expect(storeSearchUrl('mercadolibre', 'Cámara 4K/HDR')).toBe(
      'https://listado.mercadolibre.com.co/c%C3%A1mara-4k%2Fhdr',
    );
  });

  it('appends Mercado Libre affiliate params and custom domain', () => {
    expect(
      storeSearchUrl('mercadolibre', 'iPhone', { mercadoLibreDomain: 'mercadolibre.com.mx', mercadoLibreAffiliateQuery: '?a=1&b=2' }),
    ).toBe('https://listado.mercadolibre.com.mx/iphone?a=1&b=2');
  });
});

describe('hasAffiliate', () => {
  it('detects configured affiliate codes per store', () => {
    expect(hasAffiliate('amazon', {})).toBe(false);
    expect(hasAffiliate('amazon', { amazonTag: ' x-20 ' })).toBe(true);
    expect(hasAffiliate('mercadolibre', { amazonTag: 'x-20' })).toBe(false);
    expect(hasAffiliate('mercadolibre', { mercadoLibreAffiliateQuery: 'a=1' })).toBe(true);
  });
});
