FROM node:18-alpine

WORKDIR /app

# Copy root package files for workspace support
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies (this will install workspace dependencies)
RUN npm install

# Copy source code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Build frontend first
RUN cd frontend && npm run build

# Build backend
RUN cd backend && npm run build

# Expose port
EXPOSE 5000

# Start the backend
WORKDIR /app/backend
CMD ["npm", "run", "start"]
