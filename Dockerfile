FROM node:16 as base

WORKDIR /main

COPY package*.json ./
COPY packages/app/package.json ./packages/app/
RUN npm ci

COPY packages/app/prisma ./packages/app/prisma
RUN npx -w packages/app prisma generate

FROM node:16 as app
COPY --from=base /main /main
WORKDIR /main
COPY packages/app ./packages/app
EXPOSE 3000
ENTRYPOINT [ "./packages/app/entrypoint.sh" ]
CMD npm start -w packages/app

FROM public.ecr.aws/lambda/nodejs:16 as migration
COPY --from=base /main /main
WORKDIR /main
CMD npm run -w packages/app prismaOnProduction -- deploy
