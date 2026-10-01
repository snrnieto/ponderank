---
date: 2026-07-24
topic: item-ranking-comparator
---

# Requirements: Item Ranking Comparator

## Summary

Una app personal web y móvil para comparar productos en listas configurables. El usuario define columnas (datos, imagen, categoría, calculadas predefinidas, o criterios de ranking), agrega items por formulario, y la app calcula y ordena el ranking sin fórmulas manuales. Persistencia local en v1, con modelo listo para conectar una base de datos después.

## Problem Frame

Hoy la comparación se hace en hojas de cálculo (ej. vehículos a gasolina): ponderaciones, valores objetivo, columnas derivadas (precio por pasajero, precio por km) y un ranking como suma ponderada de scores por criterio. Escribir esas fórmulas confunde — sobre todo el sentido del criterio (menor mejor vs mayor mejor) y si se divide target÷valor o al revés. Agregar items editando celdas también es frágil. Hace falta el mismo poder de comparación en una app con formulario y reglas explícitas por columna.

---

## Key Decisions

- **Constructor de lista libre, no plantillas.** Flexibilidad primero; plantillas por categoría pueden venir encima después.
- **Cálculos predefinidos con ejemplos, no editor de fórmulas.** Cada tipo de cálculo muestra ejemplos al elegir, para evitar confusiones.
- **Sentido por criterio (menor mejor / mayor mejor).** Resuelve la confusión principal del Excel sin escribir la fórmula.
- **Pesos siempre suman 100%.** Sección dedicada muestra la suma y el faltante/sobrante; no se guarda un esquema inválido.
- **Un dispositivo local en v1.** Sin sync; la estructura de datos debe permitir migrar a DB después sin reescribir el dominio.
- **Web para configurar, móvil para consultar y agregar.** Misma app Expo; priorizar flujos según dispositivo.

---

## Requirements

**Listas e items**

- R1. El usuario puede crear, renombrar y eliminar múltiples listas de comparación (ej. vehículos, computadores, veterinarias).
- R2. Dentro de una lista, el usuario puede crear, editar y eliminar items mediante un formulario basado en el esquema de columnas de esa lista.
- R3. Cada lista puede definir variables globales (ej. precio del galón, km de un trayecto) que alimentan columnas calculadas.

**Esquema de columnas**

- R4. Una lista tiene un esquema de columnas configurable. Tipos de columna de datos: texto, número, imagen, y lista/categoría con opciones definidas por el usuario.
- R5. Columna imagen: el valor puede ser una URL remota o una imagen adjunta referenciada localmente.
- R6. Columnas calculadas usan solo operaciones predefinidas. Al elegir el tipo, la UI muestra ejemplos. Tipos en v1: A÷B, A×B, A+B, A−B, (A÷B)×100, variable global ÷ columna del item, columna del item × variable/parámetro global.
- R7. Una columna calculada puede marcarse como solo informativa (no entra al ranking) o como criterio de ranking.
- R8. El esquema puede editarse con items existentes: columnas nuevas quedan vacías en items viejos; eliminar una columna pide confirmación y borra ese dato.

**Criterios de ranking**

- R9. Cada criterio de ranking tiene: peso, valor objetivo, y sentido (menor mejor o mayor mejor).
- R10. El valor objetivo de un criterio puede ser: mínimo de la columna, máximo, promedio, o un valor custom fijo.
- R11. Score por criterio, menor mejor: si valor ≤ objetivo → 100%; si no → objetivo÷valor (tope 100%).
- R12. Score por criterio, mayor mejor: si valor ≥ objetivo → 100%; si no → valor÷objetivo (tope 100%).
- R13. Ranking total = suma de (score del criterio × peso). Los pesos de todos los criterios de la lista deben sumar exactamente 100%; una sección dedicada muestra la suma actual y el faltante o sobrante.
- R14. Si un item no tiene valor en un criterio, ese criterio aporta 0% al ranking (el item baja en el orden; al ordenar por ese % parcial se ven los ceros).

**Vista, orden y filtros**

- R15. La lista se ordena por defecto por ranking total descendente. El usuario puede ordenar por cualquier columna visible, incluido el % parcial de un criterio cuando esté visible.
- R16. El usuario puede mostrar u ocultar el % parcial de cada criterio además del ranking total.
- R17. Columnas de categoría permiten filtrar (ej. solo híbridos) y limpiar el filtro para ver todos.
- R18. Al activar o cambiar un filtro, la app pregunta cada vez si recalcular objetivos dinámicos y rankings solo con los items visibles, o mantener los valores calculados sobre toda la lista.

**Plataforma y persistencia**

- R19. La app corre en web y móvil (Expo). Configurar listas y columnas es usable en web; consultar, filtrar y agregar items es usable en móvil.
- R20. En v1 los datos se guardan localmente en un solo dispositivo. El modelo de dominio (listas, esquema, variables, items, scores) debe ser desacoplado de la capa de almacenamiento para conectar una DB después sin reescribir la lógica de ranking.

---

## Key Flows

- F1. Crear lista y esquema
  - **Trigger:** Usuario crea una lista nueva.
  - **Steps:** Define nombre; opcionalmente variables globales; agrega columnas (datos / imagen / categoría / calculada / criterio); para criterios fija peso, objetivo y sentido; la sección de pesos debe llegar a 100% antes de usar el ranking.
  - **Outcome:** Lista lista para recibir items.
  - **Covered by:** R1, R3, R4, R6–R13

- F2. Agregar item por formulario
  - **Trigger:** Usuario agrega un item.
  - **Steps:** Completa campos del esquema (texto, número, imagen URL o adjunto, categoría); columnas calculadas y ranking se recalculan al guardar.
  - **Outcome:** Item aparece ordenado según el criterio de orden actual.
  - **Covered by:** R2, R5, R14–R15

- F3. Filtrar y decidir recálculo
  - **Trigger:** Usuario aplica o cambia un filtro de categoría.
  - **Steps:** App pregunta: ¿recalcular objetivos/ranking con solo visibles, o mantener valores de toda la lista?; usuario elige; vista se actualiza.
  - **Outcome:** Vista filtrada con comportamiento de ranking explícito.
  - **Covered by:** R17, R18

- F4. Explorar comparación
  - **Trigger:** Usuario revisa la lista.
  - **Steps:** Ordena por ranking o por otra columna; opcionalmente muestra % parciales; ajusta variables globales y ve impacto en columnas derivadas y ranking.
  - **Outcome:** Comparación clara sin editar fórmulas.
  - **Covered by:** R3, R15, R16

---

## Acceptance Examples

- AE1. Menor mejor (precio por km)
  - **Covers:** R11, R9
  - **Given:** Criterio "Precio por km", sentido menor mejor, objetivo custom 250, peso 50%.
  - **When:** Item A = 250, item B = 500.
  - **Then:** A score 100% en el criterio; B score 50%.

- AE2. Mayor mejor (caballos de fuerza)
  - **Covers:** R12, R9
  - **Given:** Criterio "HP", sentido mayor mejor, objetivo custom 150, peso 20%.
  - **When:** Item A = 200, item B = 100.
  - **Then:** A score 100%; B score ≈ 66.7% (100÷150).

- AE3. Objetivo dinámico mínimo
  - **Covers:** R10, R11
  - **Given:** Criterio "Precio por pasajero", objetivo = mínimo de la columna, sentido menor mejor.
  - **When:** Hay items con 13.6M y 15.5M en esa columna.
  - **Then:** El de 13.6M obtiene 100% en el criterio; el de 15.5M obtiene 13.6M÷15.5M.

- AE4. Pesos deben sumar 100%
  - **Covers:** R13
  - **Given:** Tres criterios con pesos 20%, 50%, 20% (suma 90%).
  - **When:** Usuario intenta guardar o usar el ranking.
  - **Then:** La sección de pesos muestra faltante 10% y no se acepta el esquema hasta completar 100%.

- AE5. Valor faltante = 0% en el criterio
  - **Covers:** R14, R15
  - **Given:** Un item sin valor en "0-100".
  - **When:** Se calcula ranking y se ordena por % de ese criterio.
  - **Then:** Ese criterio aporta 0% al total; al ordenar por ese % el item aparece entre los ceros.

- AE6. Filtro pregunta recálculo
  - **Covers:** R18
  - **Given:** Lista con gasolina e híbridos; objetivo dinámico MIN en una columna.
  - **When:** Usuario filtra solo híbridos.
  - **Then:** App pregunta si recalcular con híbridos visibles o mantener valores de toda la lista; la elección aplica a esa acción de filtro.

- AE7. Columna calculada informativa
  - **Covers:** R6, R7
  - **Given:** Variable global "km Piendamo" = 240; columna "Precio por km"; columna informativa "Costo Piendamo" = Precio por km × km Piendamo.
  - **When:** Precio por km del item = 330.
  - **Then:** Costo Piendamo = 79200 y no aporta peso al ranking.

---

## Success Criteria

- El usuario puede recrear la lógica de la hoja "Vehiculos usados" (ponderaciones, objetivos, precio/km desde precio galón, precio/pasajero, ranking con tope 100%) sin escribir una fórmula.
- Agregar un item nuevo toma un formulario, no edición de celdas.
- Cambiar el sentido de un criterio (menor/mayor mejor) es una opción explícita, no una fórmula distinta.
- Los datos viven localmente hoy y el dominio de ranking no depende de la capa de almacenamiento concreta.

---

## Scope Boundaries

**In scope (v1)**

- Múltiples listas, esquema configurable, items por formulario, ranking automático, filtros por categoría con pregunta de recálculo, orden por columnas, % parciales opcionales, imagen URL o local, variables globales, persistencia local.

**Deferred for later**

- Plantillas por categoría (vehículos, PCs, veterinarias).
- Sync entre web y móvil / multi-dispositivo.
- Exportar/importar listas.
- Conexión a base de datos remota (el diseño debe anticiparla).
- Importar el Excel existente tal cual.
- Editor de fórmulas libre.

**Outside this product's identity**

- Colaboración multi-usuario o listas compartidas en tiempo real.
- Marketplace o catálogo externo de productos.

---

## Dependencies / Assumptions

- El proyecto base es Expo SDK 57 (web + móvil) ya creado en el repo.
- v1 asume un solo dispositivo de uso real; no hay sync.
- Las imágenes adjuntas usan almacenamiento local del dispositivo; el comportamiento exacto en web vs móvil se resuelve en planning.
- La referencia de comportamiento del ranking proviene del Excel de comparación de vehículos (objetivos, pesos, score con tope 100%).

---

## Outstanding Questions

**Deferred to Planning**

- Cómo modelar y persistir localmente (y el adaptador futuro a DB) sin filtrar el dominio.
- UX concreta de la sección de pesos al 100% y del prompt de recálculo al filtrar.
- Manejo de división por cero y de promedios/mínimos/máximos cuando hay celdas vacías en objetivos dinámicos (vacíos no deben distorsionar MIN/MAX/AVG).
- Límites prácticos de imágenes locales (tamaño, permisos) en web y móvil.

---

## Sources / Research

- Hoja de cálculo de referencia (vehículos usados), tabla con columnas Imagen, Nombre, Tipo, Precio, Puestos, Precio por pasajero, Precio por km, 0-100, Ranking, y columnas informativas derivadas (Piendamo, Día normal).
- Fórmula de ranking observada: `min(1, target/valor) × peso` sumado por criterios (todos "menor mejor" en esa hoja); pesos en fila 4; objetivos en fila 5 (uno dinámico vía MIN de columna).
- Variable global: precio galón alimenta precio por km como `precio_galon / consumo_km_por_galon` (el consumo estaba incrustado en fórmulas; en la app debe ser campo explícito del item o columna).
