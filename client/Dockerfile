# Stage 1: Build the React app
FROM node:16-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built React files to Nginx's public folder
COPY --from=build /app/build /usr/share/nginx/html

# Optional: Nginx config (remove if not needed)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


# # Dockerfile for client (frontend)
# FROM node:16-alpine as build

# # Set working directory
# WORKDIR /app

# # Copy package.json and package-lock.json
# COPY client/package*.json ./

# # Install dependencies
# RUN npm install

# # Copy all frontend files
# COPY client/ ./

# # Build the app
# RUN npm run build

# # Production stage
# FROM nginx:alpine

# # Copy built files from build stage to nginx serve directory
# COPY --from=build /app/build /usr/share/nginx/html

# # Copy nginx configuration
# COPY client/nginx.conf /etc/nginx/conf.d/default.conf

# # Expose port 80
# EXPOSE 80

# # Start nginx
# CMD ["nginx", "-g", "daemon off;"]