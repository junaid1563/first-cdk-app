#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/DynamDbStack";
import { DynamoDbKmsKeyStack } from "../lib/DynamoDbKmsKeyStack";

const app = new cdk.App();
const envConfigPr = {
  account: "876567513862",
  region: "us-east-1",
};

const envConfigSr = {
  account: "876567513862",
  region: "us-west-2",
};


const DynamoDbKmsKeyStackPrimary = new DynamoDbKmsKeyStack(
  app,
  "kms-key-stackPr",
  {
    env: envConfigPr,
  }
);
const DynamoDbKmsKeyStackSecondary = new DynamoDbKmsKeyStack(
  app,
  "kms-key-stackSr",
  {
    env: envConfigSr,
  }
);

const DynamoDbStackPrimary = new DynamoDbStack(app, "dynamodb-stack", {
  env: envConfigPr,
});

DynamoDbStackPrimary.addDependency(DynamoDbKmsKeyStackPrimary);
DynamoDbStackPrimary.addDependency(DynamoDbKmsKeyStackSecondary);
