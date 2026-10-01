# Item Ranking

App personal Expo (web + móvil) para decidir qué comprar. El usuario crea **listas de comparación** de cualquier categoría (vehículos, computadores, veterinarias…), define un **esquema de columnas** propio por lista, agrega productos/opciones (items) por formulario, y la app calcula un **ranking ponderado** de cuál es la mejor opción. Reemplaza una hoja de cálculo con fórmulas manuales (ver `Comparativa compras.xlsx`, origen del seed de demo "Vehículos usados").

Requisitos de producto y decisiones: [docs/brainstorms/2026-07-24-item-ranking-comparator-requirements.md](docs/brainstorms/2026-07-24-item-ranking-comparator-requirements.md). Plan de implementación: [docs/plans/2026-07-24-001-feat-item-ranking-comparator-plan.md](docs/plans/2026-07-24-001-feat-item-ranking-comparator-plan.md).

## Expo HAS CHANGED

Expo SDK 57 / React Native 0.86 / React 19.2 (React Compiler y typed routes activados en `app.json`). Lee la documentación versionada en https://docs.expo.dev/versions/v57.0.0/ antes de escribir código; no asumas APIs de versiones anteriores.

## Comandos

Gestor de paquetes: **pnpm**.

```bash
pnpm install
pnpm start                 # Metro / Expo Go
pnpm web                   # Web
pnpm android | pnpm ios    # Build nativo (expo run:*)
pnpm lint                  # expo lint
pnpm test                  # vitest run (src/**/*.test.ts, entorno node)
pnpm test:watch
pnpm vitest run src/domain/ranking.test.ts   # un solo archivo
pnpm vitest run -t "nombre del test"         # un solo test
pnpm exec tsc --noEmit     # type-check
```

Simular producción sin EAS: `pnpm expo run:android --device --variant release` (iOS: `--configuration Release`). Web estático: `pnpm expo export --platform web`. Detalles en el README.

## Arquitectura

Capas con dependencia en un solo sentido: `app/ → state/ → domain/` y `state/ → data/ → domain/`.

- **`src/domain/`** — motor puro (sin React ni storage), con tests. Es el corazón de la app:
  - `types.ts`: modelo. Un `ComparisonListBundle` = `list` + `globals` (variables de lista, p.ej. precio del galón) + `columns` + `items`. Los valores de un item viven en `item.values[columnId]`.
  - Tipos de columna (`ColumnKind`): `text`, `number`, `image`, `category` (con `options`, usada para filtros), `calculated` y `criterion`. Una columna entra al ranking si tiene `rank` (peso, sentido `lowerBetter`/`higherBetter`, objetivo `min|max|avg|custom`); una calculada puede ser informativa o criterio.
  - `evaluate.ts`: resuelve columnas calculadas en orden topológico (lanza error en ciclos). Operandos son `ValueRef` con forma `column:<id>` o `global:<id>`. Solo operaciones predefinidas (`calc-ops.ts` contiene etiquetas/ejemplos en español mostrados en la UI) — no hay editor de fórmulas, por decisión de producto.
  - `ranking.ts`: score por criterio 0–100 (menor mejor: `objetivo/valor`; mayor mejor: `valor/objetivo`; tope 100; sin valor → 0). Total = Σ score × peso/100. Los pesos de criterios deben sumar 100 (`canSaveSchema`, tolerancia 0.01); no se guarda un esquema inválido. `computeRanking` acepta `universeItems`: los objetivos dinámicos (min/max/avg) se calculan sobre ese universo, lo que permite rankear solo los items filtrados contra toda la lista o solo contra los visibles.
- **`src/data/`** — persistencia detrás de la interfaz `ListsRepository`. Implementación actual: AsyncStorage, todo el estado en un único JSON bajo la clave `item-ranking:v1` (`StoredPayload { version: 1, bundles }`). Para cambiar de backend (planeado: Supabase) se implementa otro repositorio y se cambia `createRepository()`; dominio y UI no deben cambiar. Si el storage está vacío se carga el seed de vehículos salvo que `EXPO_PUBLIC_ENABLE_DEMO_SEED=false`.
- **`src/state/`** — `ListsProvider` (`lists-context.tsx`) expone CRUD de listas/items/esquema; cada mutación llama al repositorio y luego recarga todo (`refresh`). `use-list-view.ts` es el estado de la vista de una lista: orden (`ranking`, `column:<id>`, `partial:<id>`, `name`), mostrar % parciales, filtro por categoría y `recalcMode` (`all` vs `visible`). Al cambiar un filtro se pregunta al usuario qué modo de recálculo usar (`filter-recalc-modal`).
- **`src/app/`** — rutas expo-router: `index` (mis listas), `lists/[listId]/index` (ranking), `lists/[listId]/schema` (columnas, globales, pesos), `lists/[listId]/items/new` y `items/[itemId]`. Stack definido en `_layout.tsx`. Para volver atrás usa `src/navigation/safe-go-back.ts`.
- **`src/components/`** — `ui/` son los primitivos del design system; `list/` y `schema/` son componentes de pantalla.
- **`src/theme/`** — todos los tokens visuales en `tokens.ts` (claro/oscuro), consumidos vía `useTheme()`. Reglas: las pantallas en `src/app/**` no usan hex crudos ni `fontSize` mágicos; importa UI de `@/components/ui/*` y tema de `@/theme`. Ver `src/theme/README.md`.

Alias de imports: `@/*` → `src/*` (configurado en `tsconfig.json` y `vitest.config.ts`).

## Convenciones

- El texto de la UI está en español.
- Mantén `src/domain/` puro y testeado; la lógica de cálculo nueva va ahí, no en componentes.
- Los IDs se generan con `createId(prefix)` en `src/data/lists-repository.ts`.
