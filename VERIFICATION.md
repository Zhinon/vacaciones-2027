# Verificación local · 13 de noviembre de 2026

- `npm run check`: sintaxis del servidor y del cliente correcta.
- `npm test`: dos pruebas de integración con Miniflare y D1 efímero. Cubren nombres, máximo de cinco participantes, votos, favorita única, comentarios, sugerencias, edición autorizada, revisiones y rechazo de escrituras de otro origen.
- `npm run deploy -- --dry-run --outdir .wrangler/build`: empaquetado de Worker y ocho archivos estáticos correcto. No publica recursos.
- Navegador: ingreso por nombre, voto, favorita, comentario y comparación de dos propuestas. Revisión visual en escritorio y a 390 px de ancho. Los datos de prueba se eliminaron de la base local.
- Revisión de interfaz: sin bloqueos materiales en el alcance revisado. No equivale a una auditoría completa de accesibilidad ni de seguridad.

## Producción

Publicado en https://vacaciones-2027.aranda-ariel-norberto.workers.dev el 13 de noviembre de 2026. D1 remoto con ambas migraciones aplicadas y ADMIN_KEY configurada como secreto del Worker.

Verificación HTTP con solicitudes independientes: seis propuestas disponibles; creación temporal de participante; voto, favorita y comentario persistidos; clave del organizador aceptada sin modificar cotizaciones. Se eliminaron únicamente los registros de prueba creados por esta comprobación. También se abrió la URL en navegador y se verificó el tablero cargado.

El selector de nombres es deliberadamente de confianza y no verifica identidad. Las cotizaciones son evidencia histórica; deben confirmarse antes de reservar.

## Rediseño de playa · 13 de noviembre de 2026

- Sintaxis de cliente y servidor correcta; empaquetado de Worker y doce archivos estáticos correcto.
- Navegador en escritorio (1265 px) y móvil (iframe de 390 px): portada, propuestas, comparación e Investigación. Verificados ingreso por nombre, voto, favorita y publicación de comentario con la base local. Datos de prueba retirados.
- Scroll hasta el final: avance de escena 1.000 y descenso del sol 330 px; capturas de día y atardecer verificadas. Consola sin errores ni advertencias en la sesión final.
- Revisión visual independiente: disposición `ship` en el alcance de las seis capturas y del código revisado. El detector automático no se pudo ejecutar por permisos del launcher.
- El servidor, las migraciones y los datos remotos no se modificaron como parte del rediseño.

Nueva versión publicada: `42859ab7-b236-4987-ae08-a323359ad17c`. Comprobados HTML, cliente y fuente públicos; propuestas remotas idénticas a las anteriores. Vista pública a 855 px revisada sin errores de consola. Revisión adicional `ship` para esa primera pantalla.

Selector de participantes: migración 0003 probada dos veces sin duplicados y aplicada a D1 remoto. Publicados los cinco nombres fijos. Navegador: selección de Charles y recarga conservan la identidad; luego se restauró el selector vacío. Sintaxis de cliente/servidor correcta. Versión publicada `cb4d61c7-51be-49c7-8ffd-74783fb8683c`.

## Vuelos separados · 14/11/2026

Investigación en navegador: 18 rutas y ocho combinaciones de fechas adicionales con URL de cinco adultos, indicador de pasajeros y total grupal. Se verificó el selector de cinco adultos/cero menores, y Natal 3–13/4 se abrió en JetSMART seleccionando Basic en ambos tramos hasta total con tasas, sin continuar a compra.

Tres pruebas de integración pasan: las existentes y una nueva que aplica migración 0004, conserva paquetes y votos, valida 11 vuelos/moneda/fecha/duración, admite los importes ARS mayores al antiguo límite USD y rechaza totales incoherentes y cambios de fechas sin recotizar. Los clientes antiguos siguen recibiendo seis paquetes para no mostrar ARS como USD.

Navegador local: filtro Mendoza, comparación agencia/aerolínea en ARS, informe nuevo y original de paquetes, vista móvil 390px. Los vuelos se muestran sin alojamiento y con llegadas al día siguiente.

Publicado y comprobado en producción: versión `6dfd9cf9-a63e-48bf-9d7a-933e7e20475e`, migración 0004 aplicada. API nueva devuelve 11 vuelos + 6 paquetes; API anterior conserva seis paquetes. Las propuestas y los participantes existentes permanecen iguales. La matriz pública tiene 26 consultas únicas. Navegador público sin errores ni advertencias en la comprobación final.
