FROM node:20-alpine AS build

WORKDIR /app

ARG VITE_API_URL=http://localhost:3000/api/v1
ARG VITE_EUR_TO_RON=5
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_EUR_TO_RON=$VITE_EUR_TO_RON

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS runtime

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
