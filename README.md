# Comunidades Plus - Noticias

Página web tipo diario digital pensada para que el administrador publique, edite y elimine noticias que se muestran a los visitantes en cuanto ingresan.

## Características principales

- **Noticias destacadas**: el inicio carga automáticamente las últimas noticias almacenadas (persistencia mediante `localStorage`).
- **Buscador inmediato**: la barra con lupa filtra las noticias por título a medida que se escribe o se presiona el botón de búsqueda.
- **Acceso administrativo**: botón en la esquina superior derecha que abre un modal para iniciar sesión (usuario `Luca`, contraseña `Luca3122`). Una vez autenticado permite volver a abrir el panel cuando se necesite.
- **Gestión completa de noticias**: una vez autenticado, el administrador puede crear nuevas noticias, editarlas o eliminarlas desde el panel.
- **Atajo para regresar a la portada**: dentro del panel aparece el botón **Volver al inicio**, pensado para ocultar el menú de administración y navegar como visitante sin cerrar sesión.
- **Estética azul y blanca**: cabecera con la bandera de Israel flameando de fondo y paleta cromática acorde al pedido.
- **Noticias con imágenes y videos**: cada publicación puede incluir hasta dos archivos multimedia cargados desde la computadora del administrador.
- **Vista ampliada de cada noticia**: cualquier visitante puede abrir una tarjeta para leer el desarrollo completo y ver el material multimedia en mayor tamaño, con la imagen o video siempre visible en la parte superior mientras se recorre el texto.

## Uso

1. Abrí `index.html` en tu navegador preferido.
2. Explora las noticias disponibles y utilizá la barra de búsqueda para encontrar títulos específicos.
3. Para administrar el contenido, seleccioná **Acceso administrador** e ingresá las credenciales provistas.
4. Dentro del panel podés cargar nuevas noticias (fecha, título, hasta dos archivos multimedia opcionales y contenido), modificarlas o borrarlas.
5. Cuando quieras ocultar el panel y regresar a la portada, hacé clic en **Volver al inicio**; el botón de acceso superior seguirá disponible para reabrir la gestión.

> **Nota:** Las noticias se guardan en el almacenamiento local del navegador, por lo que los cambios permanecen disponibles en el mismo dispositivo y navegador.
