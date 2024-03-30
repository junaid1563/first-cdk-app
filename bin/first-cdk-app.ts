#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/DynamDbStack";
import { DynamoDbKmsKeyStack } from "../lib/DynamoDbKmsKeyStack";

const app = new cdk.App();
const envConfig = {
  account: "876567513862",
  region: "us-east-1",
};

const DynamoDbKmsKeyStackPrimmary = new DynamoDbKmsKeyStack(
  app,
  "kms-key-stack",
  {
    env: envConfig,
  }
);

const DynamoDbStackPrimary = new DynamoDbStack(app, "dynamodb-stack", {
  env: envConfig,
});

DynamoDbStackPrimary.addDependency(DynamoDbKmsKeyStackPrimmary);
