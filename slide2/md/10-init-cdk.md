目次

- **cdk init してみる**
- App Runner してみる
- VPC してみる
- RDS してみる
- Bastion してみる
- route53 と ACM してみる
- Tips: DB migraion を自動化する
---
前提

- node: v16
- npm: v8
---
# cdk init してみる
---
```bash
# terminal にて

mkdir playground-cdk
cd playground-cdk

npx cdk init app --language=typescript
```

Note: まずはディレクトリを掘って、initを唱えます
---
```text [|5]
├── bin # cdk.jsonの"app"で参照されている。
│   └── playground-cdk.ts
├── lib # bin/にあるファイルから参照されている。
│   └── playground-cdk-stack.ts
├── cdk.json # "app" の内容が `npx cdk` で実行される。
└── package.json
```

Note:
生成されたものを確認してみましょう（簡単のため内容を抜粋しています）

まずはcdk.jsonから見ていきます
---
```json
{
  "app": "npx ts-node --prefer-ts-exts bin/playground-cdk.ts"
  // 省略
}
```

Note:
jsonの"app"はこのようになっていると思います

ts-nodeを使ってbin/にあるファイルを実行していることがわかります
---
```text [1-2]
├── bin # cdk.jsonの"app"で参照されている。
│   └── playground-cdk.ts
├── lib # bin/にあるファイルから参照されている。
│   └── playground-cdk-stack.ts
├── cdk.json # "app" の内容が `npx cdk` で実行される。
└── package.json
```

Note:
またdirツリーに戻りまして

今度はbinの中身を確認していきます
---
```ts [|1|2]
#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { PlaygroundAwsCdkStack } from "../lib/playground-cdk-stack";

const app = new cdk.App();
new PlaygroundAwsCdkStack(app, "PlaygroundAwsCdkStack", {
  // 省略
});
```

Note:
bin/playground-cdk.tsの中身はこのようになっています

1行目を見るとts-nodeで実行するのにshebangが着いています  
いらないしmisleadなので消します

次に、ts-nodeで実行するのにsource-map-supportが使われています  
いらないので消します

このbinファイルのしごとはstackを定義していくことです
---
```text [|3-4]
├── bin # cdk.jsonの"app"で参照されている。
│   └── playground-cdk.ts
├── lib # bin/にあるファイルから参照されている。
│   └── playground-cdk-stack.ts
├── cdk.json # "app" の内容が `npx cdk` で実行される。
└── package.json
```

Note:
またもdirツリーに戻りまして

今度はbinで参照されていたlibの中身を確認していきます
---
<pre data-id="code-animation"><code data-line-numbers class="hljs" data-trim>
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
lib/playground-cdk-stack.tsの中身はこのようになっています
---
<pre data-id="code-animation"><code data-line-numbers class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // 省略
  }
}
</code></pre>

Note:
たとえばコメントアウトを開放して
---
<pre data-id="code-animation"><code data-line-numbers class="hljs" data-trim>
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sqs from "aws-cdk-lib/aws-sqs";

export class PlaygroundCdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new sqs.Queue(this, "MyQueue", {
      fifo: true,
    });
  }
}
</code></pre>

Note:
このようにクラスをnewすることで、SQSを作成するCDKをここに記述していけます
---
```text [|6]
├── bin # cdk.jsonの"app"で参照されている。
│   └── playground-cdk.ts
├── lib # bin/にあるファイルから参照されている。
│   └── playground-cdk-stack.ts
├── cdk.json # "app" の内容が `npx cdk` で実行される。
└── package.json
```

Note:
またまたdirツリーに戻りまして

最後にpackage.jsonの中身を確認していきます
---
<pre data-id="code-animation"><code data-line-numbers="|4-6" class="hljs" data-trim>
{
  "name": "playground-cdk",
  "version": "0.1.0",
  "bin": {
    "playground-cdk": "bin/playground-cdk.js"
  },
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "jest",
    "cdk": "cdk"
  },
  "devDependencies": {
    "@types/jest": "^27.5.0",
    "@types/node": "10.17.27",
    "@types/prettier": "2.6.0",
    "jest": "^27.5.1",
    "ts-jest": "^27.1.4",
    "aws-cdk": "2.27.0",
    "ts-node": "^10.7.0",
    "typescript": "~3.9.7"
  },
  "dependencies": {
    "aws-cdk-lib": "2.27.0",
    "constructs": "^10.0.0",
    "source-map-support": "^0.5.21"
  }
}
</code></pre>

Note:
こちらがpackage.jsonの中身です

binの定義があります
---
<pre data-id="code-animation"><code data-line-numbers="|5-6" class="hljs" data-trim>
{
  "name": "playground-cdk",
  "version": "0.1.0",
  "scripts": {
    "build": "tsc",
    "watch": "tsc -w",
    "test": "jest",
    "cdk": "cdk"
  },
  "devDependencies": {
    "@types/jest": "^27.5.0",
    "@types/node": "10.17.27",
    "@types/prettier": "2.6.0",
    "jest": "^27.5.1",
    "ts-jest": "^27.1.4",
    "aws-cdk": "2.27.0",
    "ts-node": "^10.7.0",
    "typescript": "~3.9.7"
  },
  "dependencies": {
    "aws-cdk-lib": "2.27.0",
    "constructs": "^10.0.0",
    "source-map-support": "^0.5.21"
  }
}
</code></pre>

Note:
いらないので消します

tscを使うscriptが定義されています
---
<pre data-id="code-animation"><code data-line-numbers="|6" class="hljs" data-trim>
{
  "name": "playground-cdk",
  "version": "0.1.0",
  "scripts": {
    "test": "jest",
    "cdk": "cdk"
  },
  "devDependencies": {
    "@types/jest": "^27.5.0",
    "@types/node": "10.17.27",
    "@types/prettier": "2.6.0",
    "jest": "^27.5.1",
    "ts-jest": "^27.1.4",
    "aws-cdk": "2.27.0",
    "ts-node": "^10.7.0",
    "typescript": "~3.9.7"
  },
  "dependencies": {
    "aws-cdk-lib": "2.27.0",
    "constructs": "^10.0.0",
    "source-map-support": "^0.5.21"
  }
}
</code></pre>

Note:
いらないので消します

cdkスクリプトが定義されています
---
<pre data-id="code-animation"><code data-line-numbers="|17-21" class="hljs" data-trim>
{
  "name": "playground-cdk",
  "version": "0.1.0",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "@types/jest": "^27.5.0",
    "@types/node": "10.17.27",
    "@types/prettier": "2.6.0",
    "jest": "^27.5.1",
    "ts-jest": "^27.1.4",
    "aws-cdk": "2.27.0",
    "ts-node": "^10.7.0",
    "typescript": "~3.9.7"
  },
  "dependencies": {
    "aws-cdk-lib": "2.27.0",
    "constructs": "^10.0.0",
    "source-map-support": "^0.5.21"
  }
}
</code></pre>

Note:
npm run cdk -- deploy よりも npx cdk deploy を使うので消します

先程使わなくなったsource-map-supportも
---
<pre data-id="code-animation"><code data-line-numbers="17-20|" class="hljs" data-trim>
{
  "name": "playground-cdk",
  "version": "0.1.0",
  "scripts": {
    "test": "jest"
  },
  "devDependencies": {
    "@types/jest": "^27.5.0",
    "@types/node": "10.17.27",
    "@types/prettier": "2.6.0",
    "jest": "^27.5.1",
    "ts-jest": "^27.1.4",
    "aws-cdk": "2.27.0",
    "ts-node": "^10.7.0",
    "typescript": "~3.9.7"
  },
  "dependencies": {
    "aws-cdk-lib": "2.27.0",
    "constructs": "^10.0.0"
  }
}
</code></pre>

Note:
消します

スッキリしました
---
以上、僕が init したときにいつもやる作業でした

- issue を立ててます
- 気が向いたら ts-node を  
  esbuild-register に置き換えたりもします
