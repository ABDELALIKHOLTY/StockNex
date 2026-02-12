FROM node:20-alpine

WORKDIR /app

# Clear apk cache and update, then install minimal build dependencies
RUN rm -rf /var/cache/apk/* && \
    apk update && \
    apk add --no-cache --no-progress \
    python3 make

# Copy package files
COPY package.json package-lock.json* yarn.lock* pnpm-lock.yaml* ./

# Install dependencies with retry and increased timeout
# Using faster npm registry and more aggressive retry settings
RUN npm config set registry https://registry.npmmirror.com/ && \
    npm config set fetch-timeout 600000 && \
    npm config set fetch-retry-mintimeout 10000 && \
    npm config set fetch-retry-maxtimeout 600000 && \
    npm config set fetch-retries 10 && \
    npm config set loglevel verbose && \
    npm ci --prefer-offline --no-audit --no-fund || \
    (npm cache clean --force && npm ci --prefer-offline --no-audit --no-fund)

# Copy project files
COPY . .

# Build the application
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

# Build the application
RUN NEXT_TELEMETRY_DISABLED=1 npm run build

# Expose port
EXPOSE 3000

# Make admin creation scripts executable
RUN chmod +x /app/create-admin.sh /app/create-admin.js

# Create a startup script that runs admin creation before starting the app
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "🔐 Initialisation du container frontend..."' >> /app/entrypoint.sh && \
    echo 'echo "📝 Scripts disponibles:"' >> /app/entrypoint.sh && \
    echo 'echo "  - node /app/create-admin.js (JavaScript)"' >> /app/entrypoint.sh && \
    echo 'echo "  - sh /app/create-admin.sh (Shell)"' >> /app/entrypoint.sh && \
    echo 'echo ""' >> /app/entrypoint.sh && \
    echo 'echo "⏳ Création de l'"'"'utilisateur admin..."' >> /app/entrypoint.sh && \
    echo 'node /app/create-admin.js || true' >> /app/entrypoint.sh && \
    echo 'echo ""' >> /app/entrypoint.sh && \
    echo 'echo "✅ Démarrage du frontend sur http://localhost:3000"' >> /app/entrypoint.sh && \
    echo 'exec npm start' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Start the application with the entrypoint script
CMD ["/app/entrypoint.sh"]
