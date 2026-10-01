import { useAppearance } from '@/state/appearance';

/** Esquema de color elegido en la app (no el del sistema operativo). */
export function useColorScheme() {
  return useAppearance().scheme;
}
