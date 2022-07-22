const ENV_NAMES = ["dev", "stg", "prd"] as const;
type EnvName = typeof ENV_NAMES[number];
export const envName = (process.env.ENV_NAME as EnvName) || "dev";
if (!ENV_NAMES.includes(envName)) {
  throw Error(`Bad ENV_NAME '${envName}'`);
}

// 型を用意
type EnvValues = {
  wafArn: string;
  domainName: string;
};

// anyではなくstringとして環境ごとの値を定義できる。
const envValueMap: Record<EnvName, EnvValues> = {
  dev: {
    wafArn: "<dev環境のWAFのARN>",
    domainName: "dev.yamatatsu.dev",
  },
  stg: {
    wafArn: "<stg環境のWAFのARN>",
    domainName: "stg.yamatatsu.dev",
  },
  prd: {
    wafArn: "<prd環境のWAFのARN>",
    domainName: "yamatatsu.dev",
  },
};
export const env = envValueMap[envName];

// 文字列結合した値とかも用意できる
export const stackPrefix = `${envName}PlayAppRunner`;
