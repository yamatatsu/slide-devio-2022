FROM node:16


WORKDIR /usr/src/main

COPY package*.json ./
COPY packages/app/package.json ./packages/app/
RUN npm ci

COPY packages/app/prisma ./packages/app/prisma
RUN npx -w packages/app prisma generate

COPY packages/app ./packages/app

EXPOSE 3000
