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
### `environment-agnostic` のメリデメ
---
```ts [5]
export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ec2.Vpc(this, "Vpc", {});
  }
}
```
Note:
VPCを作成するだけのStackについて考えてみる。
---
<img src="./assets/vpc-agnostic.png" height="600px" />
Note:このように、2つのAZしか使ってくれません。
---
# 🤔
---

```ts [5-7]
export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ec2.Vpc(this, "Vpc", {
      maxAzs: 3,
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
---
<img src="./assets/jsdoc-vpc-maxAzs.png" height="600px" />
Note:ドキュメントを読むと答えが書いてあります

---
`environment-agnostic` とは
---
```ts
// environment agnostic
new MyStack(app, 'MyStack', {})

// environment specified
new MyStack(app, 'MyStack', {
  env: {
    account: '123456789012',
    region: 'ap-northeast-1',
  },
})
```
Notes:
propsにてenvを指定していないstackのこと。

デプロイについて柔軟であるが、デプロイ先間違える事故につがなることも。

加えて、リージョンのAZをフル活用してくれない問題がある。
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
<pre data-id="code-animation"><code data-line-numbers="|6-11|" class="hljs" data-trim>
export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ec2.Vpc(this, "Vpc", {
      natGatewayProvider: ec2.NatProvider.instance({
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T3,
          ec2.InstanceSize.NANO
        ),
      }),
    });
  }
}
</code></pre>
Note:
VPCの定義にて、

natGatewayProviderにnat instanceを指定することができます
---
<pre data-id="code-animation"><code data-line-numbers="|6" class="hljs" data-trim>
export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ec2.Vpc(this, "Vpc", {
      natGateways: 0,
    });
  }
}
</code></pre>
Note:natGatewaysに0を指定することで、Nat GatewayとInstanceの両方を作成しない設定もできます
---
