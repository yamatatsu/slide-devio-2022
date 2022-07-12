### 目次

- ~~cdk init してみる~~
- ~~App Runner してみる~~
- ~~VPC してみる~~
- ~~RDS してみる~~
- ~~Bastion してみる~~
- **route53 と ACM してみる**
- Tipsなど
---

## route53 と ACM してみる
---

CDKからはできません [GitHub Issue](https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/1092)

![](./assets/gh-issue-apprunner-custom-domain.png) <!-- .element: height="500px" -->
Notes:
何ができないかというと、ACMの証明書をApp Runnerに設定するのができない。

CDKを用いて以下を行うことはできます！
- ACMの証明書を作成する
- ACMの証明書をALBやAPI GatewayやCloudFrontに紐付ける
- route53のレコードを設定する
---

### [route53 と ACM してみる] まとめ

- 手動でやろう
