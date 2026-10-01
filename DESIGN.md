---
name: Ponderank
description: Compara opciones con lo que a ti te importa; una balanza de plaza que te dice cuál te conviene y por qué.
colors:
  cobalt-enamel: "#2B3FD6"
  cobalt-deep: "#1F2FA8"
  enamel-white: "#FFFFFF"
  enamel-mist: "#C9D0FF"
  dial-white: "#F6F7FB"
  dial-line: "#D8DBEA"
  ink: "#14162B"
  ink-soft: "#4A4E6B"
  brass: "#C8962E"
  brass-light: "#E2B85A"
  brass-deep: "#8E6516"
  needle-red: "#E5372A"
  logo-violet: "#6C56FB"
typography:
  display:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "68px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-1.5px"
  display-compact:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "42px"
    fontWeight: 800
    lineHeight: 1.02
    letterSpacing: "-1.5px"
  headline:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "40px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.8px"
  headline-compact:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.8px"
  title:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.25
  lead:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: "Atkinson Hyperlegible, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: 1.3
  button:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.2
  figure:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    fontFeature: "\"tnum\""
  verdict:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 800
    fontFeature: "\"tnum\""
  numeral:
    fontFamily: "Bricolage Grotesque, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 800
    lineHeight: 1.1
    fontFeature: "\"tnum\""
rounded:
  ticket: "4px"
  window: "8px"
  plate: "10px"
  button: "14px"
  round: "9999px"
spacing:
  gutter-compact: "20px"
  gutter-wide: "48px"
  stack-sm: "12px"
  stack-md: "18px"
  stack-lg: "24px"
  split-compact: "44px"
  split-wide: "72px"
  section-compact: "56px"
  section-wide: "96px"
  content-max: "1180px"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    typography: "{typography.button}"
    rounded: "{rounded.button}"
    padding: "16px 26px"
  button-primary-hover:
    backgroundColor: "{colors.brass-light}"
    textColor: "{colors.ink}"
  button-primary-pressed:
    backgroundColor: "{colors.brass-deep}"
    textColor: "{colors.ink}"
  link-on-enamel:
    textColor: "{colors.enamel-white}"
    typography: "{typography.label}"
  weight-button:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.ink}"
    rounded: "{rounded.round}"
    size: "34px"
  verdict-window:
    backgroundColor: "{colors.dial-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.window}"
    padding: "8px 16px"
  reading-plate:
    backgroundColor: "{colors.dial-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.plate}"
    padding: "4px 16px"
  weigh-ticket:
    backgroundColor: "{colors.dial-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.ticket}"
    padding: "20px 22px"
---

# Design System: Ponderank

## Overview

**Creative North Star: "Balanza de plaza"**

Ponderar es pesar. Ponderank se ve como la balanza de un mercado de plaza: hierro esmaltado azul cobalto como campo dominante, una esfera de reloj blanca fría con numerales en tinta, pesas cilíndricas de bronce apiladas como discos, y una aguja roja que solo existe para señalar al ganador. La persona no mira una gráfica: opera un instrumento. Pone y quita pesas sobre lo que le importa y la aguja gira hacia la opción que le conviene.

El sistema es plano, macizo y legible. No hay degradados, ni brillos, ni sombras: la profundidad viene de capas de material (esmalte cobalto, esmalte más oscuro, placa blanca encima) y de bordes de bronce. La tipografía habla en dos registros: Bricolage Grotesque, ancha y apretada, da la voz y los números; Atkinson Hyperlegible se encarga de todo lo que se lee de corrido. Las cifras siempre van en numerales tabulares para que las columnas de puntaje se alineen como en un tique de báscula.

Se rechaza explícitamente el hero SaaS con degradado violeta a azul, la captura flotante y la fila de tarjetas iguales. La voz es de comprador, no de analista: «qué te importa», «importancia», «nota», «suma»; nunca «criterio», «peso» ni «ranking ponderado» en el texto visible.

**Estado de adopción.** Este mundo nació en la landing pública (`src/app/index.tsx`) y es el sistema visual de todo el producto. Landing y app comparten una sola paleta (`palette` en `src/theme/tokens.ts`): los temas claro/oscuro de la app (`tokens.colors`) y `tokens.landing` toman sus valores de ahí, y las fuentes (Bricolage Grotesque / Atkinson Hyperlegible) se definen una sola vez. El tema violeta → azul anterior se eliminó.

**Key Characteristics:**
- Campo cobalto a sangre en las bandas de apertura y cierre; placas blanco esfera encima para todo lo que se lee como dato.
- Bronce para lo que se toca: el botón principal, los botones de pesa y las pesas mismas.
- Rojo de aguja exclusivamente para el veredicto: la aguja y la nota del ganador.
- Plano: sin sombras, sin degradados; capas tonales y bordes de material.
- Numerales tabulares Bricolage en toda cifra comparable.
- Lenguaje de comprador en español, tuteando.

## Colors

Una paleta de instrumento de mercado: un campo cobalto saturado, blancos fríos de esfera, tinta casi negra azulada, bronce y un único rojo de señal.

### Primary
- **Cobalto Esmaltado** (cobalt-enamel): el campo dominante. Fondo de la banda de primera vista y de la banda de cierre, color de selección de texto. En superficies de trabajo es el color primario de la interfaz.
- **Cobalto Hondo** (cobalt-deep): el esmalte en sombra. Carcasa de la ventanilla bajo la esfera y filete divisor del pie sobre cobalto. Es la segunda capa del material, no un estado hover.

### Secondary
- **Bronce de Pesa** (brass): todo lo que se acciona. Relleno del botón principal, botones redondos + / −, discos de pesa, barra de la balanza y aro de la esfera.
- **Bronce Pulido** (brass-light): estado hover del bronce y del subrayado del enlace sobre cobalto.
- **Bronce Viejo** (brass-deep): estado presionado del bronce; también los numerales de los pasos sobre blanco esfera, donde el bronce normal no alcanzaría contraste.

### Tertiary
- **Rojo de Aguja** (needle-red): la aguja de la esfera y la nota del ganador (ventanilla, primera fila de la lectura, «Nota final» del tique). Nada más.

### Neutral
- **Blanco Esmalte** (enamel-white): texto sobre cobalto (titulares, lead, etiquetas, enlace).
- **Niebla Cobalto** (enamel-mist): texto secundario y letra chica sobre cobalto (aclaraciones, pie).
- **Blanco Esfera** (dial-white): fondo de página fuera de las bandas cobalto y fondo de toda placa de dato (esfera, ventanilla, lectura, tique).
- **Línea de Esfera** (dial-line): filetes de 1px entre filas sobre blanco esfera.
- **Tinta** (ink): texto principal sobre blanco esfera y sobre bronce; marcas mayores de la esfera; regla de 2px que abre secciones y cierra el tique.
- **Tinta Suave** (ink-soft): texto secundario sobre blanco esfera, encabezados de columna del tique, marcas menores, borde punteado del tique.
- **Violeta de Logo** (logo-violet): solo vive dentro del logo de Ponderank. No se usa como color de interfaz.

### Named Rules
**The Needle Rule.** El rojo de aguja señala al ganador y a nada más. Nunca errores, nunca alertas, nunca decoración, nunca un segundo elemento en la misma vista que no sea el veredicto. Los errores de la app usan otro rojo distinto.

**The Brass Touch Rule.** El bronce significa «esto se puede tocar o pesar». Un bloque de bronce que no se acciona ni representa una pesa miente sobre la interfaz.

**The Logo-Only Violet Rule.** El violeta pertenece al logo. Ni botones, ni fondos, ni degradados violeta → azul: ese es exactamente el tema que este sistema reemplaza.

## Typography

**Display Font:** Bricolage Grotesque (con system-ui, sans-serif), pesos 500–800, eje opsz 12–96, cargada desde Google Fonts en `+html.tsx`.
**Body Font:** Atkinson Hyperlegible (con system-ui, sans-serif), 400 y 700.

**Character:** Bricolage es la voz del vendedor de plaza: ancha, apretada, segura, buena para titulares y para cifras grandes. Atkinson es la letra de la etiqueta de precio: diseñada para leerse sin esfuerzo, carga todas las frases.

### Hierarchy
- **Display** (800, 68px / 42px angosto, 1.02, -1.5px): titular de primera vista y del cierre. Uno por banda cobalto.
- **Headline** (700, 40px / 30px angosto, 1.08, -0.8px): título de sección sobre blanco esfera.
- **Title** (700, 20px, 1.25): nombre de marca en la cabecera, nombre de la opción en el tique.
- **Lead** (400, 19px, 1.55): párrafos explicativos y pasos; ancho máximo 460–540px.
- **Body** (400, 16px, 1.6): instrucciones cortas dentro del instrumento.
- **Small** (400, 13px, 1.5): aclaraciones, encabezados de columna, pie.
- **Label** (700 Bricolage, 16px, 1.3): nombres de opciones y de lo que importa, enlace.
- **Figure / Verdict / Numeral** (700–800 Bricolage, 16 / 20 / 34px, numerales tabulares): cifras de tabla, nota del ganador, números de paso.

### Named Rules
**The Tabular Figures Rule.** Toda cifra que se compara con otra (notas, porcentajes, precios, sumas) va en Bricolage con numerales tabulares y alineada a la derecha. Formato es-CO, máximo un decimal.

**The Buyer Voice Rule.** El texto visible dice «qué te importa», «importancia», «nota», «suma», «te conviene». Nunca «criterio», «peso», «score» ni «ranking ponderado». Si una frase necesita explicar la metáfora, la frase está mal.

## Layout

Una sola columna de contenido centrada, máximo 1180px, con gutter de 48px en pantallas anchas y 20px en angostas. El corte principal está en 960px: por encima, las bandas se dividen en dos columnas lado a lado (texto a la izquierda con flex 5, instrumento a la derecha con flex 6 y máximo 520px; secciones de texto y tique a mitades); por debajo, todo se apila. Bajo 480px el tique pasa de tabla a filas de dos líneas.

El ritmo vertical es amplio y desigual a propósito: secciones de 96px arriba y abajo en ancho (56px en angosto), separación entre columnas de 72px (44px apilado), pilas internas de 12, 18 y 24px. Las bandas cobalto van a sangre; dentro, el contenido respeta la columna. Las secciones sobre blanco esfera se abren con una regla de tinta de 2px en lugar de un fondo distinto.

El contrato de dirección pedía una retícula de 12 columnas; la construcción la resolvió como divisiones flex 5:6 y 1:1 dentro de la columna máxima. La construcción manda.

## Elevation & Depth

Sistema plano sin sombras. La profundidad se construye con capas de material: cobalto, cobalto hondo encima (la carcasa de la ventanilla) y placas blanco esfera encima de eso. Los bordes son de bronce (aro de 6px de la esfera, eje central con aro de 4px) o de tinta (reglas de 2px, borde punteado del tique). Las sombras de la app (`elevation`) son neutras de tinta y suaves; en las pantallas de trabajo se prefieren bordes de 1px sobre sombras.

### Named Rules
**The Enamel Layer Rule.** Para separar un plano de otro se cambia de material (cobalto → cobalto hondo → blanco esfera), nunca se agrega sombra.

## Shapes

Formas de instrumento: rectángulos de esquina corta, discos y semicírculos. La esfera es un semicírculo recortado con aro de bronce; las pesas son píldoras de 10px de alto apiladas de mayor a menor hacia arriba sobre una barra de bronce de 6px; los botones de pesa son círculos perfectos de 34px. Las esquinas son modestas y varían según el objeto: 4px el tique de papel, 8px la ventanilla del veredicto, 10px la placa de lectura, 14px el botón principal y el fondo de la carcasa. El tique de báscula lleva bordes punteados de 2px arriba y abajo, como papel cortado.

## Components

### Buttons
Bronce macizo, sin borde, sin sombra: se ven como una pieza que se aprieta.
- **Shape:** esquinas de 14px, ancho según contenido (se alinea al inicio, no ocupa toda la fila).
- **Primary:** relleno bronce, texto tinta en Bricolage 700 18px, 16px × 26px de relleno. Un CTA por banda.
- **Hover / Pressed:** hover a bronce pulido, presionado a bronce viejo. Sin transform.
- **Link on enamel:** texto blanco esmalte en label 700 subrayado con niebla cobalto; en hover el subrayado pasa a bronce pulido.
- **Weight button:** círculo bronce de 34px con icono + / − en tinta (icono de sistema, 18px, bold); deshabilitado al 35% de opacidad. Siempre en pares quitar / poner, con etiqueta accesible «Darle más / menos importancia a …».

### Cards / Containers
No hay tarjetas genéricas. Los contenedores son placas del instrumento:
- **Reading plate:** blanco esfera, esquinas de 10px, filas de 9px de alto separadas por filetes de línea de esfera; primera fila del ganador con su nota en rojo de aguja.
- **Verdict window:** placa blanco esfera de esquinas de 8px dentro de una carcasa cobalto hondo de 14px en las esquinas de abajo; «Te conviene <opción>» en label y la nota en verdict rojo. Región viva para lectores de pantalla.

### Balance Dial (signature)
Semicírculo 0–100 de hasta 300px, aro de bronce de 6px, 21 marcas (mayores cada 25 en tinta de 16px, menores en tinta suave de 8px), numerales 0/25/50/75/100 de 13px, aguja roja de 4px y eje tinta con aro de bronce. La aguja gira 900ms con ease-out exponencial a cada cambio y una sola vez al cargar; con movimiento reducido salta directo.

### Weight Stack (signature)
Tres columnas de pesas sobre una barra de bronce común. Cada pesa es una píldora de bronce de 10px; la de abajo mide 58px y cada una de arriba 6px menos. Debajo, el nombre de lo que importa con su porcentaje («Precio · 50%») y el par de botones de pesa. Máximo 5 pesas por columna.

### Weigh Ticket (signature)
Tique de báscula sobre blanco esfera, esquinas de 4px, bordes punteados de tinta suave arriba y abajo, hasta 540px. Columnas «Qué te importa · Dato · Nota · Importancia · Suma» en small tinta suave; filas en label y figure; cierre con regla de tinta de 2px y «Nota final» con la cifra en verdict rojo. En angosto cada fila se parte en nombre + dato y una línea «Nota × importancia = suma».

### Operate surfaces
En las pantallas de trabajo de la app el mundo se expresa con contención: cobalto como color primario de la interfaz (cabeceras, selección, estados activos), bronce solo en las acciones clave (crear, guardar, agregar opción), rojo de aguja solo en la opción ganadora y su nota. Blanco esfera y tinta cargan la densidad de tablas y formularios. Sin bandas a sangre en cada pantalla, sin esfera decorativa donde no hay un veredicto que mostrar.

Tokens de la app: `primary` (cobalto), `brandSurface` (bloque de veredicto: cobalto en claro, cobalto hondo en oscuro), `accent`/`onAccent` (bronce y su texto), `verdict` (rojo de aguja, solo el ganador), `danger` (rojo oscuro, solo acciones destructivas). Botones rectangulares para acciones; píldoras solo para chips de selección y filtros; objetivo táctil mínimo 44px (`components.touchTarget`).

## Do's and Don'ts

### Do:
- **Do** usar cobalto esmaltado como campo de las bandas de apertura y cierre, y como primario de la interfaz en las pantallas de trabajo.
- **Do** reservar el bronce para lo que se acciona o se pesa: CTA, botones + / −, pesas.
- **Do** mostrar toda cifra comparable en Bricolage con numerales tabulares, alineada a la derecha, formato es-CO.
- **Do** separar planos cambiando de material (cobalto, cobalto hondo, blanco esfera) y abrir secciones con una regla de tinta de 2px.
- **Do** escribir en lenguaje de comprador: «qué te importa», «importancia», «nota», «suma», «te conviene».
- **Do** respetar el movimiento reducido: la aguja salta en lugar de girar.
- **Do** asegurar que el indicador de foco alcance 3:1 contra el fondo donde aparece, tanto sobre cobalto como sobre blanco esfera.

### Don't:
- **Don't** usar el rojo de aguja para errores, alertas, badges ni decoración; es el veredicto y nada más.
- **Don't** usar el violeta del logo fuera del logo, ni volver al degradado violeta → azul.
- **Don't** agregar sombras ni brillos a placas o botones; el sistema es plano.
- **Don't** construir un hero SaaS con degradado, captura flotante y fila de tarjetas iguales.
- **Don't** escribir «criterio», «peso», «score» ni «ranking ponderado» en el texto visible.
- **Don't** pintar de bronce algo que no se puede tocar ni pesar.
