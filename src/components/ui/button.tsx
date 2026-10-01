import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

/**
 * - `primary`: acción normal destacada (cobalto).
 * - `accent`: la acción principal de la pantalla (bronce). Una por pantalla.
 * - `secondary`: acción de apoyo o chip sin seleccionar.
 * - `ghost`: acción terciaria (Cancelar, Volver).
 * - `danger`: acción destructiva, en tono discreto.
 */
type ButtonVariant = 'primary' | 'accent' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'md' | 'sm';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Forma de píldora: solo para chips de selección/filtro, no para acciones. */
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  pill = false,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const { colors } = theme;
  const height = size === 'sm' ? theme.components.touchTarget : theme.components.buttonHeight;

  const palette: Record<ButtonVariant, { bg: string; bgPressed: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, bgPressed: colors.primaryPressed, fg: colors.onPrimary },
    accent: { bg: colors.accent, bgPressed: colors.accentPressed, fg: colors.onAccent },
    secondary: { bg: colors.secondaryMuted, bgPressed: colors.border, fg: colors.secondary },
    ghost: { bg: 'transparent', bgPressed: colors.surfaceMuted, fg: colors.primary, border: colors.border },
    danger: { bg: colors.dangerSoft, bgPressed: colors.border, fg: colors.danger },
  };
  const tone = palette[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          minHeight: theme.components.touchTarget,
          borderRadius: pill ? theme.radius.full : theme.radius.sm + 2,
          backgroundColor: pressed ? tone.bgPressed : tone.bg,
          borderWidth: tone.border ? 1 : 0,
          borderColor: tone.border,
          opacity: disabled ? 0.45 : 1,
          paddingHorizontal: size === 'sm' ? theme.spacing[3] : theme.spacing[5],
        },
        style,
      ]}
      {...rest}
    >
      <Text variant="label" color={tone.fg} style={styles.label}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  label: {
    backgroundColor: 'transparent',
  },
});
