# Vacaciones · abril 2027

Tablero para cinco adultos: propuestas de viaje, opiniones, una favorita por persona, comentarios, comparación, sugerencias e investigación original. Título provisional, sin marca inventada.

## Desarrollo

Requiere Node.js 22.12 o superior y npm. Con nvm: `nvm use`.

```sh
npm ci
npm run db:local
npm run dev
```

Abrir http://localhost:8787. D1 local persiste en `.wrangler/`, separado de producción. Los tests usan otra base efímera y no contaminan el tablero.

```sh
npm run check
npm test
```

Si el entorno tiene el home de sólo lectura, definir `npm_config_cache` en una carpeta local; `WRANGLER_LOG_PATH` y `WRANGLER_REGISTRY_PATH` también pueden apuntar a `.wrangler/`.

## Publicar en la cuenta propia de Cloudflare

La aplicación utiliza un Worker con archivos estáticos y D1; no se modifica la página de MAB. Primero revisar que `wrangler whoami` muestre la cuenta deseada.

```sh
npx wrangler login
npx wrangler whoami
npx wrangler d1 create vacaciones-2027
```

Copiar el `database_id` retornado a `wrangler.jsonc`, reemplazando el UUID de ceros de desarrollo. No desplegar con el placeholder.

```sh
npm run db:remote
npx wrangler secret put ADMIN_KEY
npm run deploy
```

Elegir una clave aleatoria de organizador y guardarla en un gestor de contraseñas. Se ingresa interactivamente; no debe aparecer en archivos del repositorio. Localmente se puede definir `ADMIN_KEY` en `.dev.vars` (ignorado por Git). Sin esa clave funcionan las opiniones, pero el servidor rechaza la edición de propuestas.

La URL `workers.dev` que devuelve el deploy es el enlace común para compartir. La disponibilidad depende de la configuración de la cuenta. Para usar Pages haría falta adaptar el punto de entrada a Pages Functions; este proyecto está preparado para Workers.

## Uso

- Cada persona agrega o elige su nombre. Hay cinco lugares. Se recuerda el nombre en ese navegador.
- Seleccionar un nombre es un mecanismo de confianza, no autenticación. Cualquiera con el enlace puede actuar como cualquier participante: fue la modalidad elegida para el grupo.
- Una favorita implica “Me sumo”. Cambiar la opinión a “Puede ser” o “No me cierra” elimina esa favorita.
- “Cómo vamos” ordena por aceptación, luego por menos rechazos y finalmente por favoritas. No considera una respuesta pendiente como rechazo.
- Se pueden comparar dos o tres propuestas. No se convierten monedas: las seis opciones iniciales están expresadas en USD.
- Los datos se refrescan cada 20 segundos con la pestaña visible y al recuperar el foco. Los cambios se confirman sólo si el servidor los guardó. No hay guardado simulado ni sincronización offline.
- Cambiar una propuesta desde “Editar propuestas” incrementa la revisión: los votos viejos se conservan, pero dejan de contar hasta que se revisen. La edición requiere `ADMIN_KEY`.
- Una sugerencia no se convierte automáticamente en oferta: el organizador debe revisarla. La primera versión permite editar las seis propuestas iniciales; añadir propuestas completas se hace mediante migración.

## Datos y alcance

La investigación es del 13 de noviembre de 2026. Sólo Marinas y Pratagy tienen una consulta documentada para cinco; las otras cuatro opciones son promociones mensuales en base doble, con fechas y quinta plaza pendientes. Las fuentes y las capturas están dentro del sitio. No se garantiza precio ni disponibilidad, no se compran vuelos y no hay actualización automática.

Las capturas son evidencia histórica: no cambian al editar una propuesta. La fecha del informe también es histórica. En una actualización, revisar inclusiones, equipaje y pendientes junto con el precio; la pantalla de edición actual permite cambiar precio, fechas, hotel, salida, noches, fuente y nota.

No se recopilan documentos, correos ni datos de pago. Se guardan nombre elegido, votos, favoritas, comentarios y sugerencias. `noindex` y robots desalientan indexación pero no vuelven privado un enlace público.

## GitHub

Publicar exclusivamente bajo `Zhinon/vacaciones-2027`, como repositorio privado inicialmente. No usar la cuenta laboral activa ni cambiar la configuración global de autenticación. Se ignoran claves, estado local, dependencias y capturas de pruebas.
