# Design system

All visual tokens live in **`tokens.ts`**. Change a value there and every primitive (`Button`, `Text`, `TextInput`, `Surface`) picks it up.

## Common edits

| Want to change… | Edit |
|-----------------|------|
| Primary button color | `tokens.colors.light.primary` and `.dark.primary` |
| Body text color | `tokens.colors.*.text` |
| Spacing scale | `tokens.spacing` |
| Corner radius | `tokens.radius` |
| Font sizes | `tokens.typography.sizes` |

## Rules

- Screens under `src/app/**` must not use raw hex or magic `fontSize` numbers.
- Import UI from `@/components/ui/*` and theme from `@/theme`.
