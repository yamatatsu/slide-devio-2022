import { execSync } from "child_process";

export const handler = async (event) => {
  // console.log(JSON.stringify(event))
  // const physicalResourceId =
  //   event.ResourceProperties.physicalResourceId ??
  //   "ef681fe1-aa6b-40f2-bee0-50033201ae69"

  // if (event.RequestType === "Delete") {
  //   return {
  //     PhysicalResourceId: physicalResourceId,
  //   }
  // }
  const { DB_USERNAME, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

  const stdout = execSync("prisma migrate deploy", {
    env: {
      ...process.env,
      DATABASE_URL: `mysql://${DB_USERNAME}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    },
  });
  console.log(stdout.toString());
  // return {
  //   PhysicalResourceId: physicalResourceId,
  // }
};
