import fastify from "fastify";
import { createPool } from "mariadb";

const app = fastify({ logger: true });
const pool = createPool({
  host: getEnv("DB_HOST"),
  port: parseInt(getEnv("DB_PORT")),
  database: getEnv("DB_NAME"),
  user: getEnv("DB_USERNAME"),
  password: getEnv("DB_PASSWORD"),
  connectionLimit: 5,
});
const connPromise = pool.getConnection();

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/items", async (req, res) => {
  const conn = await connPromise;
  const items = await conn.query("SELECT * FROM items;");
  res.send({ items });
});

app.addHook("onClose", async (instance) => {
  const conn = await connPromise;
  conn.release();
});
app.listen({ port: 3000, host: "0.0.0.0" });

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`No env ${name} is found. It is needed.`);
  }
  return val;
}
