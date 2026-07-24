import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ThemeColorKey } from '@/theme';

type TextVariant = 'body' | 'title' | 'subtitle' | 'caption' | 'label';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  colorKey?: ThemeColorKey;
  style?: StyleProp<TextStyle>;
};

export function Text({
  variant = 'body',
  color,
  colorKey = 'text',
  style,
  children,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const size =
    variant === 'title'
      ? theme.typography.sizes.title
      : variant === 'subtitle'
        ? theme.typography.sizes.xl
        : variant === 'caption'
          ? theme.typography.sizes.sm
          : variant === 'label'
            ? theme.typography.sizes.sm
            : theme.typography.sizes.md;

  const weight =
    variant === 'title' || variant === 'subtitle' || variant === 'label'
      ? theme.typography.weights.semibold
      : theme.typography.weights.regular;

  return (
    <RNText
      {...rest}
      style={[
        {
          color: color ?? theme.colors[colorKey],
          fontSize: size,
          fontFamily: theme.typography.fontFamily.sans,
          fontWeight: weight,
          lineHeight: size * theme.typography.lineHeights.normal,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
