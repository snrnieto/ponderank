import {
  Platform,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Text } from '@/components/ui/text';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'md' | 'sm';

export type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
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
  const height =
    size === 'sm' ? theme.components.buttonHeight - 8 : theme.components.buttonHeight;
  const borderRadius = pill ? theme.radius.full : theme.radius.md;
  const paddingHorizontal = theme.spacing[4];
  const [from, to] = theme.gradients.brand;
  const gradientCss = `linear-gradient(135deg, ${from}, ${to})`;

  const textColor =
    variant === 'primary' || variant === 'danger'
      ? theme.colors.textInverse
      : variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.text;

  const background =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'danger'
        ? theme.colors.danger
        : variant === 'secondary'
          ? theme.colors.secondaryMuted
          : 'transparent';

  const gradientStyle =
    variant === 'primary'
      ? Platform.select<ViewStyle>({
          web: { backgroundImage: gradientCss },
          default: { experimental_backgroundImage: gradientCss },
        })
      : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          borderRadius,
          backgroundColor: background,
          borderWidth: variant === 'ghost' ? StyleSheet.hairlineWidth : 0,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
          paddingHorizontal,
        },
        gradientStyle,
        style,
      ]}
      {...rest}
    >
      <Text
        variant="label"
        color={variant === 'secondary' ? theme.colors.secondary : textColor}
        style={styles.label}
      >
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
