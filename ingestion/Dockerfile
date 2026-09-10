FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application code
COPY load_raw.js ./

# Run the ingestion script
CMD ["node", "load_raw.js"]
