type EnvName = "dev" | "prd";
export const ENV_NAME = getEnvName();
export const SERVICE_NAME = "Devio2022";
export const NAME_PREFIX = SERVICE_NAME + ENV_NAME;

export const ACCOUNT_ID = process.env.AWS_ACCOUNT_ID!;

function getEnvName(): EnvName {
  const envName = process.env.ENV_NAME ?? "dev";
  if (!envName) {
    return "dev";
  }
  switch (envName) {
    case "dev":
    case "prd":
      return envName;
    default:
      throw new Error(`envName(${envName}) is not allowed.`);
  }
}
