# Comunidades Plus - Noticias

Portal estático tipo diario pensado para que los administradores publiquen novedades y la comunidad pueda consultarlas desde cualquier dispositivo.

## Características principales

- 🎯 **Inicio informativo** con banner azul y blanco inspirado en la bandera de Israel, buscador y acceso rápido al panel de administración.
- 📰 **Listado de noticias** en tarjetas responsivas con resumen, fecha y botón para abrir cada publicación completa.
- 🔍 **Búsqueda instantánea** por título mientras se escribe.
- 🛡️ **Acceso seguro** para administradores autorizados (Luca / Luca3122 y Natalio / 1234).
- ✍️ **Gestión completa de noticias** (crear, editar, borrar) con posibilidad de adjuntar hasta dos imágenes o videos por publicación.
- 💾 **Persistencia local** utilizando `localStorage`, por lo que las noticias creadas permanecen disponibles al volver a entrar en la página desde el mismo navegador.

## Estructura de archivos

```
.
├── assets/
│   ├── israel-flag-clouds.svg
│   ├── israel-flag-waving.svg
│   └── israel-flag.svg
├── app.js
├── index.html
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
5. Una vez autenticado:
   - Creá una noticia nueva completando título, contenido y opcionalmente hasta dos archivos (imagen o video).
   - Editá una noticia existente para actualizar texto o reemplazar los adjuntos.
   - Eliminá publicaciones que ya no quieras mostrar.
   - Usá el botón **“Volver al inicio”** para ocultar el panel sin cerrar sesión, o **“Cerrar sesión”** para salir.
6. Las noticias que crees se guardan en el `localStorage` del navegador. Si necesitás compartirlas con otra persona, exportá el almacenamiento o copiale los datos manualmente.

## Notas y buenas prácticas

- Las imágenes y videos cargados por los administradores se guardan como _data URLs_ dentro del navegador. Para archivos grandes puede tardar más en guardarlos.
- Recomendamos usar imágenes comprimidas (JPG/PNG) o videos cortos en MP4 para mejorar la carga.
- Como se trata de una página estática, las noticias creadas en un navegador no se replican automáticamente en otros dispositivos.
- Eliminamos cualquier recurso binario para evitar bloqueos en repositorios que sólo aceptan texto.

## Créditos

Diseño y desarrollo realizados por el equipo de Comunidades Plus pensando en las necesidades de la comunidad.
