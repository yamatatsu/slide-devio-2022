import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: "app-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
        { name: "db-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
    });

    const vpcConnector = new apprunner.VpcConnector(this, "VpcConnector", {
      vpc,
      vpcSubnets: { subnetGroupName: "app-subnet" },
    });

    const asset = new assets.DockerImageAsset(this, "ImageAssets", {
      directory: "./app",
      platform: assets.Platform.LINUX_AMD64,
    });

    new apprunner.Service(this, "Service", {
      source: apprunner.Source.fromAsset({
        asset: asset,
        imageConfiguration: {
          port: 3000,
        },
      }),
      vpcConnector,
    });

    // const bastion = new ec2.BastionHostLinux(this, "Bastion", {
    //   vpc,
    //   // subnetSelection: vpc.selectSubnets({ subnetGroupName: "app-subnet" }),
    //   instanceType: ec2.InstanceType.of(
    //     ec2.InstanceClass.T3,
    //     ec2.InstanceSize.NANO
    //   ),
    // });
  }
}
