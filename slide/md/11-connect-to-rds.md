### 目次

- ~~CDK で App Runner してみる~~
- **RDS に繋いでみる**
- route53 と ACM してみる
- Tipsなど
---
## RDS に繋いでみる
---
![](./assets/press-of-vpc-connector.png) <!-- .element height="500" -->
Note: 今年の2月に、App RunnerはVPCと繋ぐことができるようになりました
---
![](./assets/apprunner-vpc-connect.png) <!-- .element height="600" -->
Note: CDKでも5月に、PRがマージされてL2として使うことができるようになりました。
---
さっそくstackの中身を修正していきます！
---
```ts [|3-4|11-24|43-46|68|26-41|47|59-65|71-75|]
import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as assets from "aws-cdk-lib/aws-ecr-assets"; 
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.NANO
        ),
      }),
      subnetConfiguration: [
        { name: "db-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 28 },
        { name: "app-subnet", subnetType: ec2.SubnetType.PRIVATE_WITH_NAT, cidrMask: 24 },
        { name: "public-subnet", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
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

    const bastion = new ec2.BastionHostLinux(this, "Bastion", {
      vpc,
      subnetSelection: vpc.selectSubnets({ subnetGroupName: "app-subnet" }),
    });
    database.connections.allowDefaultPortFrom(bastion);
  }
}
```
Note:
先程のファイルをこのように修正します。

まずは必要なモジュールをimportして、

VPCを作成して、

apprunner.VpcConnector を作成して、

apprunner.Service に渡してあげれば、これでVPCとApp Runnerを繋ぐことができます。

次に、 DatabaseCluster を作成して、

VpcConnector に対してAuroraへのアクセスを許可します。

コンテナの中で接続に使うための環境変数も定義してあげましょう。

最後に、DBを設定するための踏み台サーバーを用意します。
---
```ts []
import fastify from "fastify";
import { Pool } from "mariadb";

const app = fastify({ logger: true });
app.register(require("fastify-mariadb"), {
  host: getEnv("DB_HOST"),
  port: parseInt(getEnv("DB_PORT")),
  database: getEnv("DB_NAME"),
  user: getEnv("DB_USERNAME"),
  password: getEnv("DB_PASSWORD"),
  promise: true,
});

app.get("/", (req, res) => {
  res.send("OK");
});

app.get("/items", async (req, res) => {
  const conn = await app.mariadb.getConnection();
  const items = await conn.query("SELECT * FROM items;");
  res.send({ items });
});

app.listen({ port: 3000, host: "0.0.0.0" });

function getEnv(name: string): string {
  const val = process.env[name];
  if (!val) {
    throw new Error(`No env ${name} is found. It is needed.`);
  }
  return val;
}

declare module "fastify" {
  interface FastifyInstance {
    mariadb: Pool;
  }
}
```
Note:
アプリケーションコードはこのように修正します。

繰り返しになりますが、コンテナの中なので好きな言語、好きなフレームワークで実装していただければと思います。
---
```bash
# terminal にて

> curl https://xxxxxxxxxx.ap-northeast-1.awsapprunner.com/items
# {"items":[{"id":1,"name":"sample"}]}
```
Note:
デプロイしてみましょう

デプロイが完了したら /items を呼び出してみます。
---
### App RunnerからRDSに接続できました！ 🎉
