import { SymbolView } from 'expo-symbols';
import { Linking, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { hasAffiliate, STORES, storeSearchUrl, type Store, type StoreSearchConfig } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

/** Códigos de afiliado. Vacíos, los botones buscan igual pero sin comisión. Ver `.env.example`. */
const CONFIG: StoreSearchConfig = {
  amazonTag: process.env.EXPO_PUBLIC_AMAZON_TAG,
  amazonDomain: process.env.EXPO_PUBLIC_AMAZON_DOMAIN,
  mercadoLibreDomain: process.env.EXPO_PUBLIC_MELI_DOMAIN,
  mercadoLibreAffiliateQuery: process.env.EXPO_PUBLIC_MELI_AFFILIATE_QUERY,
};

/** Si alguna tienda tiene código de afiliado: entonces hay que mostrar el aviso de comisiones. */
export const STORE_AFFILIATE_ENABLED = STORES.some((store) => hasAffiliate(store, CONFIG));

function storeLinks(query: string): { store: Store; url: string }[] {
  return STORES.flatMap((store) => {
    const url = storeSearchUrl(store, query, CONFIG);
    return url ? [{ store, url }] : [];
  });
}

/** Aviso de comisiones que exigen los programas de afiliados. Solo aparece si hay algún código configurado. */
export function StoreDisclosure({ color }: { color?: string }) {
  const { t } = useI18n();
  if (!STORE_AFFILIATE_ENABLED) return null;
  return (
    <Text variant="caption" color={color} colorKey="textSecondary" style={color ? { opacity: 0.8 } : undefined}>
      {t.store.disclosure}
    </Text>
  );
}

type Props = {
  /** Nombre de la opción: es el texto que se busca. */
  query: string;
  /** Color del texto del aviso cuando va sobre una superficie de marca. */
  captionColor?: string;
  /** `false` cuando la pantalla ya muestra el aviso de comisiones en otro lugar. */
  disclosure?: boolean;
};

/** Botones para buscar la opción en tiendas en línea, con aviso de afiliado si aplica. */
export function StoreSearchLinks({ query, captionColor, disclosure = true }: Props) {
  const theme = useTheme();
  const { t } = useI18n();
  const links = storeLinks(query);
  if (links.length === 0) return null;

  return (
    <View style={{ gap: theme.spacing[2] }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] }}>
        {links.map(({ store, url }) => (
          <Button
            key={store}
            title={t.store.searchIn[store]}
            variant="secondary"
            size="sm"
            accessibilityRole="link"
            accessibilityLabel={t.store.searchA11y(t.store.searchIn[store], query)}
            onPress={() => void Linking.openURL(url)}
          />
        ))}
      </View>
      {disclosure ? <StoreDisclosure color={captionColor} /> : null}
    </View>
  );
}

/** Versión compacta para las filas de la tabla: un chip por tienda con lupa y nombre corto. */
export function StoreSearchChips({ query }: { query: string }) {
  const theme = useTheme();
  const { t } = useI18n();
  const links = storeLinks(query);
  if (links.length === 0) return null;

  return (
    <View style={{ flexDirection: 'row', gap: theme.spacing[1] }}>
      {links.map(({ store, url }) => (
        <Pressable
          key={store}
          accessibilityRole="link"
          accessibilityLabel={t.store.searchA11y(t.store.searchIn[store], query)}
          onPress={() => void Linking.openURL(url)}
          style={({ pressed, hovered }) => ({
            minHeight: theme.components.touchTarget,
            paddingHorizontal: theme.spacing[2],
            borderRadius: theme.radius.full,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 4,
            backgroundColor: pressed || hovered ? theme.colors.primaryMuted : 'transparent',
          })}
        >
          <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={16} tintColor={theme.colors.primary} />
          <Text variant="caption" colorKey="primary">
            {t.store.short[store]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
