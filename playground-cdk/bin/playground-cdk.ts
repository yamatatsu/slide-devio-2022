import * as cdk from "aws-cdk-lib";
import { PlaygroundCdkStack } from "../lib/playground-cdk-stack";

const app = new cdk.App();
new PlaygroundCdkStack(app, "PlaygroundCdkStack", {
  env: {
    account: "660782280015",
    region: "ap-northeast-1",
  },
});
