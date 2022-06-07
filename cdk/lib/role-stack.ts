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
      thumbprints: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
    });

    /**
     * GitHubのIdPを信頼するRole
     * デプロイに必要な権限を持つ。
     */
    new iam.Role(this, "DeployRole", {
      roleName: `${NAME_PREFIX}-deploy-role`,
      assumedBy: new iam.FederatedPrincipal(
        oidcProvider.openIdConnectProviderArn,
        { StringLike: { [`${ISSUER}:sub`]: `repo:${REPO_NAME}:*` } },
        "sts:AssumeRoleWithWebIdentity"
      ),
      managedPolicies: [
        // iam.ManagedPolicy.fromAwsManagedPolicyName(
        //   "AWSCloudFormationFullAccess"
        // ),
        // iam.ManagedPolicy.fromAwsManagedPolicyName("AWSLambda_FullAccess"),
        // iam.ManagedPolicy.fromAwsManagedPolicyName("IAMFullAccess"),
        // iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonS3FullAccess"),
        // iam.ManagedPolicy.fromAwsManagedPolicyName("AWSIoTFullAccess"),
        // iam.ManagedPolicy.fromAwsManagedPolicyName("CloudWatchFullAccess"),
        // iam.ManagedPolicy.fromAwsManagedPolicyName("AWSIoTEventsFullAccess"),
      ],
    });
  }
}
