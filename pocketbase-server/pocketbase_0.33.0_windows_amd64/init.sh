#!/bin/sh

# Espera a que PocketBase esté listo
echo "Inicializando PocketBase..."

# Crea el superusuario si no existe
./pocketbase superuser upsert mantenteapp@gmail.com 31671702 2>/dev/null || true

echo "PocketBase iniciado"
