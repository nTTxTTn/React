# Build stage
FROM node:16 as build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install
# react-scripts를 전역으로 설치하지 않아도 됩니다 (package.json에 이미 있음)

# Copy the rest of the code
COPY . .

# Add missing babel plugin
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy the build output to replace the default nginx contents.
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]