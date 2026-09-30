FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
RUN apk add --no-cache gettext-envsubst
COPY nginx.conf /etc/nginx/default.conf.template
COPY docker-entrypoint.sh /usr/local/bin/fieldwise-entrypoint.sh
RUN chmod +x /usr/local/bin/fieldwise-entrypoint.sh
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 8080
CMD ["/usr/local/bin/fieldwise-entrypoint.sh"]
