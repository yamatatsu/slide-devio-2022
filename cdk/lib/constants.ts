type EnvName = "dev" | "prd";
export const ENV_NAME = getEnvName();
export const SERVICE_NAME = "Devio2022";
export const NAME_PREFIX = SERVICE_NAME + ENV_NAME;

export const accountId: Record<EnvName, string> = {
  dev: "660782280015",
  prd: "",
};

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
