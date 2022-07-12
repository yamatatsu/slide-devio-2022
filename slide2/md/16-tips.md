### 目次

- ~~cdk init してみる~~
- ~~App Runner してみる~~
- ~~VPC してみる~~
- ~~RDS してみる~~
- ~~Bastion してみる~~
- ~~route53 と ACM してみる~~
- **Tipsなど**
---

### Tipsとか小ネタ

- `environment-agnostic` のメリデメ
- GitHub Actionsでデプロイ
- 環境ごとの値の管理
---
<pre data-id="code-animation"><code data-line-numbers="|3,11" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {});

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
    });
  }
}
</code></pre>
Note:
先程のファイルにVPCを追加してみます

一旦、これで作成リソースを確認してみましょう
---
<img src="./assets/vpc-agnostic.png" height="600px" />
Note:このように、2つのAZしか使ってくれません。
---
# 🤔
Note:なぜ
---

```ts [11-13]
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      maxAzs: 3,
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
    });
  }
}
```
Note:maxAzsを足してみましょう
---
<img src="./assets/vpc-agnostic.png" height="600px" />
Note:まだ、2つのAZしか使ってくれません。
---
# 🤔
Note:なぜ
---
<img src="./assets/jsdoc-vpc-maxAzs.png" height="600px" />
Note:ドキュメントを読むと答えが書いてあります
---

```ts [|5-10]
import * as cdk from "aws-cdk-lib";
import { PlaygroundAwsCdkStack } from "../lib/playground-cdk-stack";

const app = new cdk.App();
new PlaygroundAwsCdkStack(app, "PlaygroundAwsCdkStack", {
  env: {
    account: "123456789012",
    region: "ap-northeast-1",
  },
});
```
Note:
binファイルにて、envとしてaccountとregionを指定してあげます。
---
<img src="./assets/vpc-env-specified.png" height="600px" />
Note: 🎉
---
公式 Doc: https://docs.aws.amazon.com/cdk/v2/guide/environments.html
---
<div class="r-stack">
  <img src="./assets/vpc-env-specified.png" height="600px" />
  <img class="fragment" src="./assets/vpc-env-specified-nat.png" height="600px" />
</div>
Note:
ところで、CDKのVPCではデフォルトでNat Gatewayが使われます
---

- 3AZ で 3 台の Nat Gateway
- Nat Gateway 1 台 0.062 USD/hour
- 0.062 \* 3 \* 24 \* 30 \* 135.99 = 18,212 円/月くらい
---
<pre data-id="code-animation"><code data-line-numbers="|12-17" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
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
    });
  }
}
</code></pre>
Note:
VPCの定義にて、

natGatewayProviderにnat instanceを指定することができます
---
<pre data-id="code-animation"><code data-line-numbers="|12" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      natGateways: 0,
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
    });
  }
}
</code></pre>
Note:natGatewaysに0を指定することで、Nat GatewayとInstanceの両方を作成しない設定もできます
---
<pre data-id="code-animation"><code data-line-numbers="|13-17" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", {
      natGateways: 0,
      subnetConfiguration: [
        { name: "public-subnet", subnetType: ec2.SubnetType.PUBLIC },
        { name: "app-subnet", subnetType: ec2.SubnetType.PRIVATE_WITH_NAT },
        { name: "db-subnet", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      ],
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
    });
  }
}
</code></pre>
Note:VPCはSubnet構成も指定することができます
---
<pre data-id="code-animation"><code data-line-numbers="|13-16|" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
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
    });
  }
}
</code></pre>
Note:今回は外部APIを使う要件は無いことにして、ISOLATEDを2つ用意します
