export const config: any = {
  env: {
    account: "876567513862",
    region: "us-east-1",
    regionDr: "us-west-2",
  },
  app: {
    //common app properties
    appName: "first-cdk-app",
    secondaryKmskeyArn:
      "arn:aws:kms:us-west-2:876567513862:key/be75405d-f5a5-4bdb-b7d9-af64dd114a21",
    tags: {
      // for common tags
    },
  },
};
