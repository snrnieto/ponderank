# Ponderank

App personal Expo (web + móvil) para decidir qué comprar. El usuario crea **listas de comparación** de cualquier categoría (vehículos, computadores, veterinarias…), define un **esquema de columnas** propio por lista, agrega productos/opciones (items) por formulario, y la app calcula un **ranking ponderado** de cuál es la mejor opción. Reemplaza una hoja de cálculo con fórmulas manuales (origen del seed de demo "Vehículos usados").

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
pnpm typecheck             # tsc --noEmit
```

Simular producción sin EAS: `pnpm expo run:android --device --variant release` (iOS: `--configuration Release`). Web estático: `pnpm expo export --platform web`. Detalles en el README.

## Arquitectura

Capas con dependencia en un solo sentido: `app/ → state/ → domain/` y `state/ → data/ → domain/`.

- **`src/domain/`** — motor puro (sin React ni storage), con tests. Es el corazón de la app:
  - `types.ts`: modelo. Un `ComparisonListBundle` = `list` + `globals` (variables de lista, p.ej. precio del galón) + `columns` + `items`. Los valores de un item viven en `item.values[columnId]`.
  - Tipos de columna (`ColumnKind`): `text`, `number`, `image`, `category` (con `options`, usada para filtros), `calculated` y `criterion`. Una columna entra al ranking si tiene `rank` (peso, sentido `lowerBetter`/`higherBetter`, objetivo `min|max|avg|custom`); una calculada puede ser informativa o criterio.
  - `evaluate.ts`: resuelve columnas calculadas en orden topológico (lanza error en ciclos). Operandos son `ValueRef` con forma `column:<id>` o `global:<id>`. Solo operaciones predefinidas (`calc-ops.ts` contiene etiquetas/ejemplos en español mostrados en la UI) — no hay editor de fórmulas, por decisión de producto.
  - `ranking.ts`: score por criterio 0–100 (menor mejor: `objetivo/valor`; mayor mejor: `valor/objetivo`; tope 100; sin valor → 0). Total = Σ score × peso/100. Los pesos de criterios deben sumar 100 (`canSaveSchema`, tolerancia 0.01); no se guarda un esquema inválido. `computeRanking` acepta `universeItems`: los objetivos dinámicos (min/max/avg) se calculan sobre ese universo, lo que permite rankear solo los items filtrados contra toda la lista o solo contra los visibles.
- **`src/data/`** — persistencia detrás de la interfaz `ListsRepository`. Implementación actual: AsyncStorage, todo el estado en un único JSON bajo la clave `item-ranking:v1` (`StoredPayload { version: 1, bundles }`). Para cambiar de backend (planeado: Supabase) se implementa otro repositorio y se cambia `createRepository()`; dominio y UI no deben cambiar. Si el storage está vacío y `EXPO_PUBLIC_ENABLE_DEMO_SEED=true` se carga el seed de vehículos (apagado por defecto: los usuarios nuevos empiezan sin listas).
- **`src/state/`** — `ListsProvider` (`lists-context.tsx`) expone CRUD de listas/items/esquema; cada mutación llama al repositorio y luego recarga todo (`refresh`). `use-list-view.ts` es el estado de la vista de una lista: orden (`ranking`, `column:<id>`, `partial:<id>`, `name`), mostrar % parciales, filtro por categoría y `recalcMode` (`all` vs `visible`). Al cambiar un filtro se pregunta al usuario qué modo de recálculo usar (`filter-recalc-modal`).
- **`src/app/`** — rutas expo-router: `index` (landing pública), `list/index` (mis listas), `list/[listId]/index` (ranking), `list/[listId]/schema` (columnas, globales, pesos), `list/[listId]/items/new`, `items/import` (carga masiva) y `items/[itemId]`. Stack definido en `_layout.tsx`. Para volver atrás usa `src/navigation/safe-go-back.ts`.
- **`src/components/`** — `ui/` son los primitivos del design system; `list/` y `schema/` son componentes de pantalla.
- **`src/theme/`** — todos los tokens visuales en `tokens.ts` (claro/oscuro), consumidos vía `useTheme()`. Reglas: las pantallas en `src/app/**` no usan hex crudos ni `fontSize` mágicos; importa UI de `@/components/ui/*` y tema de `@/theme`. Ver `src/theme/README.md`. Landing y app comparten una sola paleta (`palette` en `tokens.ts`, mundo visual «Balanza de plaza» documentado en `DESIGN.md`; contexto de producto en `PRODUCT.md`): no agregues colores fuera de ella. El rojo `verdict` es solo para el ganador; los textos visibles van en lenguaje de comprador («opción», «qué te importa», «importancia», «nota»), no «item», «criterio» ni «peso».

Alias de imports: `@/*` → `src/*` (configurado en `tsconfig.json` y `vitest.config.ts`).

## Convenciones

- La UI es bilingüe (español/inglés). Ningún texto visible va escrito en componentes: vive en `src/i18n/messages/es.ts` (define la forma `Messages`) y `en.ts`, y se lee con `useI18n()` (`t`, `n` para números, `locale`). El idioma se detecta del navegador/teléfono y se puede fijar con el selector (clave `ponderank:language`). El dominio recibe `locale` como parámetro, nunca importa i18n.
- Tema oscuro por defecto; el usuario puede pasar a claro (`useAppearance()`, clave `ponderank:appearance`). Los selectores de tema e idioma aparecen en un solo lugar por pantalla (encabezado de `/list`; en la landing, barra superior o pie en pantallas angostas).
- Mantén `src/domain/` puro y testeado; la lógica de cálculo nueva va ahí, no en componentes.
- Los IDs se generan con `createId(prefix)` en `src/data/lists-repository.ts`.
