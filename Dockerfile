# Stage 1: Build the Angular app
FROM node:20.12.2-alpine as build

# Установка рабочей директории внутри контейнера
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование исходного кода
COPY . .

# Сборка Angular приложения
RUN npm run build --prod

# Stage 2: Serve the app with Nginx
FROM nginx:alpine

# Копирование собранного приложения из предыдущего этапа
COPY --from=build /app/dist/demo /usr/share/nginx/html

# Копирование пользовательской конфигурации Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Запуск Nginx
CMD ["nginx", "-g", "daemon off;"]

