FROM node:18-alpine

WORKDIR /app

# Copy root package files first (for workspaces)
COPY package*.json ./
COPY backend/package*.json ./backend/

# Install dependencies using npm install (not ci)
RUN npm install

# Copy backend source code
COPY backend/ ./backend/

# Build the backend
RUN cd backend && npm run build

# Expose port
EXPOSE 5000

# Start the backend
WORKDIR /app/backend
CMD ["npm", "run", "start"]
