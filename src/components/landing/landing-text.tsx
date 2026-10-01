import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Variant =
  | 'headline'
  | 'section'
  | 'title'
  | 'lead'
  | 'body'
  | 'label'
  | 'button'
  | 'small'
  | 'figure'
  | 'verdict'
  | 'numeral';

type Props = TextProps & {
  variant?: Variant;
  compact?: boolean;
  color?: string;
};

/** Tipografía del mundo «Balanza de plaza»: Bricolage Grotesque para voz, Atkinson para lectura. */
export function LandingText({ variant = 'body', compact = false, color, style, ...rest }: Props) {
  const { landing } = useTheme();
  const { fonts, sizes, colors } = landing;

  const byVariant: Record<Variant, TextStyle> = {
    headline: {
      fontFamily: fonts.display,
      fontSize: compact ? sizes.headlineCompact : sizes.headline,
      lineHeight: (compact ? sizes.headlineCompact : sizes.headline) * 1.02,
      fontWeight: '800',
      letterSpacing: -1.5,
    },
    section: {
      fontFamily: fonts.display,
      fontSize: compact ? sizes.sectionCompact : sizes.section,
      lineHeight: (compact ? sizes.sectionCompact : sizes.section) * 1.08,
      fontWeight: '700',
      letterSpacing: -0.8,
    },
    title: { fontFamily: fonts.display, fontSize: sizes.title, lineHeight: sizes.title * 1.25, fontWeight: '700' },
    lead: { fontFamily: fonts.body, fontSize: sizes.lead, lineHeight: sizes.lead * 1.55 },
    body: { fontFamily: fonts.body, fontSize: sizes.body, lineHeight: sizes.body * 1.6 },
    label: { fontFamily: fonts.display, fontSize: sizes.body, lineHeight: sizes.body * 1.3, fontWeight: '700' },
    button: { fontFamily: fonts.display, fontSize: sizes.button, lineHeight: sizes.button * 1.2, fontWeight: '700' },
    small: { fontFamily: fonts.body, fontSize: sizes.small, lineHeight: sizes.small * 1.5 },
    figure: {
      fontFamily: fonts.display,
      fontSize: sizes.body,
      fontWeight: '700',
      fontVariant: ['tabular-nums'],
    },
    verdict: {
      fontFamily: fonts.display,
      fontSize: sizes.title,
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
    },
    numeral: {
      fontFamily: fonts.display,
      fontSize: sizes.numeral,
      lineHeight: sizes.numeral * 1.1,
      fontWeight: '800',
      fontVariant: ['tabular-nums'],
    },
  };

  return <Text {...rest} style={[byVariant[variant], { color: color ?? colors.ink }, style]} />;
}
