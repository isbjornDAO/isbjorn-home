FROM node:18-alpine

WORKDIR /app

# Copy root package files for workspace support
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies (this will install workspace dependencies)
RUN npm install

# Copy backend source code
COPY backend/ ./backend/

# Build only the backend (avoid building frontend)
RUN cd backend && npm run build

# Expose port
EXPOSE 5000

# Start the backend
WORKDIR /app/backend
CMD ["npm", "run", "start"]
