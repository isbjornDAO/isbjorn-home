FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm ci

# Copy backend source code
COPY backend/ ./backend/

# Build the backend
RUN cd backend && npm run build

# Expose port
EXPOSE 5000

# Start the backend
WORKDIR /app/backend
CMD ["npm", "run", "start"]
