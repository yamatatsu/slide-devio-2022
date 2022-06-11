import fastify from "fastify";
import { getPrisma } from "./prisma";

const app = fastify({ logger: true });
// prisma clientの取得よりもfastifyの起動を優先させるために、ここではawaitしない
const pPrisma = getPrisma();

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/profiles", async (req, res) => {
  const prisma = await pPrisma;
  const profiles = await prisma.profile.findMany();
  res.send({ profiles });
});

app
  .listen({ port: 3000, host: "0.0.0.0" })
  .catch((err) => {
    app.log.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = await pPrisma;
    await prisma.$disconnect();
  });
