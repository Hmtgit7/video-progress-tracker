# Dockerfile (inside server/)
FROM node:16-alpine

# Set working directory
WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build TypeScript files
RUN npm run build

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]


# # Dockerfile for server (backend)
# FROM node:16-alpine

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY server/package*.json ./

# # Install dependencies
# RUN npm install

# # Copy all backend files
# COPY server/ ./

# # Create build directory
# RUN mkdir -p dist

# # Build TypeScript files
# RUN npm run build

# # Expose port 5000
# EXPOSE 5000

# # Start the server
# CMD ["npm", "start"]