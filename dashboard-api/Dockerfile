FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application source
COPY . .

# Expose API port
EXPOSE 3001

# Start server
CMD ["node", "server.js"]
