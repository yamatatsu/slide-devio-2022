import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { CdkStack } from "../lib/cdk-stack";
import { ENV_NAME, env } from "../lib/constants";

const app = new cdk.App();
new CdkStack(app, `Devio2022${ENV_NAME}CdkStack`, {
  env: env[ENV_NAME],
});
