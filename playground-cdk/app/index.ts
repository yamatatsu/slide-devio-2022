import fastify from "fastify";

const app = fastify({ logger: true });

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen({ port: 3000, host: "0.0.0.0" });
