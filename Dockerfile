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
WORKDIR /main/packages/app
ENTRYPOINT [ "./entrypoint.sh" ]
CMD npm start

# FROM public.ecr.aws/lambda/nodejs:16 as migration
# COPY --from=base /main /main
# WORKDIR /main
# CMD npm run -w packages/app prismaOnProduction -- deploy

FROM public.ecr.aws/lambda/nodejs:16 as migration

COPY --from=base /main/node_modules ${LAMBDA_TASK_ROOT}/
COPY packages/app/prisma ${LAMBDA_TASK_ROOT}/
COPY packages/app/migration.mjs ${LAMBDA_TASK_ROOT}/
CMD [ "migration.handler" ]
