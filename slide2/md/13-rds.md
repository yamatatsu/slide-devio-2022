### 目次

- ~~cdk init してみる~~
- ~~App Runner してみる~~
- ~~VPC してみる~~
- **RDS してみる**
- Bastion してみる
- route53 と ACM してみる
- 小ネタ `environment-agnostic` のメリデメ
---
## RDS してみる
---
```ts [|4|20-34|40|52-58]
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
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
    });

    const vpcConnector = new apprunner.VpcConnector(this, "VpcConnector", {
      vpc,
      vpcSubnets: { subnetGroupName: "app-subnet" },
    });
    database.connections.allowDefaultPortFrom(vpcConnector);

    const asset = new assets.DockerImageAsset(this, "ImageAssets", {
      directory: "./app",
      platform: assets.Platform.LINUX_AMD64,
    });

    new apprunner.Service(this, "Service", {
      source: apprunner.Source.fromAsset({
        asset: asset,
        imageConfiguration: {
          port: 3000,
          environment: {
            DB_USERNAME: database.secret!.secretValueFromJson("username").unsafeUnwrap(),
            DB_PASSWORD: database.secret!.secretValueFromJson("password").unsafeUnwrap(),
            DB_HOST: database.secret!.secretValueFromJson("host").unsafeUnwrap(),
            DB_PORT: database.secret!.secretValueFromJson("port").unsafeUnwrap(),
            DB_NAME: database.secret!.secretValueFromJson("dbname").unsafeUnwrap(),
          },
        },
      }),
      vpcConnector,
    });
  }
}
```
Note:
先程のファイルにて、

rdsをインポートし、

DatabaseClusterをnewします。

allowDefaultPortFromを使って、RDSが所属しているsecurity groupにinboundを設定します。

database.secret を用いてこのように記載することで、データベースのパスワードが保存されたsecrets managerから値を手に入れ、App Runnerに設定することができます。
---
### [RDS してみる] まとめ

- CDKを使うと、RDSのアクセスコントロールやDBユーザーに関する秘匿情報をかんたんに扱うことができます。
