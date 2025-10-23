# comunidades-plus-

## Usuarios de ejemplo

El repositorio incluye un archivo `data/users.json` que contiene las credenciales solicitadas para el usuario **Natalio** con contraseña `1234`.

## Marcado rápido de archivos ejecutables

Para facilitar el marcado de nuevos archivos como ejecutables, se añadió el script `scripts/make_executable.sh`. Puedes utilizarlo así:

```bash
./scripts/make_executable.sh archivo1 archivo2
```

Cada archivo indicado se marcará con permisos de ejecución. Si algún archivo no existe, el script mostrará una advertencia y continuará con el resto.
