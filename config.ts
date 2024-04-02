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
      "arn:aws:kms:us-west-2:876567513862:key/d567964c-4c60-4a59-943b-a46607a4c7bd",
    tags: {
      // for common tags
    },
  },
};
