import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export default class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: "app-subnet", subnetType: ec2.SubnetType.PUBLIC },
        { name: "db-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
    });

    const database = new rds.DatabaseCluster(this, "Database", {
      engine: rds.DatabaseClusterEngine.auroraMysql({
        version: rds.AuroraMysqlEngineVersion.VER_2_10_2,
      }),
      instanceProps: {
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.SMALL
        ),
        vpcSubnets: { subnetGroupName: "db-subnet" },
        vpc,
      },
      defaultDatabaseName: "mydb",
      credentials: rds.Credentials.fromGeneratedSecret("admin"),
    });
    const databaseCredentialSecret = database.secret!;

    const instanceRole = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
    });
    databaseCredentialSecret.grantRead(instanceRole);

    const service = new apprunner.Service(this, "Service", {
      source: apprunner.Source.fromAsset({
        asset: new assets.DockerImageAsset(this, "ImageAssets", {
          directory: "../..",
          target: "app",
          platform: assets.Platform.LINUX_AMD64,
        }),
        imageConfiguration: {
          port: 3000,
          startCommand: "npm run startOnProduction -w packages/app",
          environment: {
            DATABASE_CREDENTIAL_SECRET_NAME:
              databaseCredentialSecret.secretName,
          },
        },
      }),
      vpcConnector: new apprunner.VpcConnector(this, "VpcConnector2", {
        vpc,
        vpcSubnets: { subnetGroupName: "app-subnet" },
      }),
      instanceRole,
    });

    new lambda.DockerImageFunction(this, "Migration", {
      code: lambda.DockerImageCode.fromImageAsset("../..", {
        cmd: [
          "npm",
          "run",
          "-w",
          "packages/app",
          "prismaOnProduction",
          "--",
          "deploy",
        ],
        target: "app",
      }),
      environment: {
        DATABASE_CREDENTIAL_SECRET_NAME: databaseCredentialSecret.secretName,
      },
      vpc,
      vpcSubnets: { subnetGroupName: "app-subnet" },
    });

    new ec2.BastionHostLinux(this, "Bastion", {
      vpc,
      subnetSelection: vpc.selectSubnets({ subnetGroupName: "app-subnet" }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.NANO
      ),
    });

    new cdk.CfnOutput(this, "URL", {
      value: service.serviceUrl,
    });
  }
}
