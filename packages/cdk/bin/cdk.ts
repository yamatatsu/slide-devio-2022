import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import AppStack from "../lib/app-stack";
import RoleStack from "../lib/role-stack";
import { accountId, ENV_NAME, NAME_PREFIX } from "../lib/constants";

const env = {
  account: accountId[ENV_NAME],
  region: "ap-northeast-1",
};

const app = new cdk.App();
new AppStack(app, `${NAME_PREFIX}App`, { env });
new RoleStack(app, `${NAME_PREFIX}Role`, { env });
