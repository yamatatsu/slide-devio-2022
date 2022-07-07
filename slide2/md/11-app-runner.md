### 目次

- ~~cdk init してみる~~
- **App Runner してみる**
- VPC してみる
- RDS してみる
- Bastion してみる
- DB migraion してみる
- route53 と ACM してみる
- 小ネタ `environment-agnostic` のメリデメ
---
## App Runner してみる
---
```bash
# terminal にて

> npm i -S @aws-cdk/aws-apprunner-alpha
```
Note:
aws-apprunner-alpha をインストールします

experimental modulesと呼ばれるalpha版のモジュールはaws-cdk-libにパッケージされていません。

ほかのexperimental modulesの例:

- aws-apigatewayv2
- aws-appsync
- aws-kinesisfirehose
- aws-lambda-go
- aws-lambda-python
- aws-iot
- aws-iotevents
---
<pre data-id="code-animation"><code data-line-numbers="" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 省略
  }
}
</code></pre>
Note:
こんな感じになってる lib/playground-cdk-stack.ts を
---
<pre data-id="code-animation"><code data-line-numbers="|3-4|10-13|15-22|" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
このように変更します
---
<pre data-id="code-animation"><code data-line-numbers="|22-23" class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as assets from "aws-cdk-lib/aws-ecr-assets";
import * as apprunner from "@aws-cdk/aws-apprunner-alpha";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

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
      cpu: apprunner.Cpu.TWO_VCPU,
      memory: apprunner.Memory.FOUR_GB,
    });
  }
}
</code></pre>
Note:
cpuやmemoryを指定することもできます
---
```ts
import fastify from "fastify";

const app = fastify({ logger: true });

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen({ port: 3000, host: "0.0.0.0" });
```
Note:
docker containerの中身はportさえ合ってれば何でもいいのです。

サンプルとしては fastify を使ってみました。
---
```docker
FROM node:16

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 3000
CMD npm start
```
Note:
dockerfileはこんな感じ
---
```bash
# terminal にて

> npx cdk deploy

> curl https://xxxxxxxxxx.ap-northeast-1.awsapprunner.com
# OK
```
Note:
デプロイしてみましょう

デプロイが完了したら疎通してみます。
---
### [App Runner してみる] まとめ

- App Runner 便利！
