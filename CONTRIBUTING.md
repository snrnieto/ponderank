# Cómo contribuir a Ponderank

¡Gracias por querer ayudar! Ponderank es gratis y de código abierto, y crece con los reportes y mejoras de la comunidad.

## Formas de ayudar

- **Reportar un error**: abre un [issue](../../issues/new/choose) con la plantilla «Reportar un error».
- **Proponer una mejora**: usa la plantilla «Proponer una mejora». Si es un cambio grande, espera a que lo conversemos en el issue antes de programarlo: así no pierdes tiempo en algo que quizá no encaje.
- **Programar**: busca issues con la etiqueta `good first issue` si es tu primera vez, o comenta en el issue que quieres tomarlo.

## Preparar el entorno

Necesitas Node 24 y [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm web          # abre la app en el navegador
```

El resto de comandos (móvil, build de producción) están en el [README](README.md).

## Antes de abrir un pull request

Corre lo mismo que corre el CI; el PR no se aprueba si alguno falla:

```bash
pnpm typecheck
pnpm lint
pnpm test
```

## Convenciones del proyecto

La arquitectura y las reglas están en [AGENTS.md](AGENTS.md). Lo más importante:

- **Lógica en `src/domain/`, con tests.** Cálculos, rankings y reglas van ahí como funciones puras (sin React ni storage), con su archivo `*.test.ts`. Los componentes solo muestran.
- **Textos en español e inglés.** Nada de texto suelto en los componentes: agrégalo en `src/i18n/messages/es.ts` y `en.ts`.
- **Estilos desde el tema.** Usa `useTheme()` y los componentes de `@/components/ui/*`; no uses colores hex ni tamaños de fuente sueltos en las pantallas (ver `src/theme/README.md`).
- **PRs pequeños y enfocados.** Un PR por cambio. Es más fácil de revisar y se aprueba más rápido.
- **Commits** con el formato `tipo(área): descripción`, por ejemplo `fix(ranking): ...` o `feat(app): ...`.

## Revisión

El mantenedor revisa los PRs cuando puede; es un proyecto personal, así que puede tardar unos días. Si tu PR necesita cambios, te dejaremos comentarios. Al contribuir aceptas que tu código se publique bajo la [licencia MIT](LICENSE) del proyecto.
