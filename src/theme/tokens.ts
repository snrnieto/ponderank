/**
 * Single source of truth for visual design.
 * Change colors, typography, spacing, or radii here — UI primitives pick them up automatically.
 *
 * Keep this file free of `react-native` imports so domain/theme unit tests run in Node.
 */
/**
 * Paleta base «Balanza de plaza». Cada color existe una sola vez aquí; los temas claro/oscuro de la
 * app y la landing toman sus valores de esta tabla (ver DESIGN.md).
 */
export const palette = {
  cobalt: '#2B3FD6',
  cobaltDeep: '#1F2FA8',
  cobaltMist: '#C9D0FF',
  cobaltWash: '#E8EBFC',
  dialWhite: '#F6F7FB',
  white: '#FFFFFF',
  dialLine: '#D8DBEA',
  surfaceTint: '#ECEEF6',
  ink: '#14162B',
  inkSoft: '#4A4E6B',
  brass: '#C8962E',
  brassLight: '#E2B85A',
  brassDeep: '#8E6516',
  brassInk: '#6E4E0F',
  brassWash: '#F6ECD6',
  /** Rojo de la aguja: solo para el veredicto (el ganador). */
  needle: '#E5372A',
  needleWash: '#FDE7E4',
  /** Rojo para acciones destructivas: más oscuro que la aguja para no confundirse con el ganador. */
  danger: '#B42318',
  green: '#1E7A46',
  greenWash: '#E3F3EA',
  /** Violeta del logo: no se usa en la interfaz, solo vive dentro del logo. */
  logoViolet: '#6C56FB',
  night: {
    background: '#0E1030',
    surface: '#171A3D',
    surfaceMuted: '#22265A',
    border: '#2F3570',
    text: '#F6F7FB',
    textSecondary: '#B8BEE6',
    cobalt: '#8E9BFF',
    cobaltPressed: '#B3BCFF',
    cobaltWash: '#262C6B',
    brassWash: '#3A2E12',
    needle: '#FF6B5E',
    needleWash: '#3D1714',
    danger: '#FF8A80',
    green: '#5BD18E',
    greenWash: '#12331F',
  },
} as const;

/** Familias tipográficas compartidas por la app y la landing (cargadas en src/app/+html.tsx). */
const fonts = {
  /** Atkinson Hyperlegible: lectura. */
  body: '"Atkinson Hyperlegible", system-ui, sans-serif',
  /** Bricolage Grotesque: títulos, botones y cifras. */
  display: '"Bricolage Grotesque", system-ui, sans-serif',
} as const;

export const tokens = {
  colors: {
    light: {
      text: palette.ink,
      textSecondary: palette.inkSoft,
      textInverse: palette.white,
      background: palette.dialWhite,
      surface: palette.white,
      surfaceMuted: palette.surfaceTint,
      border: palette.dialLine,
      primary: palette.cobalt,
      primaryPressed: palette.cobaltDeep,
      primaryMuted: palette.cobaltWash,
      /** Fondo de bloques de marca con texto blanco (veredicto, bandas). */
      brandSurface: palette.cobalt,
      /** Texto sobre el cobalto relleno (`primary`). */
      onPrimary: palette.white,
      secondary: palette.cobaltDeep,
      secondaryMuted: palette.cobaltWash,
      /** Bronce: importancia (pesas) y la acción principal de cada pantalla. */
      accent: palette.brass,
      accentPressed: palette.brassDeep,
      accentMuted: palette.brassWash,
      accentInk: palette.brassInk,
      /** Texto sobre fondo bronce. */
      onAccent: palette.ink,
      /** El ganador del ranking. Ningún otro elemento usa este rojo. */
      verdict: palette.needle,
      verdictSoft: palette.needleWash,
      danger: palette.danger,
      dangerSoft: palette.needleWash,
      success: palette.green,
      successSoft: palette.greenWash,
      warning: palette.brassInk,
      warningSoft: palette.brassWash,
      info: palette.cobaltDeep,
      infoSoft: palette.cobaltWash,
      /** @deprecated starter alias → surfaceMuted */
      backgroundElement: palette.surfaceTint,
      /** @deprecated starter alias → border */
      backgroundSelected: palette.dialLine,
    },
    dark: {
      text: palette.night.text,
      textSecondary: palette.night.textSecondary,
      textInverse: palette.white,
      background: palette.night.background,
      surface: palette.night.surface,
      surfaceMuted: palette.night.surfaceMuted,
      border: palette.night.border,
      primary: palette.night.cobalt,
      primaryPressed: palette.night.cobaltPressed,
      primaryMuted: palette.night.cobaltWash,
      brandSurface: palette.cobaltDeep,
      onPrimary: palette.night.background,
      secondary: palette.cobaltMist,
      secondaryMuted: palette.night.cobaltWash,
      accent: palette.brassLight,
      accentPressed: palette.brass,
      accentMuted: palette.night.brassWash,
      accentInk: palette.brassLight,
      onAccent: palette.night.background,
      verdict: palette.night.needle,
      verdictSoft: palette.night.needleWash,
      danger: palette.night.danger,
      dangerSoft: palette.night.needleWash,
      success: palette.night.green,
      successSoft: palette.night.greenWash,
      warning: palette.brassLight,
      warningSoft: palette.night.brassWash,
      info: palette.night.cobalt,
      infoSoft: palette.night.cobaltWash,
      backgroundElement: palette.night.surfaceMuted,
      backgroundSelected: palette.night.border,
    },
  },
  typography: {
    fontFamily: {
      sans: fonts.body,
      display: fonts.display,
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
      shadowColor: palette.ink,
      shadowOpacity: 0.06,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    },
    md: {
      shadowColor: palette.ink,
      shadowOpacity: 0.1,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 6,
    },
    lg: {
      shadowColor: palette.ink,
      shadowOpacity: 0.16,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 12 },
      elevation: 10,
    },
  },
  gradients: {
    brand: [palette.cobalt, palette.cobaltDeep] as const,
    brandSoft: [palette.cobaltMist, palette.cobaltWash] as const,
  },
  /**
   * Mundo visual de la landing pública («Balanza de plaza»). Es fijo: no cambia con el modo
   * claro/oscuro de la app. El rojo de la aguja se reserva solo para el veredicto.
   */
  landing: {
    colors: {
      enamel: palette.cobalt,
      enamelDeep: palette.cobaltDeep,
      enamelText: palette.white,
      enamelTextSoft: palette.cobaltMist,
      dial: palette.dialWhite,
      dialLine: palette.dialLine,
      ink: palette.ink,
      inkSoft: palette.inkSoft,
      brass: palette.brass,
      brassLight: palette.brassLight,
      brassDeep: palette.brassDeep,
      needle: palette.needle,
      brand: palette.logoViolet,
    },
    fonts: {
      display: fonts.display,
      body: fonts.body,
    },
    sizes: {
      headline: 68,
      headlineCompact: 42,
      section: 40,
      sectionCompact: 30,
      lead: 19,
      body: 16,
      small: 13,
      dialNumeral: 13,
      title: 20,
      numeral: 34,
      button: 18,
    },
    maxWidth: 1180,
  },
  components: {
    buttonHeight: 48,
    /** Alto mínimo de cualquier objetivo táctil (botones chicos, chips, íconos). */
    touchTarget: 44,
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
    landing: tokens.landing,
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
