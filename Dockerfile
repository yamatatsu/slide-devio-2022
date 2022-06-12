FROM node:16 as base

WORKDIR /usr/src/main

COPY package*.json ./
COPY packages/app/package.json ./packages/app/
RUN npm ci

COPY packages/app/prisma ./packages/app/prisma
RUN npx -w packages/app prisma generate


FROM node:16 as app

COPY --from=base /usr/src/main /usr/src/main

WORKDIR /usr/src/main

COPY packages/app ./packages/app

EXPOSE 3000
