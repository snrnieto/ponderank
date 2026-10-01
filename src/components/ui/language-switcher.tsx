import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { LOCALES } from '@/domain';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

/**
 * Selector de idioma compacto (ES · EN). Por defecto la app sigue el idioma del navegador o del
 * teléfono; al elegir uno, la preferencia queda guardada.
 * `tone="onBrand"` es para usarlo sobre el cobalto de la landing.
 */
export function LanguageSwitcher({ tone = 'default' }: { tone?: 'default' | 'onBrand' }) {
  const theme = useTheme();
  const { locale, setPreference, t } = useI18n();
  const onBrand = tone === 'onBrand';

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t.language.label}
      style={{
        flexDirection: 'row',
        padding: 3,
        gap: 2,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: onBrand ? theme.landing.colors.enamelTextSoft : theme.colors.border,
      }}
    >
      {LOCALES.map((code) => {
        const active = code === locale;
        const fg = onBrand
          ? active
            ? theme.landing.colors.enamel
            : theme.landing.colors.enamelText
          : active
            ? theme.colors.onPrimary
            : theme.colors.textSecondary;
        const bg = active ? (onBrand ? theme.landing.colors.enamelText : theme.colors.primary) : 'transparent';
        return (
          <Pressable
            key={code}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={t.language.switchTo(t.language[code])}
            onPress={() => setPreference(code)}
            style={{
              minWidth: 44,
              minHeight: 36,
              paddingHorizontal: theme.spacing[2],
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bg,
            }}
          >
            <Text variant="label" color={fg}>
              {t.language.short[code]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
