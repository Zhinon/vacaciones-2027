# Vacaciones · abril 2027

Interfaz con playa SVG que cambia de día a atardecer al hacer scroll. Propuestas breves; detalles y fuentes en Investigación. Escena estática con movimiento reducido.

Tablero para cinco adultos: propuestas de viaje, opiniones, una favorita por persona, comentarios, comparación, sugerencias e investigación original. Título provisional, sin marca inventada.

## Sitio publicado

https://vacaciones-2027.aranda-ariel-norberto.workers.dev

Publicado en la cuenta personal de Cloudflare, con D1 y clave del organizador configurados. La clave está guardada localmente en `.dev.vars`, con permisos de lectura restringidos y fuera de Git.

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

La base de producción ya está conectada en `wrangler.jsonc`. Para una instalación en otra cuenta, crear otra base y reemplazar `account_id` y `database_id`. No desplegar con un UUID de ceros.

```sh
npm run db:remote
npx wrangler secret put ADMIN_KEY
npm run deploy
```

Elegir una clave aleatoria de organizador y guardarla en un gestor de contraseñas. Se ingresa interactivamente; no debe aparecer en archivos del repositorio. Localmente se puede definir `ADMIN_KEY` en `.dev.vars` (ignorado por Git). Sin esa clave funcionan las opiniones, pero el servidor rechaza la edición de propuestas.

La URL `workers.dev` que devuelve el deploy es el enlace común para compartir. La disponibilidad depende de la configuración de la cuenta. Para usar Pages haría falta adaptar el punto de entrada a Pages Functions; este proyecto está preparado para Workers.

## Uso

- Cada persona elige Vane, Ro, Charles, Rubio o Chino en el selector «¿Quién sos?». Se recuerda la elección en ese navegador.
- Seleccionar un nombre es un mecanismo de confianza, no autenticación. Cualquiera con el enlace puede actuar como cualquier participante: fue la modalidad elegida para el grupo.
- Una favorita implica “Me sumo”. Cambiar la opinión a “Puede ser” o “No me cierra” elimina esa favorita.
- “Cómo vamos” ordena por aceptación, luego por menos rechazos y finalmente por favoritas. No considera una respuesta pendiente como rechazo.
- Se pueden comparar dos o tres propuestas. No se convierten monedas: los paquetes están en USD y los vuelos separados en ARS. El selector separa ambos alcances y conserva la moneda del proveedor.
- Los datos se refrescan cada 20 segundos con la pestaña visible y al recuperar el foco. Los cambios se confirman sólo si el servidor los guardó. No hay guardado simulado ni sincronización offline.
- Cambiar una propuesta desde “Editar propuestas” incrementa la revisión: los votos viejos se conservan, pero dejan de contar hasta que se revisen. La edición requiere `ADMIN_KEY`.
- Una sugerencia no se convierte automáticamente en oferta: el organizador debe revisarla. La primera versión permite editar las propuestas cargadas; añadir propuestas completas se hace mediante migración.

## Datos y alcance

La investigación es del 13 de noviembre de 2026. Sólo Marinas y Pratagy tienen una consulta documentada para cinco; las otras cuatro opciones son promociones mensuales en base doble, con fechas y quinta plaza pendientes. Las fuentes, condiciones vigentes y capturas están en Investigación; los comentarios siguen junto a cada propuesta. No se garantiza precio ni disponibilidad, no se compran vuelos y no hay actualización automática.

Las capturas son evidencia histórica: no cambian al editar una propuesta. La fecha del informe también es histórica. En una actualización, revisar inclusiones, equipaje y pendientes junto con el precio; la pantalla de edición actual permite cambiar precio, fechas, hotel, salida, noches, fuente y nota.

El tablero público guarda nombre elegido, votos, favoritas, comentarios y sugerencias. La pestaña Mis datos permite cargar datos de pasajeros privados (documentos y contacto); no se guardan fotos ni datos de pago. `noindex` y robots desalientan indexación pero no vuelven privado un enlace público.

## GitHub

Publicar exclusivamente bajo `Zhinon/vacaciones-2027`, como repositorio privado inicialmente. No usar la cuenta laboral activa ni cambiar la configuración global de autenticación. Se ignoran claves, estado local, dependencias y capturas de pruebas.

## Tipografía

Fraunces se sirve desde `public/fonts/`, sin dependencias de CDN en el navegador. Fuente original: Google Fonts / Undercase Type. Licencia SIL Open Font License en `public/fonts/OFL.txt`. La playa es un SVG original incluido en el HTML.

## Vuelos para cinco · 14/11/2026

Once propuestas de sólo vuelo en `#vuelos`, separadas de los seis paquetes. El filtro permite Mendoza, Buenos Aires y Santiago. La investigación conserva 26 consultas distintas de 18 rutas en `public/vuelos-abril-2027.md` y su registro estructurado en `public/vuelos-cotizaciones.json`. El informe original de paquetes se mantiene.

`evidence: search` significa búsqueda con cinco adultos y total de grupo leído en el comparador; no es garantía de inventario ni validación final de agencia. La cotización directa de JetSMART Natal sí se contrastó seleccionando ambos tramos Basic para cinco en la aerolínea antes de continuar a equipaje/pago. Las tasas de redondeo de ARS pueden producir menos de un peso de diferencia por persona respecto al promedio del total.

El servidor conserva la moneda de cada propuesta. Editar fechas de vuelo requiere recotizar: la pantalla las muestra como sólo lectura y el servidor rechaza cambios de fechas/duración desde esa edición. Las ediciones de precio siguen incrementando revisión.

Compatibilidad: `/api/state` conserva sólo paquetes para clientes anteriores, que asumían USD. El cliente nuevo consulta `/api/state?include=flights`. La migración 0004 sólo agrega propuestas, sin cambiar paquetes ni opiniones.

## Datos privados para reservar · 22/11/2026

`#datos` conserva el selector de nombres y crea una credencial aleatoria de 256 bits en el navegador. La primera carga para cada nombre es por confianza; no verifica identidad. Una vez guardado, elegir ese nombre desde otro navegador no permite leer ni reemplazar la ficha. En un dispositivo compartido, quien use el mismo perfil del navegador puede usar sus accesos guardados.

Los datos se cifran con AES-256-GCM y AAD por participante antes de persistir en D1 (`travelers`). Sólo se guardan hashes SHA-256 de las credenciales. El estado público nunca devuelve fichas, hashes ni textos cifrados. No se guardan datos personales en localStorage: sólo la credencial de acceso. Los datos del formulario se mantienen en memoria y se descartan al salir. No hay autofill desde votos ni sincronización con aerolíneas.

Secret requerido: `TRAVELER_DATA_KEY`, 32 bytes aleatorios en base64; respaldo local en `.dev.vars` (0600, ignorado). No rotarlo sin migrar antes el cifrado existente. `ADMIN_KEY` autoriza la lectura del grupo y la recuperación de accesos. Cada ficha registra confirmación de uso para la reserva. Guardar verifica revisión para evitar sobrescrituras concurrentes.

El organizador entra en Mis datos → Acceso del organizador con la clave ya configurada. Puede emitir un enlace privado para recuperar una ficha: rota la credencial anterior, no borra sus datos. El enlace lleva el secreto sólo en el fragmento, se consume al abrir y se limpia de la URL; compartirlo concede acceso a esa ficha. El titular puede borrar sus datos desde su formulario. No se envían mensajes a los amigos automáticamente.

Endpoints propios: `GET /api/travelers/self`, `PUT /api/travelers`, `DELETE /api/travelers/self`, `GET /api/travelers/admin`, `POST /api/travelers/rotate`. Todas las respuestas usan no-store, autorización por credencial y control de origen para escrituras. La migración 0005 crea una tabla vacía, sin tocar votos ni propuestas.
