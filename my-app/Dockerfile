# Build stage
FROM node:14 as build

# This sets the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package.json package-lock.json ./

# Install dependencies using npm install instead of npm ci
RUN npm install

# If npm install fails, list the contents of the directory for debugging
RUN ls -la || true

# Copy the rest of your app's source code from your host to your image filesystem.
COPY . .

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]