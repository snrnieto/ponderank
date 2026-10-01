import { SymbolView } from 'expo-symbols';
import type { Href } from 'expo-router';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { safeGoBack } from '@/navigation/safe-go-back';

/**
 * Flecha de volver siempre visible. La flecha nativa del Stack desaparece cuando no hay
 * historial (p. ej. al recargar en web); esta usa `safeGoBack` con la pantalla padre como respaldo.
 */
export function HeaderBackButton({ fallback }: { fallback: Href }) {
  const theme = useTheme();
  const { t } = useI18n();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t.common.back}
      hitSlop={theme.components.hitSlop}
      onPress={() => safeGoBack(fallback)}
      style={{
        minWidth: theme.components.touchTarget,
        minHeight: theme.components.touchTarget,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing[1],
      }}
    >
      <SymbolView
        name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
        size={22}
        tintColor={theme.colors.primary}
      />
    </Pressable>
  );
}
