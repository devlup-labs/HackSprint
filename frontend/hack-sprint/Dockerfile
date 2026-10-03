FROM node:20-alpine AS builder

WORKDIR /home/app

COPY package*.json ./

RUN npm ci

COPY . .

# Vite inlines VITE_* vars into the bundle at build time, and .env is
# excluded from the build context (see .dockerignore) — so it has to be
# passed in explicitly here, e.g.:
#   docker build \
#     --build-arg VITE_API_URL=https://rahul1901.prometeo.in \
#     --build-arg VITE_GOOGLE_CLIENT_ID=<google web client id> \
#     -t hacksprint-frontend .
ARG VITE_API_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID

RUN npm run build

FROM nginx:alpine

COPY --from=builder /home/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
# docker run -p 5173:80 hacksprint

