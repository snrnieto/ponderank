import { Platform, Text as RNText, type TextProps as RNTextProps, type StyleProp, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import type { ThemeColorKey } from '@/theme';

type TextVariant = 'body' | 'title' | 'subtitle' | 'caption' | 'label' | 'display' | 'overline' | 'figure';

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: string;
  colorKey?: ThemeColorKey;
  style?: StyleProp<TextStyle>;
};

/** Variantes que usan la fuente de display (Bricolage); el resto usa la de lectura (Atkinson). */
const DISPLAY_VARIANTS: TextVariant[] = ['display', 'title', 'subtitle', 'label', 'overline', 'figure'];

export function Text({
  variant = 'body',
  color,
  colorKey = 'text',
  style,
  children,
  ...rest
}: TextProps) {
  const theme = useTheme();
  const { sizes, weights, lineHeights, fontFamily } = theme.typography;

  const size =
    variant === 'display'
      ? sizes.display
      : variant === 'title'
        ? sizes.title
        : variant === 'subtitle'
          ? sizes.xl
          : variant === 'caption' || variant === 'overline'
            ? sizes.xs
            : variant === 'label'
              ? sizes.sm
              : sizes.md;

  const weight =
    variant === 'display' || variant === 'title' || variant === 'figure'
      ? weights.bold
      : variant === 'subtitle' || variant === 'label' || variant === 'overline'
        ? weights.semibold
        : weights.regular;

  const resolvedColor =
    color ?? (variant === 'overline' ? theme.colors.textSecondary : theme.colors[colorKey]);

  // Las fuentes de marca se cargan por CSS en web; en nativo se usa la del sistema.
  const family =
    Platform.OS === 'web'
      ? DISPLAY_VARIANTS.includes(variant)
        ? fontFamily.display
        : fontFamily.sans
      : undefined;

  return (
    <RNText
      {...rest}
      style={[
        {
          color: resolvedColor,
          fontSize: size,
          fontFamily: family,
          fontWeight: weight,
          lineHeight:
            size * (variant === 'display' || variant === 'title' ? lineHeights.tight : lineHeights.normal),
          letterSpacing: variant === 'display' ? -0.6 : variant === 'title' ? -0.3 : 0,
          fontVariant: variant === 'figure' ? ['tabular-nums'] : undefined,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
