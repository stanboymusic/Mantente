# Usa la imagen base de Alpine, ligera y rápida
FROM alpine:3.18

# Define el puerto que PocketBase usará internamente
ENV PORT=8080

# Instala certificados SSL para que Fly.io confíe en la comunicación
RUN apk add --no-cache ca-certificates

# Establece el directorio de trabajo
WORKDIR /pb

# ... (líneas previas)

# 🚨 CORRECCIÓN: Usar el binario de Linux (sin .exe)
COPY pocketbase /pb/pocketbase 

RUN chmod +x /pb/pocketbase # Esto ya está bien

# ... (línea EXPOSE)

# La línea CMD se mantiene igual (sin .exe), ya que Alpine lo ejecutará sin problemas.
# Dockerfile (LÍNEA FINAL)

# ESTE ES EL COMANDO FINAL Y CORRECTO
CMD ["/pb/pocketbase", "serve", "--dir", "/data/clean-db", "--http", "0.0.0.0:80"]