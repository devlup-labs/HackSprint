FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev --no-audit --no-fund

COPY . .

EXPOSE 5001

CMD ["npm","start"]