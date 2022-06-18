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
        { name: "app-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
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
        vpc,
        vpcSubnets: { subnetGroupName: "db-subnet" },
      },
      defaultDatabaseName: "mydb",
      credentials: rds.Credentials.fromGeneratedSecret("admin"),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const dbSecret = database.secret!;
    const dbEnvs = {
      DB_USERNAME: dbSecret.secretValueFromJson("username").unsafeUnwrap(),
      DB_PASSWORD: dbSecret.secretValueFromJson("password").unsafeUnwrap(),
      DB_HOST: dbSecret.secretValueFromJson("host").unsafeUnwrap(),
      DB_PORT: dbSecret.secretValueFromJson("port").unsafeUnwrap(),
      DB_NAME: dbSecret.secretValueFromJson("dbname").unsafeUnwrap(),
    };

    const vpcConnector = new apprunner.VpcConnector(this, "VpcConnector2", {
      vpc,
      vpcSubnets: { subnetGroupName: "app-subnet" },
    });
    database.connections.allowDefaultPortFrom(vpcConnector);
    new apprunner.Service(this, "Service", {
      source: apprunner.Source.fromAsset({
        asset: new assets.DockerImageAsset(this, "ImageAssets", {
          directory: "../..",
          target: "app",
          platform: assets.Platform.LINUX_AMD64,
        }),
        imageConfiguration: {
          port: 3000,
          environment: dbEnvs,
        },
      }),
      vpcConnector,
    });

    const migrator = new lambda.DockerImageFunction(this, "Migration", {
      code: lambda.DockerImageCode.fromImageAsset("../..", {
        target: "migration",
      }),
      timeout: cdk.Duration.minutes(10),
      environment: dbEnvs,
      vpc,
      vpcSubnets: { subnetGroupName: "app-subnet" },
    });
    database.connections.allowDefaultPortFrom(migrator);

    const bastion = new ec2.BastionHostLinux(this, "Bastion", {
      vpc,
      subnetSelection: vpc.selectSubnets({ subnetGroupName: "app-subnet" }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.NANO
      ),
    });
    database.connections.allowDefaultPortFrom(bastion);
  }
}
