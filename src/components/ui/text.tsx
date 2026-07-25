import { Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ThemeColorKey } from '@/theme';

type TextVariant = 'body' | 'title' | 'subtitle' | 'caption' | 'label' | 'display' | 'overline';

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
    variant === 'display'
      ? theme.typography.sizes.display
      : variant === 'title'
        ? theme.typography.sizes.title
        : variant === 'subtitle'
          ? theme.typography.sizes.xl
          : variant === 'caption' || variant === 'overline'
            ? theme.typography.sizes.xs
            : variant === 'label'
              ? theme.typography.sizes.sm
              : theme.typography.sizes.md;

  const weight =
    variant === 'display' || variant === 'title'
      ? theme.typography.weights.bold
      : variant === 'subtitle' || variant === 'label' || variant === 'overline'
        ? theme.typography.weights.semibold
        : theme.typography.weights.regular;

  const resolvedColor =
    color ??
    (variant === 'overline' ? theme.colors.textSecondary : theme.colors[colorKey]);

  return (
    <RNText
      {...rest}
      style={[
        {
          color: resolvedColor,
          fontSize: size,
          fontFamily: theme.typography.fontFamily.sans,
          fontWeight: weight,
          lineHeight: size * (variant === 'display' ? theme.typography.lineHeights.tight : theme.typography.lineHeights.normal),
          letterSpacing: variant === 'overline' ? 1.2 : 0,
          textTransform: variant === 'overline' ? 'uppercase' : 'none',
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
