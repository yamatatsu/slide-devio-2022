### 目次

- ~~cdk init してみる~~
- ~~App Runner してみる~~
- ~~VPC してみる~~
- ~~RDS してみる~~
- ~~Bastion してみる~~
- **route53 と ACM してみる**
- 小ネタ `environment-agnostic` のメリデメ
---

## route53 と ACM してみる
---

CDKからはできません [GitHub Issue](https://github.com/aws-cloudformation/cloudformation-coverage-roadmap/issues/1092)

![](./assets/gh-issue-apprunner-custom-domain.png) <!-- .element: height="500px" -->
---

### [route53 と ACM してみる] まとめ

- 手動でやろう
  - route53のCNAMEレコードを作成するのはCDKでできます！
