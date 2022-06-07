import { Environment } from "aws-cdk-lib";

type EnvName = "dev" | "prd";
export const ENV_NAME = getEnvName();

export const env: Record<EnvName, Environment> = {
  dev: {
    account: process.env.AWS_ACCOUNT_DEV,
    region: process.env.AWS_REGION_DEV,
  },
  prd: {
    account: process.env.AWS_ACCOUNT_PRD,
    region: process.env.AWS_REGION_PRD,
  },
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
