import { SymbolView } from 'expo-symbols';
import { Pressable, View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { useAppearance } from '@/state/appearance';
import type { ColorSchemeName } from '@/theme';

const OPTIONS: { scheme: ColorSchemeName; icon: { ios: 'moon.fill' | 'sun.max.fill'; android: string; web: string } }[] = [
  { scheme: 'dark', icon: { ios: 'moon.fill', android: 'dark_mode', web: 'dark_mode' } },
  { scheme: 'light', icon: { ios: 'sun.max.fill', android: 'light_mode', web: 'light_mode' } },
];

/** Selector de apariencia (oscuro por defecto / claro). Se guarda como preferencia. */
export function AppearanceSwitcher() {
  const theme = useTheme();
  const { t } = useI18n();
  const { scheme, setScheme } = useAppearance();

  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={t.appearance.label}
      style={{
        flexDirection: 'row',
        padding: 3,
        gap: 2,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
      }}
    >
      {OPTIONS.map((option) => {
        const active = option.scheme === scheme;
        const label = option.scheme === 'dark' ? t.appearance.dark : t.appearance.light;
        return (
          <Pressable
            key={option.scheme}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={t.appearance.switchTo(label)}
            onPress={() => setScheme(option.scheme)}
            style={{
              minWidth: 44,
              minHeight: 36,
              borderRadius: theme.radius.full,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? theme.colors.primary : 'transparent',
            }}
          >
            <SymbolView
              name={option.icon as never}
              size={18}
              tintColor={active ? theme.colors.onPrimary : theme.colors.textSecondary}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
