# Build stage
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build          # produces /app/dist (Vite default)

# Production stage
FROM nginx:alpine
# remove default nginx static files
RUN rm -rf /usr/share/nginx/html/*
# copy built SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# copy the entry-script and make it executable
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN sed -i 's/\r$//' /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

COPY nginx.conf /etc/nginx/conf.d/default.conf

# expose container port and declare default
ENV FRONTEND_PORT 80
EXPOSE 80

CMD ["nginx","-g","daemon off;"]

ENTRYPOINT ["/docker-entrypoint.sh"]
