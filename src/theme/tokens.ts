/**
 * Single source of truth for visual design.
 * Change colors, typography, spacing, or radii here — UI primitives pick them up automatically.
 *
 * Keep this file free of `react-native` imports so domain/theme unit tests run in Node.
 */
export const tokens = {
  colors: {
    light: {
      text: '#0F0E17',
      textSecondary: '#6B7280',
      textInverse: '#FFFFFF',
      background: '#F4F4FB',
      surface: '#FFFFFF',
      surfaceMuted: '#EEF0F8',
      border: '#E4E6F0',
      primary: '#6C5CE7',
      primaryPressed: '#5A4BD4',
      primaryMuted: '#EDEBFD',
      secondary: '#2F6BFF',
      secondaryMuted: '#E8F0FF',
      danger: '#EF4444',
      dangerSoft: '#FEE2E2',
      success: '#10B981',
      successSoft: '#D1FAE5',
      warning: '#F59E0B',
      warningSoft: '#FEF3C7',
      info: '#3B82F6',
      infoSoft: '#DBEAFE',
      /** @deprecated starter alias → surfaceMuted */
      backgroundElement: '#EEF0F8',
      /** @deprecated starter alias → surfaceMuted */
      backgroundSelected: '#E4E6F0',
    },
    dark: {
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      textInverse: '#FFFFFF',
      background: '#0B0B14',
      surface: '#161622',
      surfaceMuted: '#222233',
      border: '#2E2E44',
      primary: '#A78BFA',
      primaryPressed: '#C4B5FD',
      primaryMuted: '#2E2458',
      secondary: '#60A5FA',
      secondaryMuted: '#1E3A5F',
      danger: '#F87171',
      dangerSoft: '#3F1D1D',
      success: '#34D399',
      successSoft: '#14352B',
      warning: '#FBBF24',
      warningSoft: '#3F2E10',
      info: '#60A5FA',
      infoSoft: '#1E3A5F',
      backgroundElement: '#222233',
      backgroundSelected: '#2E2E44',
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
      display: 34,
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
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  elevation: {
    sm: {
      shadowColor: '#6C5CE7',
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    md: {
      shadowColor: '#6C5CE7',
      shadowOpacity: 0.12,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    lg: {
      shadowColor: '#6C5CE7',
      shadowOpacity: 0.18,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
  },
  gradients: {
    brand: ['#6C5CE7', '#2F6BFF'] as const,
    brandSoft: ['#A78BFA', '#60A5FA'] as const,
  },
  components: {
    buttonHeight: 48,
    inputHeight: 48,
    hitSlop: 8,
  },
} as const;

export type ColorSchemeName = 'light' | 'dark';
export type ThemeColors = (typeof tokens.colors)[ColorSchemeName];
export type ThemeColorKey = keyof ThemeColors;
export type ElevationLevel = keyof typeof tokens.elevation;

export function getTheme(scheme: ColorSchemeName) {
  return {
    scheme,
    colors: tokens.colors[scheme],
    typography: tokens.typography,
    spacing: tokens.spacing,
    radius: tokens.radius,
    elevation: tokens.elevation,
    gradients: tokens.gradients,
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
export const MaxContentWidth = 1440;
export const BottomTabInset = 50;
