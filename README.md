# Comunidades Plus - Noticias

Portal estático tipo diario pensado para que los administradores publiquen novedades y la comunidad pueda consultarlas desde cualquier dispositivo.

## Características principales

- 🎯 **Inicio informativo** con banner azul y blanco inspirado en la bandera de Israel, buscador y acceso rápido al panel de administración.
- 📰 **Listado de noticias** en tarjetas responsivas con resumen, fecha y botón para abrir cada publicación completa.
- 🔍 **Búsqueda instantánea** por título mientras se escribe.
- 🛡️ **Acceso seguro** para administradores autorizados (Luca / Luca3122, Natalio / 1234 y natalio / 1234).
- ✍️ **Gestión completa de noticias** (crear, editar, borrar) con posibilidad de adjuntar hasta dos imágenes o videos por publicación.
- ☁️ **Sincronización opcional en la nube** mediante Supabase para que cualquier visitante vea las novedades recién publicadas.
- 💾 **Persistencia local** con `localStorage` como respaldo para seguir trabajando aun sin conexión.

## Estructura de archivos

```
.
├── assets/
│   ├── israel-flag-clouds.svg
│   ├── israel-flag-waving.svg
│   └── israel-flag.svg
├── data/
│   └── users.json
├── app.js
├── index.html
├── scripts/
│   └── make_executable.sh
├── supabase-config.example.js
├── README.md
└── styles.css
```

Todos los recursos son archivos de texto (SVG, HTML, CSS y JavaScript) para evitar problemas con sistemas que rechazan binarios.

## Cómo usar el proyecto

1. Abrí `index.html` en tu navegador (doble clic o arrastrá el archivo a una ventana nueva). No se necesitan servidores ni instalaciones adicionales.
2. Explorá las noticias cargadas de ejemplo.
3. Utilizá el buscador para filtrar por título.
4. Si sos administrador, tocá el botón **“Acceso administrador”** e iniciá sesión con alguno de estos usuarios:
   - Usuario: `Luca` &nbsp; Contraseña: `Luca3122`
   - Usuario: `Natalio` &nbsp; Contraseña: `1234`
   - Usuario: `natalio` &nbsp; Contraseña: `1234`
5. Una vez autenticado:
   - Creá una noticia nueva completando título, contenido y opcionalmente hasta dos archivos (imagen o video).
   - Editá una noticia existente para actualizar texto o reemplazar los adjuntos.
   - Eliminá publicaciones que ya no quieras mostrar.
   - Usá el botón **“Volver al inicio”** para ocultar el panel sin cerrar sesión, o **“Cerrar sesión”** para salir.
6. Las noticias se guardan automáticamente en la nube cuando configurás Supabase (ver sección siguiente). Si no hay conexión, quedan almacenadas en el `localStorage` del navegador y se sincronizan apenas vuelve la conectividad.

## Sincronización en la nube (Supabase)

1. Copiá `supabase-config.example.js` a `supabase-config.js` y completá la URL y la clave pública (_anon key_) de tu proyecto. El archivo real está ignorado por Git para proteger las credenciales.
2. Asegurate de exponer un `supabaseClient` (instancia de `@supabase/supabase-js`) y, opcionalmente, `tableName` si usás un nombre diferente a `news_posts`.
3. En tu proyecto Supabase creá una tabla `news_posts` con las siguientes columnas sugeridas:
   - `id` (`text`, **primary key**)
   - `title` (`text`)
   - `content` (`text`)
   - `attachments` (`jsonb`)
   - `author` (`text`)
   - `created_at` (`timestamptz`, valor por defecto `now()`)
   - `updated_at` (`timestamptz`, permite valores nulos)
4. Si activás Row Level Security, agregá políticas que permitan `SELECT` público y `INSERT`/`UPDATE`/`DELETE` para los usuarios que vayan a administrar las noticias.
5. Abrí `index.html`. La aplicación cargará las noticias publicadas y sincronizará automáticamente los cambios nuevos; si la conexión falla, quedarán en espera y se enviarán cuando vuelva el acceso a la nube.

## Notas y buenas prácticas

- Las imágenes y videos cargados por los administradores se guardan como _data URLs_ tanto localmente como en la nube. Para archivos grandes puede tardar más en guardarlos.
- Recomendamos usar imágenes comprimidas (JPG/PNG) o videos cortos en MP4 para mejorar la carga.
- Si la conexión con Supabase no está disponible, los cambios se guardan en el dispositivo y se sincronizan automáticamente en cuanto se restablece.
- Eliminamos cualquier recurso binario para evitar bloqueos en repositorios que sólo aceptan texto.

## Créditos

Diseño y desarrollo realizados por el equipo de Comunidades Plus pensando en las necesidades de la comunidad.
