import { $ } from "zx";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient();
const res = await client.send(
  new GetSecretValueCommand({
    SecretId: process.env.DATABASE_CREDENTIAL_SECRET_NAME,
  })
);

const secret = JSON.parse(res.SecretString);
const { username, password, host, port, dbname } = secret;

await $`echo DATABASE_URL=mysql://${username}:${password}@${host}:${port}/${dbname} > .env`;
