import { SymbolView } from 'expo-symbols';
import type { Href } from 'expo-router';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { safeGoBack } from '@/navigation/safe-go-back';

/**
 * Flecha de volver siempre visible. La flecha nativa del Stack desaparece cuando no hay
 * historial (p. ej. al recargar en web); esta usa `safeGoBack` con la pantalla padre como respaldo.
 */
export function HeaderBackButton({ fallback }: { fallback: Href }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Volver"
      hitSlop={theme.components.hitSlop}
      onPress={() => safeGoBack(fallback)}
      style={{ paddingRight: theme.spacing[3] }}
    >
      <SymbolView
        name={{ ios: 'chevron.left', android: 'arrow_back', web: 'arrow_back' }}
        size={22}
        tintColor={theme.colors.primary}
      />
    </Pressable>
  );
}
