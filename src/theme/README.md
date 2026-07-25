# Design system

All visual tokens live in **`tokens.ts`**. Change a value there and every primitive (`Button`, `Text`, `TextInput`, `Surface`, `Badge`, `GradientCard`) picks it up.

## Common edits

| Want to change… | Edit |
|-----------------|------|
| Primary / brand accent | `tokens.colors.*.primary` (+ `gradients.brand`) |
| Secondary accent | `tokens.colors.*.secondary` |
| Soft badge backgrounds | `tokens.colors.*.successSoft` / `dangerSoft` / etc. |
| Card shadows | `tokens.elevation.sm\|md\|lg` |
| Corner radius | `tokens.radius` |
| Font sizes | `tokens.typography.sizes` (includes `display`) |

## Rules

- Screens under `src/app/**` must not use raw hex or magic `fontSize` numbers.
- Import UI from `@/components/ui/*` and theme from `@/theme`.
