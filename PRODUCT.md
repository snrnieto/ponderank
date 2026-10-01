# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Personas comunes decidiendo una compra: qué carro, computador, celular, servicio o lugar elegir entre varias opciones. Hoy resuelven esa decisión con una hoja de cálculo propia (columnas, pesos y fórmulas armadas a mano) o comparando reseñas. Hablan español; la interfaz las tutea.

## Product Purpose

Ponderank reemplaza esa hoja de cálculo. La persona crea una lista de comparación de cualquier categoría, define sus propias columnas y cuánto pesa cada criterio, agrega las opciones y la app calcula un ranking ponderado de cuál es la mejor para ella. El éxito es que la persona decida con confianza y entienda por qué ganó la opción ganadora.

## Positioning

El ranking sale de los criterios y pesos de la propia persona, no de una reseña, un puntaje editorial ni un algoritmo genérico. Sirve para cualquier categoría porque el esquema lo define el usuario, y explica el resultado (dónde gana y dónde pierde cada opción del top 3).

## Operating Context

- Se usa sobre todo en el navegador (web primero). Existe una base Expo para iOS/Android, pero la app móvil no está publicada ni tiene fecha.
- Flujo: crear lista → definir esquema (columnas de texto, número, imagen, categoría y cálculo; activar "usar en el ranking" con peso, sentido y objetivo) → agregar opciones a mano o en masa pegando un JSON generado con una IA externa a partir de una plantilla que da la app → ver el ranking, filtrar por categoría y abrir la explicación del top 3.
- Origen: una hoja de cálculo real de comparación de vehículos usados.

## Capabilities and Constraints

- Criterios ponderados: los pesos deben sumar 100%. Cada criterio da 0–100 puntos según un objetivo: el menor de la lista, el mayor, el promedio o un valor fijo; "menor es mejor" o "mayor es mejor".
- Columnas calculadas con operaciones predefinidas (sin editor de fórmulas, por decisión de producto) y variables globales por lista.
- Carga masiva con modos agregar, actualizar por nombre o reemplazar todo; eliminación masiva de items.
- Filtro por categoría con recálculo del ranking contra toda la lista o solo las opciones visibles.
- Fase 1: todo se guarda localmente en el dispositivo. Está planeado migrar a servidor (Supabase) con cuentas, por eso "sin registro" o "tus datos se quedan en tu dispositivo" NO son promesas públicas válidas.
- Gratis por ahora. No hay planes de pago definidos.
- Abierto (sin decidir): modelo de negocio, fecha de la versión con servidor, publicación móvil.

## Brand Commitments

- Nombre: **Ponderank** (de "ponderar" + "rank").
- Logo: podio de tres barras con una estrella sobre la barra central (`assets/images/logo-source.png`, variantes en `assets/images/`).
- Idioma español, tuteo, tono directo.

## Evidence on Hand

- No hay testimonios, clientes, métricas de uso ni prensa. No inventarlos.
- Datos reales disponibles para ejemplos: la lista demo de vehículos usados (`src/data/demo-vehicles-seed.ts`) y comparaciones reales hechas por el creador (vehículos eléctricos, modelos de IA).
- Capturas reales de la app pueden generarse desde el entorno de desarrollo.

## Product Principles

1. Tus criterios, tu decisión: el usuario define qué importa y cuánto; la app nunca impone un puntaje propio.
2. Explicar antes que impresionar: cada número del ranking debe poder rastrearse a un criterio y un peso.
3. Más simple que la hoja de cálculo que reemplaza: sin fórmulas que escribir, con ayudas y ejemplos en cada paso.
4. Honestidad en las promesas: solo afirmar lo que el producto hace hoy.
