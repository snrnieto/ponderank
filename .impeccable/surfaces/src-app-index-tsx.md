---
version: 1
slug: "src-app-index-tsx"
primary_target: "src/app/index.tsx"
related_targets: []
---

# Landing (/)

Scope: landing pública de Ponderank, ruta `/` (src/app/index.tsx). Modo: Persuade.

Audiencia y acción: personas comparando una compra (carro, portátil, celular) que hoy usan una hoja de cálculo. Deben entender que el ranking sale de SUS pesos y crear su primera lista (`/list`). Única promesa comercial válida: gratis. Nada de "sin registro", "datos locales", app móvil, testimonios ni métricas.

Prueba disponible: el mecanismo mismo, demostrado con datos de ejemplo etiquetados: tres celulares ficticios (compra que todos conocen; los eléctricos se descartaron por ser nicho).

Momento memorable: mover las pesas y ver la aguja de la balanza cambiar de ganador.

## Direction contract

THESIS: Ponderar es pesar. La página es una balanza de plaza que el visitante opera: pone pesas de bronce sobre los criterios y la aguja roja señala la opción ganadora. Rechaza el hero SaaS con degradado, captura flotante y fila de tarjetas iguales.

OWN-WORLD: hierro esmaltado azul cobalto (#2B3FD6) como campo dominante; esfera de reloj blanca fría (#F6F7FB) con numerales y tinta #14162B; pesas cilíndricas de bronce (#C8962E) apiladas como discos; aguja roja (#E5372A) reservada exclusivamente al veredicto; violeta del logo (#6C56FB) solo en la marca. Display Bricolage Grotesque, texto Atkinson Hyperlegible. Una retícula de 12 columnas para todo.

STORY: el visitante entiende en una frase qué hace la app; prueba «¿qué te importa más?» con + y −, la aguja gira y el ganador cambia; lee el desglose «Y te explica por qué»; ve los 3 pasos; empieza a comparar. Lenguaje de comprador: «qué te importa», «importancia», «nota», nunca «criterio» o «peso».

FIRST VIEWPORT: banda cobalto a sangre. Izquierda (5 col): titular «¿No sabes cuál comprar?» a tamaño máximo, una línea que explica qué hace en palabras de comprador y el CTA «Empezar a comparar» en bronce (copy simplificado a pedido del usuario: la versión metafórica no se entendía). Derecha (7 col): la balanza: esfera semicircular 0–100 con aguja roja sobre el puntaje del líder y una ventanilla bajo la esfera «Te conviene <opción> · NN/100»; debajo, tres columnas de pesas (Precio, Batería, Memoria) con botones para quitar/poner pesas; debajo, el plato con los tres celulares ordenados y su puntaje.

FORM: Balanza de plaza, candidata 5 de 7 de la lista propia, seed key 14139dd3.

Signature interaction: poner/quitar pesas (teclado incluido) recalcula con el motor real (`scoreCriterion`) y la aguja gira con ease-out; un solo barrido de aguja al cargar.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

Unresolved: ninguno.
