# Stage 1: Build the Angular app
FROM node:18 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# Stage 2: Serve the app using Nginx
FROM nginx:alpine
COPY --from=build /app/dist/your-angular-project /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
