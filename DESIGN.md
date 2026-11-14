---
name: Vacaciones · abril 2027
description: Playa SVG del día al atardecer y propuestas breves para elegir un viaje entre cinco.
colors:
  paper: "#fff8eb"
  ink: "#183e3b"
  muted: "#526660"
  green: "#1a5e52"
  green-light: "#e5eee0"
  sand: "#f1d49e"
  line: "#dcdcc9"
  white: "#fffdf6"
  red: "#993f34"
  yellow: "#80511c"
  sea-horizon: "#3d999f"
  sea-middle: "#69b9b2"
  sea-shore: "#b4d6c2"
typography:
  display:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "clamp(70px, 7.4vw, 104px)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "Fraunces, Georgia, serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.035em"
  title:
    fontFamily: "system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 700
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 650
rounded:
  control: "8px"
  card: "14px"
  main: "16px"
  destinations: "18px"
spacing:
  card-gap: "20px"
  card-inset: "25px"
  destinations-inset: "36px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
  navigation:
    textColor: "{colors.ink}"
    padding: "12px 0"
  proposal:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-inset}"
  vote:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "10px 4px"
  favorite:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "10px"
---

# Design System: Vacaciones · abril 2027

## Overview

La dirección confirmada es una playa SVG continua: cielo abierto, sol, mar, arena y palmera. El desplazamiento transforma el día en atardecer; el paisaje ocupa el fondo completo y la portada lo deja respirar. Es una elección visual del usuario, sin marca nueva: el título descriptivo provisional sigue siendo «Vacaciones · abril 2027».

Fraunces aporta títulos amplios y una cursiva en «playa». Las superficies opacas de crema protegen los datos durante todo el recorrido. Las tarjetas concentran destino, precio, fechas y voto; Investigación reúne condiciones, fuentes e informe histórico. La identidad por confianza, el máximo de cinco participantes y los votos compartidos en D1 conservan su funcionamiento.

**Key Characteristics:**
- Paisaje SVG continuo con atardecer reversible al desplazarse.
- Títulos Fraunces y controles de sistema.
- Tarjetas breves y opacas sobre el paisaje.
- Voto, favorita y evidencia expresados con texto y estado accesible.

## Colors

Verde profundo para acciones y tinta, crema para lectura, turquesas para el mar y arena cálida para el paisaje. Los valores del frontmatter son los tokens implementados, sin conversiones de color.

### Primary
- **Verde profundo (`green`):** botones, enlaces y controles de favorita.
- **Verde claro (`green-light`):** estados contextuales, tablas y hover secundario.

### Neutral
- **Crema (`paper`) y blanco cálido (`white`):** paneles de lectura y tarjetas/campos respectivamente.
- **Tinta (`ink`) y tinta atenuada (`muted`):** contenido y metadatos.
- **Arena (`sand`) y línea (`line`):** selección de texto y separadores.

### Semantic
- **Rojo terroso (`red`) y ocre (`yellow`):** error y condiciones que requieren revisión. Los tres votos conservan sus propios fondos y bordes semánticos además del texto.

### Landscape
`sea-horizon`, `sea-middle` y `sea-shore` son los valores iniciales de las tres paradas del mar. JavaScript los interpola durante el scroll; la definición SVG de cielo diurno, cielo de atardecer y arena permanece en `public/index.html`. No trasladar los colores del paisaje a estados de los formularios.

## Typography

Fraunces, peso 600, normal y cursiva, se sirve desde `/fonts/fraunces.ttf` y `/fonts/fraunces-italic.ttf`; la licencia SIL OFL 1.1 está en `/fonts/OFL.txt`. Georgia es alternativa de carga, no la fuente principal. Cuerpo y controles usan la pila de sistema.

La portada usa el rol display; a 1240px o menos pasa a `clamp(66px,8vw,96px)`, a 900px o menos a 76px y a 700px o menos a `clamp(54px,12.5vw,82px)`. El h1 de otras vistas usa `clamp(38px,5vw,64px)`, línea 1.08. Los destinos usan 37px, 32px hasta 900px y 35px en móvil; la cabecera del listado usa 38/32/29px. Los precios usan 29/25/29px, peso 700 y cifras tabulares. Metadatos y controles compactos usan principalmente 10–13px; los títulos h3, 17px. El texto de Investigación se limita a 75ch y el apoyo introductorio a 65ch.

## Layout

Cabecera de hasta 1280px; navegación de hasta 1192px; contenido, pie y paneles de hasta 1120px. El contenido habitual tiene 42px de relleno y margen superior de 46px; Propuestas libera ese fondo y relleno para mostrar el paisaje. La portada ocupa al menos `calc(100svh - 133px)`, con título y acción a la izquierda; su relleno superior es 9vh, 10vh hasta 900px, 9vh en móvil y 12vh desde 1600px.

El listado es un panel crema de 36px de relleno con dos columnas iguales, gap 20px y tarjetas con 25px. Hasta 1240px hay márgenes de 40px. Hasta 900px el panel usa 25px, las tarjetas 20px y el gap 14px. Hasta 700px los márgenes son 16px, el listado usa 25px 16px, las tarjetas 21px 18px y una columna con gap 16px. La barra de filtros se apila y conserva dos selects en columnas; los tres votos siguen en una fila de columnas iguales. Navegación y tablas permiten scroll horizontal. El tramo libre final mide 68svh, mínimo 320px.

## Elevation & Depth

El paisaje fijo crea profundidad por capas SVG. Paneles y tarjetas son opacos, con bordes suaves y sin sombras. Sólo el toast usa `0 8px 28px #193c3b30`; queda fijo con z-index 20. La escena tiene z-index −1, no captura eventos y está fuera del árbol accesible.

El scroll pasivo agenda como máximo una actualización por frame mediante requestAnimationFrame. El progreso normalizado del documento controla `--dusk` (0–1), `--sun-drop` (0–330px), `--stars` (entra desde 0.65), `--reflection` (1–0.55) y las tres paradas del mar. La animación se revierte al subir y se recalcula al cambiar el tamaño o el contenido. Con movimiento reducido, t queda fijo en 0.24 y CSS desactiva transición, animación y scroll suave. No hay secuestro del scroll ni animaciones de entrada.

## Shapes

El SVG usa un viewBox de 1600 × 1000 y `xMidYMid slice`: horizonte a y=583, sol en (1080,330) con radio 100, costa ondulada y palmera a la derecha. Son formas decorativas implementadas en SVG por pedido explícito. En móvil el SVG mide 170% de ancho y se desplaza −27%; la palmera se desplaza 240px y las aves se ocultan.

Controles de 8px de radio, tarjetas de 14px, contenido habitual de 16px y panel de destinos de 18px (14px en móvil). El pie usa 12px, el toast 10px y la leyenda del paisaje 6px. Los iconos de controles son SVG lineales de 18px, normalmente con trazo 1.8; los votos reducen ese tamaño para conservar el texto.

## Components

### Buttons
Primario verde profundo, texto blanco cálido, 13px/650, relleno 12px 18px y altura mínima 44px; hover #12483e. Secundario transparente con borde #8baba0 y hover verde claro. Deshabilitado: opacidad 0.48. Los botones de texto son subrayados, sin caja.

### Cards / Containers
Destino y hotel encabezan cada tarjeta; favorita arriba a la derecha, datos de viaje y salida, precio tabular y distinción de evidencia, tres votos, recuento, comparación y enlace de detalles. Los comentarios usan details/summary dentro de la tarjeta. No llevan fotografías ni sombras. Investigación usa secciones desplegables para inclusiones, extras, vuelos, equipaje, clima y fuentes.

### Inputs / Fields
Fondo blanco cálido, borde #aabbb3, relleno 11px 12px y altura mínima 44px. Etiqueta visible; los filtros tienen etiqueta accesible. Textareas permiten resize vertical. Errores junto al formulario en rojo terroso.

### Selector de participante
Etiqueta visible «¿Quién sos?» y select nativo permanente en la cabecera, con Vane, Ro, Charles, Rubio y Chino. Altura mínima 44px; 160px de ancho mínimo (145px en móvil). La elección se recuerda en el navegador, sin alta manual.

### Navigation
Texto de 13px (12px en móvil), gap 30px (24px en móvil). Activo con peso 750, tinta y línea inferior de 2px; hover subrayado. Se mantiene en flujo y se desplaza horizontalmente si hace falta.

### Votos y favorita
Votos con `aria-pressed`, texto e icono. Seleccionados: sí #d9ead9/#54865b/#204f2c, puede ser #f6e5bd/#bd964c/#674715, no #f7e0d9/#bd8271/#813e32 (fondo/borde/texto). Favorita es una estrella con etiqueta accesible y estado pulsado; seleccionada usa #f6deb1, borde #ba8d46 y estrella rellena #b57b2c. Los votos de revisiones anteriores se identifican por texto, sin contarlos como vigentes.

### Focus y avisos
Contorno de foco #a85223 de 3px, separado 4px, en botones, enlaces, campos y summary. El toast tiene role=status y aria-live=polite; conexión y errores tienen texto visible. Los controles principales conservan altura mínima de 44px; la acción Comparar usa 40px en móvil según el CSS actual.


### Vuelos separados
La navegación del panel incorpora Paquetes / Solo vuelos con recuento y el mismo lenguaje de pestañas subrayadas. Filtro de origen para vuelos; filtro de comidas para paquetes. Las tarjetas conservan el sistema existente y muestran moneda explícita, total para cinco, duración aérea y llegada +1 cuando corresponde. Condiciones y matriz completa se consultan en Investigación.

## Do's and Don'ts

### Do:
- **Do** conservar el paisaje continuo y el cambio de luz ligado al desplazamiento natural.
- **Do** mantener opacas las superficies que contienen datos.
- **Do** conservar la distinción entre consulta para cinco y promoción base doble.
- **Do** acompañar selección, revisión de votos y errores con texto y foco visible.
- **Do** respetar la escena estática para movimiento reducido.

### Don't:
- **Don't** inventar una marca o restaurar el nombre rechazado.
- **Don't** devolver condiciones extensas a las tarjetas; mantenerlas en Investigación.
- **Don't** añadir sombras a las tarjetas ni animaciones de entrada que oculten contenido.
- **Don't** convertir la selección de nombre por confianza en una afirmación de autenticación.

## Personajes del grupo · 2026-11-14
Los cinco SVG aportados por el usuario forman parte del paisaje fijo de fondo, con los pies sobre la arena, detrás del contenido y sin nombres visibles. Fila a la derecha en escritorio y centrada sobre la arena en móvil; se oscurecen suavemente con el atardecer. Imágenes decorativas y saludo original respetando movimiento reducido. No modificar el selector de participantes por los apodos de las ilustraciones.

En escritorio, pies al 3% del borde inferior; escena SVG anclada abajo (`xMidYMax slice`) para conservar la arena también en ventanas anchas. Móvil mantiene su posición al 8%.

En móvil, palmera SVG independiente, alta y angosta sobre el margen derecho; copa debajo de la navegación y tronco junto al borde, sin cruzar el título ni apoyarse en las cabezas. Se mantiene intacta la palmera de escritorio.

Quitado el óvalo decorativo de la arena. Ambas pestañas tienen una descripción breve de inclusiones; barra de filtros sin borde superior para evitar separadores consecutivos.

El SVG de Chino se reemplazó por el archivo corregido que aportó el usuario desde coleccion-personajes-elegida/01-hombre-saludando/personaje.svg. Se publica idéntico al original suministrado, conservando su viewBox, estilo y animación, sin la normalización previa.
