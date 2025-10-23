#!/usr/bin/env bash

set -euo pipefail

if [[ $# -eq 0 ]]; then
  echo "Uso: $0 <archivo> [archivo ...]" >&2
  exit 1
fi

status=0

for target in "$@"; do
  if [[ ! -e "$target" ]]; then
    echo "[ADVERTENCIA] El archivo '$target' no existe" >&2
    status=1
    continue
  fi

  chmod +x "$target"
  echo "[OK] Marcado como ejecutable: $target"
done

exit $status
