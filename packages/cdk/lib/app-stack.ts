import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export default class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: "app-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        { name: "db-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
    });

    const vpcConnector = new apprunner.VpcConnector(this, "VpcConnector2", {
      vpc,
      vpcSubnets: {
        subnetGroupName: "app-subnet",
      },
    });
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
      vpcConnector,
    });

    new cdk.CfnOutput(this, "URL", {
      value: service.serviceUrl,
    });
  }
}
