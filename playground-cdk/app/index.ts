import fastify from "fastify";
import { Pool } from "mariadb";

const app = fastify({ logger: true });
app.register(require("fastify-mariadb"), {
  host: getEnv("DB_HOST"),
  port: parseInt(getEnv("DB_PORT")),
  database: getEnv("DB_NAME"),
  user: getEnv("DB_USERNAME"),
  password: getEnv("DB_PASSWORD"),
  promise: true,
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/items", async (req, res) => {
  const conn = await app.mariadb.getConnection();
  const items = await conn.query("SELECT * FROM items;");
  res.send({ items });
});

app.listen({ port: 3000, host: "0.0.0.0" });

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`No env ${name} is found. It is needed.`);
  }
  return val;
}

declare module "fastify" {
  interface FastifyInstance {
    mariadb: Pool;
  }
}
