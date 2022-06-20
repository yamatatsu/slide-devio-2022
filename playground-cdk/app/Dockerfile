FROM node:16 as base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD npm start
