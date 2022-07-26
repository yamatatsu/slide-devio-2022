### 目次

- **CDK で App Runner してみる**
- RDS に繋いでみる
- カスタムドメインを設定してみる
- Tipsなど
---
# CDK で App Runner してみる
---
```bash
# terminal にて

> mkdir playground-cdk
> cd playground-cdk
> 
> npx cdk init app --language=typescript
```

Note: まずはディレクトリを掘って、initを唱えます

この **npx cdk init** を唱えると、ボイラープレートを用いてCDKの環境を初期化してくれます。
---
```text [|4-5]
.
├── bin
│   └── playground-cdk.ts
├── lib
│   └── playground-cdk-stack.ts
├── cdk.json
├── package.json
├── package-lock.json
└── tsconfig.json
```

Note:
こんな感じの構成が生成されます。（一部省略）

このlib配下のファイルにAWSの構成を記述していきます。  
今回は簡単のため、stackは増やさずに、一つのstackにドカドカリソースを詰めていきます。
---
さっそく、lib/playground-cdk-stack.tsを編集！
---
するまえに
---
```bash
# terminal にて

> npm install @aws-cdk/aws-apprunner-alpha
```
Note:
今回作成するApp RunnerのL2コンストラクタ、aws-apprunner-alpha をインストールします

aws-apprunner-alphaを含む、experimental modulesと呼ばれるalpha版のモジュールはaws-cdk-libにパッケージされていません。

ほかのexperimental modulesの例:

- aws-apigatewayv2
- aws-appsync
- aws-kinesisfirehose
- aws-lambda-go
- aws-lambda-python
- aws-iot
- aws-iotevents
---
installができたら、今度こそstackを編集！
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
<pre data-id="code-animation"><code data-line-numbers="|3-4|10-13|15-24" class="hljs" data-trim>
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
このように変更します。

必要なモジュールをimportして、

assets.DockerImageAsset を使ってデプロイするコンテナイメージを指定して、

apprunner.Service を使ってデプロイするApp Runnerを定義します。
---
```ts [|9]
import fastify from "fastify";

const app = fastify({ logger: true });

app.get("/", (req, res) => {
  res.send("OK");
});

app.listen({ port: 3000, host: "0.0.0.0" });
```
Note:
docker containerの中身はportさえ合ってれば何でもいいです。

サンプルでは fastify を使ってみました。
---
```docker [|10]
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
```
Note:
デプロイしてみましょう
---
```bash
# terminal にて

> curl https://xxxxxxxxxx.ap-northeast-1.awsapprunner.com
# OK
```
Note:
デプロイが完了したら疎通してみます。
---
### App Runner できた 🎉
