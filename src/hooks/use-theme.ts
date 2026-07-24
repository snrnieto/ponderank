/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from '@/hooks/use-color-scheme';
import { getTheme, type AppTheme, type ColorSchemeName } from '@/theme';

export function useTheme(): AppTheme {
  const scheme = useColorScheme();
  const resolved: ColorSchemeName = scheme === 'dark' ? 'dark' : 'light';
  return getTheme(resolved);
}

/** Active color palette only (compat with older Themed* components). */
export function useThemeColors() {
  return useTheme().colors;
}
