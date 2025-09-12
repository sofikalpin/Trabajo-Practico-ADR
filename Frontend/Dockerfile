FROM node:18-alpine AS build

LABEL maintainer="Sofia Kalpin"
LABEL description="Frontend React para Sistema Inmobiliario MKalpin"
LABEL version="1.0.0"

RUN apk add --no-cache git

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001
RUN chown -R nodejs:nodejs /app
USER nodejs

COPY --chown=nodejs:nodejs package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --chown=nodejs:nodejs . .

RUN npm run build

FROM nginx:alpine AS production

LABEL maintainer="Sofia Kalpin"
LABEL description="Frontend servido con Nginx - Sistema Inmobiliario MKalpin"
LABEL version="1.0.0"

RUN apk add --no-cache \
    curl \
    && rm -rf /var/cache/apk/*

RUN addgroup -g 101 -S nginx-custom \
    && adduser -S nginx-custom -u 101 -G nginx-custom

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN echo 'server_tokens off;' > /etc/nginx/conf.d/security.conf

RUN chown -R nginx-custom:nginx-custom /usr/share/nginx/html \
    && chown -R nginx-custom:nginx-custom /var/cache/nginx \
    && chown -R nginx-custom:nginx-custom /var/log/nginx \
    && chown -R nginx-custom:nginx-custom /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nginx-custom:nginx-custom /var/run/nginx.pid

USER nginx-custom

ENV NGINX_WORKER_PROCESSES=auto
ENV NGINX_WORKER_CONNECTIONS=1024

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
