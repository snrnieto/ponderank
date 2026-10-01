import { useAppearance } from '@/state/appearance';
import { getTheme, type AppTheme } from '@/theme';

/** Tema activo según la preferencia del usuario (oscuro por defecto, ver `state/appearance`). */
export function useTheme(): AppTheme {
  const { scheme } = useAppearance();
  return getTheme(scheme);
}

/** Active color palette only (compat with older Themed* components). */
export function useThemeColors() {
  return useTheme().colors;
}
