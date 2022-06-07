import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export default class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const service = new apprunner.Service(this, "Service", {
      source: apprunner.Source.fromAsset({
        asset: new assets.DockerImageAsset(this, "ImageAssets", {
          directory: "../app",
          platform: assets.Platform.LINUX_AMD64,
        }),
        imageConfiguration: {
          port: 3000,
          startCommand: "npm start",
          environment: {},
        },
      }),
      /**
       * Settings for an App Runner VPC connector to associate with the service.
       *
       * @default - no VPC connector, uses the DEFAULT egress type instead
       */
      // readonly vpcConnector?: IVpcConnector;
    });

    new cdk.CfnOutput(this, "URL", {
      value: service.serviceUrl,
    });
  }
}
