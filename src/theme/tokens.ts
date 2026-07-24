/**
 * Single source of truth for visual design.
 * Change colors, typography, spacing, or radii here — UI primitives pick them up automatically.
 *
 * Keep this file free of `react-native` imports so domain/theme unit tests run in Node.
 */
export const tokens = {
  colors: {
    light: {
      text: '#111827',
      textSecondary: '#6B7280',
      textInverse: '#FFFFFF',
      background: '#F8FAFC',
      surface: '#FFFFFF',
      surfaceMuted: '#F1F5F9',
      border: '#E2E8F0',
      primary: '#0F766E',
      primaryPressed: '#0D9488',
      primaryMuted: '#CCFBF1',
      danger: '#DC2626',
      success: '#16A34A',
      warning: '#D97706',
      /** @deprecated starter alias → surfaceMuted */
      backgroundElement: '#F1F5F9',
      /** @deprecated starter alias → surfaceMuted */
      backgroundSelected: '#E2E8F0',
    },
    dark: {
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      textInverse: '#0F172A',
      background: '#0F172A',
      surface: '#1E293B',
      surfaceMuted: '#334155',
      border: '#475569',
      primary: '#2DD4BF',
      primaryPressed: '#5EEAD4',
      primaryMuted: '#134E4A',
      danger: '#F87171',
      success: '#4ADE80',
      warning: '#FBBF24',
      backgroundElement: '#334155',
      backgroundSelected: '#475569',
    },
  },
  typography: {
    fontFamily: {
      sans: 'system-ui',
      mono: 'monospace',
    },
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 22,
      title: 28,
    },
    weights: {
      regular: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
  },
  spacing: {
    0: 0,
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    7: 48,
    8: 64,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 16,
    full: 9999,
  },
  components: {
    buttonHeight: 44,
    inputHeight: 44,
    hitSlop: 8,
  },
} as const;

export type ColorSchemeName = 'light' | 'dark';
export type ThemeColors = (typeof tokens.colors)[ColorSchemeName];
export type ThemeColorKey = keyof ThemeColors;

export function getTheme(scheme: ColorSchemeName) {
  return {
    scheme,
    colors: tokens.colors[scheme],
    typography: tokens.typography,
    spacing: tokens.spacing,
    radius: tokens.radius,
    components: tokens.components,
  };
}

export type AppTheme = ReturnType<typeof getTheme>;

/** @deprecated Prefer `tokens` / `getTheme`. Kept for gradual migration. */
export const Colors = tokens.colors;
export const Spacing = {
  half: tokens.spacing[1] / 2,
  one: tokens.spacing[1],
  two: tokens.spacing[2],
  three: tokens.spacing[4],
  four: tokens.spacing[5],
  five: tokens.spacing[6],
  six: tokens.spacing[8],
} as const;
export const Fonts = {
  sans: tokens.typography.fontFamily.sans,
  mono: tokens.typography.fontFamily.mono,
  serif: 'serif',
  rounded: 'system-ui',
};
export const MaxContentWidth = 800;
export const BottomTabInset = 50;

