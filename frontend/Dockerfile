# Этап 1: Сборка
FROM node:20-slim as build

WORKDIR /app

# Принимаем аргументы для Vite (Coolify передаст их автоматически)
ARG VITE_API_URL
ARG VITE_TELEGRAM_BOT_USERNAME
ARG VITE_DEV_MODE=false

# Копируем только файлы зависимостей
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая devDependencies для сборки)
RUN npm install

# Теперь можно установить NODE_ENV
ENV NODE_ENV=production

# Копируем остальные файлы и собираем
COPY . .
RUN npm run build

# Этап 2: Финальный образ с Nginx
FROM nginx:alpine as production

# Копируем собранные файлы из этапа build
COPY --from=build /app/dist /usr/share/nginx/html

# Копируем конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]