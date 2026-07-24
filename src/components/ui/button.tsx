import { Pressable, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'md' | 'sm';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const theme = useTheme();
  const height =
    size === 'sm' ? theme.components.buttonHeight - 8 : theme.components.buttonHeight;

  const background =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'secondary'
          ? theme.colors.surfaceMuted
          : 'transparent';

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.textInverse
      : variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius: theme.radius.md,
          backgroundColor:
            pressed && variant === 'primary' ? theme.colors.primaryPressed : background,
          borderWidth: variant === 'ghost' || variant === 'secondary' ? StyleSheet.hairlineWidth : 0,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.5 : 1,
          paddingHorizontal: theme.spacing[4],
        },
        style,
      ]}
      {...rest}
    >
      <Text variant="label" color={textColor}>
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
});
