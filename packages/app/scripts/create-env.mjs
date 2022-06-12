#!/usr/bin/env zx

const res =
  await $`aws secretsmanager get-secret-value --secret-id ${process.env.DATABASE_CREDENTIAL_SECRET_NAME}`;

const stdout = JSON.parse(res.stdout);
const secret = JSON.parse(stdout.SecretString);

console.log(JSON.parse(stdout.SecretString));
const { username, password, host, port, dbname } = secret;

await $`echo DATABASE_URL=mysql://${username}:${password}@${host}:${port}/${dbname} > .env`;
