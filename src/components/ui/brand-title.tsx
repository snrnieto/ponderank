import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { APP_NAME } from '@/constants/brand';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

/** Logo + nombre de la app. Con `href` funciona como enlace (p. ej. a la landing). */
export function BrandTitle({ href, size = 28 }: { href?: Href; size?: number }) {
  const theme = useTheme();
  const { t } = useI18n();
  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2] }}>
      <Image
        source={require('@/assets/images/logo.png')}
        style={{ width: size, height: size }}
        accessibilityIgnoresInvertColors
      />
      <Text variant="subtitle">{APP_NAME}</Text>
    </View>
  );
  if (!href) return content;
  return (
    <Link href={href} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={t.brand.home(APP_NAME)}
        style={{ minHeight: theme.components.touchTarget, justifyContent: 'center' }}
      >
        {content}
      </Pressable>
    </Link>
  );
}
