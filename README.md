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

## Comandos por entorno (sin EAS)

Con pnpm puedes usar `pnpm expo …` (usa el `expo` del proyecto). `npx expo …` también funciona; es el runner de npm.

### Desarrollo

```bash
# Dispositivo físico: escanea el QR con Expo Go
pnpm start
# o: pnpm expo start

# Web
pnpm web
# o: pnpm expo start --web
```

Nota: en modo dev el JS se sirve desde tu PC (Metro). Si apagas el PC, la app deja de funcionar.

### Simular producción en local

Compila e instala una app nativa (Release) en el dispositivo. El JS queda empaquetado dentro del binario, así que **funciona sin la PC encendida**. No usa la nube de EAS ni consume builds.

```bash
# Android (requiere Android Studio + SDK; teléfono por USB o emulador)
pnpm expo run:android --device --variant release
# o vía script: pnpm android -- --device --variant release

# iOS (solo en Mac, requiere Xcode)
pnpm expo run:ios --device --configuration Release
# o vía script: pnpm ios -- --device --configuration Release
```

Flags (nativo):

| Flag | Plataforma | Para qué sirve | Cuándo usarla |
| --- | --- | --- | --- |
| `--device` | Android / iOS | Instala en un dispositivo físico conectado (USB) en lugar del emulador/simulador | Quieres probar en teléfono real |
| `--variant release` | Solo Android | Build de producción (JS embebido, sin Metro, optimizado) | Simular cómo se comporta la app publicada |
| `--variant debug` | Solo Android | Build de desarrollo: carga el JS desde Metro en tu PC | Depurar con hot reload; default si omites `--variant`. **Requiere la PC encendida** con `pnpm start` |
| `--configuration Release` | Solo iOS | Equivalente a `--variant release` en Xcode | Simular producción en iPhone |
| `--configuration Debug` | Solo iOS | Equivalente a `--variant debug` | Depurar en build nativo; default si omites `--configuration`. **También requiere Metro en la PC** |

Sin `--device`, Expo usa emulador Android o simulador iOS si hay uno disponible.

El `--` en `pnpm android -- --device …` separa args de pnpm de los que van a Expo.

Ejemplos:

```bash
# Emulador Android, modo debug (desarrollo nativo)
pnpm expo run:android

# Teléfono Android USB, como en producción (sin PC después)
pnpm expo run:android --device --variant release

# Simulador iOS, modo debug
pnpm expo run:ios

# iPhone físico, como en producción
pnpm expo run:ios --device --configuration Release
```

Web no usa esas flags: no hay APK/IPA. El build de producción genera archivos estáticos:

```bash
pnpm expo export --platform web
pnpm dlx serve dist
```

### Tiendas (App Store / Play Store)

Sin EAS: abre `android/` en Android Studio y `ios/` en Xcode para firmar y subir manualmente. Los builds en Release (`expo run:*`) sirven para validar antes de publicar.

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
