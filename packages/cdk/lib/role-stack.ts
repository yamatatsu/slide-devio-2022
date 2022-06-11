import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as iam from "aws-cdk-lib/aws-iam";
import { NAME_PREFIX } from "../lib/constants";

const REPO_NAME = "yamatatsu/slide-devio-2022";
// サービスに依らず固定
const ISSUER = "token.actions.githubusercontent.com";

export default class RoleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * GitHub側で定義してくれているOIDC ProviderをAWS内に定義する。
     */
    const oidcProvider = new iam.OpenIdConnectProvider(this, "OidcProvider", {
      // 以下の３つはAWSアカウント、GitHubリポジトリに依らず固定値
      url: `https://${ISSUER}`,
      clientIds: ["sts.amazonaws.com"],
      thumbprints: [
        "a031c46782e6e6c662c2c87c76da9aa62ccabd8e",
        "6938fd4d98bab03faadb97b34396831e3780aea1",
      ],
    });

    /**
     * GitHubのIdPを信頼するRole
     * デプロイに必要な権限を持つ。
     */
    new iam.Role(this, "DeployRole", {
      roleName: `${NAME_PREFIX}-deploy-role`,
      assumedBy: new iam.OpenIdConnectPrincipal(oidcProvider, {
        StringLike: { [`${ISSUER}:sub`]: `repo:${REPO_NAME}:*` },
      }),
      inlinePolicies: {
        "cdk-roles": new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["sts:AssumeRole"],
              resources: [
                // `cdk bootstrap` で生成されるroleたち
                this.roleArn("cdk-hnb659fds-cfn-exec-role-*"),
                this.roleArn("cdk-hnb659fds-deploy-role-*"),
                this.roleArn("cdk-hnb659fds-lookup-role-*"),
                this.roleArn("cdk-hnb659fds-file-publishing-role-*"),
                this.roleArn("cdk-hnb659fds-image-publishing-role-*"),
              ],
            }),
          ],
        }),
      },
    });
  }

  private roleArn(resourceName: string) {
    return this.formatArn({
      service: "iam",
      resource: "role",
      resourceName,
      region: "",
    });
  }
}
