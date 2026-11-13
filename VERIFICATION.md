# Verificación local · 13 de noviembre de 2026

- `npm run check`: sintaxis del servidor y del cliente correcta.
- `npm test`: dos pruebas de integración con Miniflare y D1 efímero. Cubren nombres, máximo de cinco participantes, votos, favorita única, comentarios, sugerencias, edición autorizada, revisiones y rechazo de escrituras de otro origen.
- `npm run deploy -- --dry-run --outdir .wrangler/build`: empaquetado de Worker y ocho archivos estáticos correcto. No publica recursos.
- Navegador: ingreso por nombre, voto, favorita, comentario y comparación de dos propuestas. Revisión visual en escritorio y a 390 px de ancho. Los datos de prueba se eliminaron de la base local.
- Revisión de interfaz: sin bloqueos materiales en el alcance revisado. No equivale a una auditoría completa de accesibilidad ni de seguridad.

## Pendiente para producción

No se realizó un despliegue: falta autenticar Cloudflare, crear D1, reemplazar el ID de desarrollo, aplicar migraciones remotas y configurar ADMIN_KEY. Después del despliegue, verificar que dos dispositivos compartan votos y comentarios y que los datos persistan. El procedimiento está en README.md.

El selector de nombres es deliberadamente de confianza y no verifica identidad. Las cotizaciones son evidencia histórica; deben confirmarse antes de reservar.
