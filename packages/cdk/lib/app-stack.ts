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
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.NANO
        ),
      }),
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
        vpc,
      },
      defaultDatabaseName: "mydb",
      credentials: rds.Credentials.fromGeneratedSecret("admin"),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    const databaseCredentialSecret = database.secret!;

    const instanceRole = new iam.Role(this, "Role", {
      assumedBy: new iam.ServicePrincipal("tasks.apprunner.amazonaws.com"),
    });
    databaseCredentialSecret.grantRead(instanceRole);

    const vpcConnector = new apprunner.VpcConnector(this, "VpcConnector2", {
      vpc,
    });
    const service = new apprunner.Service(this, "Service", {
      source: apprunner.Source.fromAsset({
        asset: new assets.DockerImageAsset(this, "ImageAssets", {
          directory: "../..",
          target: "app",
          platform: assets.Platform.LINUX_AMD64,
        }),
        imageConfiguration: {
          port: 3000,
          environment: {
            DATABASE_CREDENTIAL_SECRET_NAME:
              databaseCredentialSecret.secretName,
          },
        },
      }),
      vpcConnector,
      instanceRole,
    });
    database.connections.allowDefaultPortFrom(vpcConnector);

    const migrator = new lambda.DockerImageFunction(this, "Migration", {
      code: lambda.DockerImageCode.fromImageAsset("../..", {
        target: "migration",
      }),
      timeout: cdk.Duration.minutes(10),
      environment: {
        DATABASE_CREDENTIAL_SECRET_NAME: databaseCredentialSecret.secretName,
      },
      vpc,
    });
    database.connections.allowDefaultPortFrom(migrator);

    new ec2.BastionHostLinux(this, "Bastion", {
      vpc,
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
