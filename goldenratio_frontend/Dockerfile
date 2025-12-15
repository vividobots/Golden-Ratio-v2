# goldenratio_frontend/Dockerfile

# Stage 1: Build the React App
FROM node:18 as build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve with a lightweight server (Nginx is complex, 'serve' is easier for React)
FROM node:18-slim
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/build ./build

# Run on port 8080 (Google expects port 8080)
CMD ["serve", "-s", "build", "-l", "8080"]