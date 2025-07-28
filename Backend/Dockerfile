#  build + runtime in one stage (small image, no dev deps)
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy only the manifests first (layer caching)
COPY package*.json ./

# Install prod deps only
RUN npm ci --omit=dev

# Copy the rest
COPY . .

# NODE_ENV=production disables dev-only code paths
ENV NODE_ENV=production
# The DB under Backend/
ENV SQLITE_STORAGE=/app/database/app.sqlite

EXPOSE 3001
CMD ["npm","start"]
