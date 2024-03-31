#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "../lib/DynamDbStack";
import { DynamoDbKmsKeyStack } from "../lib/DynamoDbKmsKeyStack";
import merge = require("lodash.merge");
import { config } from "../config";

const app = new cdk.App();
const envConfigPr = {
  account: "876567513862",
  region: "us-east-1",
};

const envConfigSr = {
  account: "876567513862",
  region: "us-west-2",
};

const appCofigPr = merge({ env: envConfigPr }, config.app);
const appCofigSr = merge({ env: envConfigSr }, config.app);

console.log(`appConfigPr ${JSON.stringify(appCofigPr)}`);
console.log(`appConfigSr ${JSON.stringify(appCofigSr)}`);

const DynamoDbKmsKeyStackPrimary = new DynamoDbKmsKeyStack(
  app,
  "kms-key-stackPr",
  appCofigPr
);
const DynamoDbKmsKeyStackSecondary = new DynamoDbKmsKeyStack(
  app,
  "kms-key-stackSr",
  appCofigSr
);

const DynamoDbStackPrimary = new DynamoDbStack(
  app,
  "dynamodb-stack",
  appCofigPr
);

DynamoDbStackPrimary.addDependency(DynamoDbKmsKeyStackPrimary);
DynamoDbStackPrimary.addDependency(DynamoDbKmsKeyStackSecondary);
