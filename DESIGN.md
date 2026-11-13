---
name: Vacaciones · abril 2027
description: Sistema visual de la interfaz para comparar propuestas de viaje en grupo.
colors:
  green: "#155c54"
  green-light: "#e5eee9"
  paper: "#f7f5ef"
  ink: "#173737"
  muted: "#536766"
  sand: "#ead9b9"
  line: "#d7ddd5"
  white: "#fffefa"
  red: "#903c31"
  yellow: "#765118"
rounded:
  control: "8px"
  panel: "12px"
typography:
  display:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "clamp(36px, 4.6vw, 58px)"
    fontWeight: 400
    lineHeight: 1.07
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "32px"
    fontWeight: 400
    lineHeight: 1.15
  title:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "18px"
    fontWeight: 700
  body:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "14px"
    fontWeight: 650
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    rounded: "{rounded.control}"
    padding: "11px 18px"
  field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "11px 12px"
---

# Design System: Vacaciones · abril 2027

## Overview

La interfaz construida conserva el fondo de papel claro, la tinta oscura y el verde petróleo definidos en el brief. La tipografía y los datos llevan la lectura; Georgia distingue los encabezados editoriales de los controles de sistema. El título es descriptivo y provisional, sin identidad de marca inventada.

Las superficies son planas y los separadores organizan la información. Las fotografías sólo se incorporan cuando existe una fuente aprobada; la versión actual utiliza capturas de cotizaciones en la investigación y no fotografías decorativas en el listado.

**Key Characteristics:**
- Tipografía y datos antes que decoración.
- Contraste de papel, tinta y verde petróleo.
- Estados expresados con texto además del color.
- Controles de tamaño táctil y foco visible.

## Colors

### Primary
- **Verde petróleo:** acciones, enlaces, selección afirmativa y navegación activa.
- **Verde claro:** selección contextual, cabecera de tabla y panel de participantes.

### Neutral
- **Papel marfil:** fondo general.
- **Tinta:** texto principal.
- **Tinta atenuada:** metadatos y apoyo.
- **Blanco cálido:** controles y campos.
- **Línea gris verdosa:** separadores y bordes.
- **Arena:** selección de texto y acentos discretos.

### Semantic
- **Rojo terroso:** errores.
- **Ocre:** evidencia pendiente y advertencias.

Los valores normativos están en el frontmatter; las variaciones locales de voto y avisos se conservan en el CSS implementado.

## Typography

Georgia con alternativas serif sirve a los encabezados. El cuerpo y la interfaz usan fuentes de sistema, sin descargas externas. Los precios utilizan cifras tabulares y peso seminegrita. El título de destino mide (36px), reducido a (32px) en móvil; el precio principal pasa de (32px) a (29px). Los controles y metadatos se sitúan principalmente entre (12px) y (14px).

## Layout

El contenido tiene un ancho máximo de (1160px). Por debajo de (1240px) conserva márgenes laterales de (40px); hasta (700px), de (20px). Las propuestas son filas separadas, con dos columnas para descripción y precio en escritorio, y una en móvil. Los detalles también pasan de dos columnas a una. La navegación y las tablas permiten desplazamiento horizontal cuando su contenido lo requiere. En móvil los tres votos ocupan una fila con columnas iguales.

## Elevation & Depth

La separación usa líneas y fondos tonales, sin sombras en las superficies habituales. Sólo el aviso flotante usa sombra (0 6px 22px #17373726). La interfaz no tiene animaciones de entrada. El desplazamiento suave se desactiva con la preferencia de movimiento reducido.

## Shapes

Controles suavemente redondeados y paneles algo más amplios; los radios normativos están en el frontmatter. Etiquetas y avisos menores usan (6px); el aviso flotante, (10px). Los iconos son SVG lineales que heredan el color del texto.

## Components

### Buttons
Botones de altura mínima (44px), con texto de (14px). El primario es verde con texto blanco cálido; al pasar el puntero oscurece a (#0f4842). El secundario conserva el fondo transparente y borde (#9bb5aa), con fondo verde claro al pasar el puntero. Deshabilitado reduce su opacidad a (0.6).

### Chips
La etiqueta de régimen usa verde claro, texto verde, radio (6px) y relleno (6px 10px). Es informativa, sin interacción de selección.

### Cards / Containers
Las propuestas son filas con separador inferior, sin caja ni sombra. Los bloques de precio usan fondo (#eceee4), radio de panel y relleno (18px 22px), reducido a (14px 17px) en móvil.

### Inputs / Fields
Campos blancos cálidos con borde (#aabbb3), relleno (11px 12px) y altura mínima (44px). Las áreas de texto permiten expansión vertical. Los errores aparecen con texto rojo junto al formulario.

### Navigation
Pestañas de texto con separador inferior. La opción activa usa verde, peso (700) y línea inferior de (2px). En móvil se reduce la tipografía y se mantiene el desplazamiento horizontal.

### Votos y estados
Los votos son botones con `aria-pressed`; cada selección conserva su texto. «Me sumo» usa verde; «Puede ser» y «No me cierra» tienen fondos y bordes semánticos propios. El resumen muestra barras acompañadas por recuentos y nombres. Los detalles se expanden dentro de la propuesta.

### Focus
Botones, enlaces, campos y resúmenes muestran contorno ocre (#ab620e) de (3px), separado (4px). Los estados de guardado, error y conexión disponen de texto visible.

## Do's and Don'ts

### Do:
- **Do** mantener la jerarquía de encabezados, datos y controles existente.
- **Do** acompañar estados de selección y evidencia con texto.
- **Do** conservar foco visible y controles táctiles de al menos 44px.
- **Do** respetar la preferencia de movimiento reducido.

### Don't:
- **Don't** sustituir el título provisional por una marca inventada.
- **Don't** convertir las filas de propuestas en tarjetas decorativas con sombras.
- **Don't** incorporar fotografías sin una fuente aprobada.
