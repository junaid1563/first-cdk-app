import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { join } from "path";

export class DomainServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // importing students table arn
    const studentsTableArn = cdk.Fn.importValue("studentsTableArn");

    // lambda function code
    // policy for lambda
    const lambdaDynamoDbPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "dynamodb:BatchGetItem",
        "dynamodb:BatchWriteItem",
        "dynamodb:ConditionCheckItem",
        "dynamodb:PutItem",
        "dynamodb:DeleteItem",
        "dynamodb:PartiQLUpdate",
        "dynamodb:UpdateItem",
        "dynamodb:PartiQLSelect",
        "dynamodb:PartiQLInsert",
        "dynamodb:GetItem",
        "dynamodb:GetRecords",
        "dynamodb:PartiQLDelete",
      ],
      resources: [studentsTableArn, `${studentsTableArn}/index/*`],
    });
    // secrets mamager policy statement
    const lambdaSecretsManagerPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["secretsmanager:GetSecretValue"],
      resources: ["*"],
    });
    // lambda policy

    const lambdaPolicy = new iam.Policy(this, "lambda-dynamodb-policy", {
      statements: [
        lambdaDynamoDbPolicyStatement,
        lambdaSecretsManagerPolicyStatement,
      ],
    });

    // log group for lambda
    const lambdaLogs = new LogGroup(this, "post-lambda-logs");

    // lambda function
    const postLambdaFunction = new lambda.Function(this, "post-lambda", {
      functionName: "post-lambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("./lambda/postLambda"),
      handler: "handler",
      timeout: cdk.Duration.seconds(15),
      environment: {},
      logGroup: lambdaLogs,
    });
  }
}
