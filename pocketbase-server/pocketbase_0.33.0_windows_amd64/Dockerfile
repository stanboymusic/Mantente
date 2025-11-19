FROM alpine:latest

RUN apk add --no-cache \
    ca-certificates \
    curl \
    unzip

WORKDIR /app

RUN curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.33.0/pocketbase_0.33.0_linux_amd64.zip -o pb.zip && \
    unzip pb.zip && \
    rm pb.zip && \
    chmod +x pocketbase

EXPOSE 8090

ENV POCKETBASE_ADMIN_EMAIL=mantenteapp@gmail.com
ENV POCKETBASE_ADMIN_PASSWORD=31671702

CMD ["sh", "-c", "./pocketbase superuser create ${POCKETBASE_ADMIN_EMAIL} ${POCKETBASE_ADMIN_PASSWORD} 2>/dev/null || true && ./pocketbase serve --http=0.0.0.0:8090"]
