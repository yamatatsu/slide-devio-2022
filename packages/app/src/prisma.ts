import { PrismaClient } from "@prisma/client";
import {
  GetSecretValueCommand,
  SecretsManagerClient,
} from "@aws-sdk/client-secrets-manager";

const {
  NODE_ENV,
  DATABASE_USER,
  DATABASE_PASS,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_CREDENTIAL_SECRET_NAME,
} = process.env;

const secretManager = new SecretsManagerClient({ region: "ap-northeast-1" });

export const getPrisma = async () => {
  const { user, password } = await getUserAndPass();
  return new PrismaClient({
    datasources: {
      db: {
        url: `mysql://${user}:${password}@${DATABASE_HOST}:${DATABASE_PORT}/mydb`,
      },
    },
  });
};

const getUserAndPass = async () => {
  if (NODE_ENV !== "production") {
    return { user: DATABASE_USER, password: DATABASE_PASS };
  }
  const res = await secretManager.send(
    new GetSecretValueCommand({
      SecretId: DATABASE_CREDENTIAL_SECRET_NAME,
    })
  );
  const { user, password } = JSON.parse(res.SecretString!);
  return { user, password };
};
