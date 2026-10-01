import { SymbolView } from 'expo-symbols';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Props = {
  checked: boolean;
  /** Estado intermedio (p. ej. "algunos seleccionados" en el checkbox de seleccionar todos). */
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  accessibilityLabel?: string;
};

export function Checkbox({ checked, indeterminate = false, onChange, accessibilityLabel }: Props) {
  const theme = useTheme();
  const active = checked || indeterminate;
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: indeterminate ? 'mixed' : checked }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={theme.components.hitSlop}
      onPress={() => onChange(!checked)}
      style={{
        width: 22,
        height: 22,
        borderRadius: theme.radius.sm - 2,
        borderWidth: 2,
        borderColor: active ? theme.colors.primary : theme.colors.border,
        backgroundColor: active ? theme.colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {active ? (
        <SymbolView
          name={
            indeterminate
              ? { ios: 'minus', android: 'remove', web: 'remove' }
              : { ios: 'checkmark', android: 'check', web: 'check' }
          }
          size={14}
          weight="bold"
          tintColor={theme.colors.textInverse}
        />
      ) : null}
    </Pressable>
  );
}
