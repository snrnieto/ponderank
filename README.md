# Item Ranking

App Expo (web + móvil) para comparar productos en listas configurables con ranking automático.

## Requisitos

- Node + [pnpm](https://pnpm.io)
- Expo SDK 57

## Instalación

```bash
pnpm install
```

## Scripts

```bash
pnpm start      # Dev server
pnpm web        # Web
pnpm android    # Android
pnpm ios        # iOS
pnpm test       # Unit tests (dominio + data + theme)
```

## Demo seed

Por defecto, si el storage está vacío, se carga la lista **Vehículos usados** (datos de `Comparativa compras.xlsx`).

Para desactivar (productivo / storage limpio):

```bash
# .env
EXPO_PUBLIC_ENABLE_DEMO_SEED=false
```

O elimina `src/data/demo-vehicles-seed.ts` y la llamada en el repositorio.

## Design system

Tokens en un solo archivo: [`src/theme/tokens.ts`](src/theme/tokens.ts).

Cambia `tokens.colors.light.primary` (y dark) para actualizar todos los botones primarios. Guía: [`src/theme/README.md`](src/theme/README.md).

## Futuro Supabase

La persistencia pasa por `ListsRepository` (`src/data/lists-repository.ts`). Hoy: AsyncStorage. Después: implementar `SupabaseListsRepository` en `createRepository()` sin tocar el dominio ni la UI.

## Estructura útil

- `src/domain/` — motor de cálculo/ranking (puro)
- `src/data/` — repositorio + seed
- `src/state/` — contexto y vista de lista
- `src/theme/` — design tokens
- `src/components/ui/` — Button, Text, TextInput, Surface
- `src/app/` — pantallas expo-router
