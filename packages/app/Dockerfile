FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci
COPY prisma prisma
RUN npx prisma generate

COPY . .

EXPOSE 3000
