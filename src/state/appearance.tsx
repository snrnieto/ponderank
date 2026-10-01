import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { ColorSchemeName } from '@/theme';

const STORAGE_KEY = 'ponderank:appearance';

/** Modo oscuro por defecto; el usuario puede elegir el claro y la preferencia queda guardada. */
export const DEFAULT_SCHEME: ColorSchemeName = 'dark';

type AppearanceValue = {
  scheme: ColorSchemeName;
  setScheme: (scheme: ColorSchemeName) => void;
};

const AppearanceContext = createContext<AppearanceValue | null>(null);

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const [scheme, setSchemeState] = useState<ColorSchemeName>(DEFAULT_SCHEME);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (active && (stored === 'dark' || stored === 'light')) setSchemeState(stored);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const setScheme = useCallback((next: ColorSchemeName) => {
    setSchemeState(next);
    void AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined);
  }, []);

  const value = useMemo(() => ({ scheme, setScheme }), [scheme, setScheme]);
  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

/** Esquema de color activo. Fuera del proveedor (p. ej. en tests) usa el de por defecto. */
export function useAppearance(): AppearanceValue {
  return useContext(AppearanceContext) ?? { scheme: DEFAULT_SCHEME, setScheme: () => undefined };
}
