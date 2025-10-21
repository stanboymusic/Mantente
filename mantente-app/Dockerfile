# Usa la imagen base de Alpine, ligera y rápida
FROM alpine:3.18

# Define el puerto que PocketBase usará internamente
ENV PORT=8080

# Instala certificados SSL para que Fly.io confíe en la comunicación
RUN apk add --no-cache ca-certificates

# Establece el directorio de trabajo
WORKDIR /pb

# ... (líneas previas)

# Copiar el ejecutable
COPY pocketbase /pb/pocketbase 
RUN chmod +x /pb/pocketbase

# NUEVA LÍNEA CLAVE: Copia tu carpeta de datos local al contenedor
COPY pb_data /pb/pb_data 

# El PocketBase iniciado usará estos datos
CMD ["/pb/pocketbase", "serve", "--http", "0.0.0.0:80"]
