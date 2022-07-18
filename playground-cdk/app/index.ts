import fastify from "fastify";
import { Pool } from "mariadb";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

const app = fastify({ logger: true });

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/items", async (req, res) => {
  const conn = await app.mariadb.getConnection();
  const items = await conn.query("SELECT * FROM items;");
  res.send({ items });
});

const secretsManagerClient = new SecretsManagerClient({
  region: "ap-northeast-1",
});
secretsManagerClient
  .send(new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_NAME }))
  .then(({ SecretString: secretString = "" }) => {
    const secrets = JSON.parse(secretString);
    app.register(require("fastify-mariadb"), {
      host: secrets.host,
      port: secrets.port,
      database: secrets.dbname,
      user: secrets.username,
      password: secrets.password,
      promise: true,
    });

    app.listen({ port: 3000, host: "0.0.0.0" });
  })
  .catch((err) => {
    console.error(err);
  });

declare module "fastify" {
  interface FastifyInstance {
    mariadb: Pool;
  }
}
