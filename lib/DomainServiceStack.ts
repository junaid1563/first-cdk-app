import { Construct } from "constructs";
import * as cdk from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as iam from "aws-cdk-lib/aws-iam";
import { LogGroup } from "aws-cdk-lib/aws-logs";
import { join } from "path";
import { HttpMethod } from "aws-cdk-lib/aws-events";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Queue } from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class DomainServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // importing students table arn
    const studentsTableArn = cdk.Fn.importValue("studentsTableArn");

    // environment variable
    const environment = {
      REGION: cdk.Stack.of(this).region,
      StudentsTable: "studentDomain",
    };
    // sqs queue - main queue

    const dlq = new Queue(this, "DLQ-queue", {
      queueName: "DLQueue",
      visibilityTimeout: cdk.Duration.minutes(5),
      retentionPeriod: cdk.Duration.days(1),
    });

    const mainQueue = new Queue(this, "main-queue", {
      queueName: "mainQueue",
      visibilityTimeout: cdk.Duration.minutes(5),
      deadLetterQueue: { queue: dlq, maxReceiveCount: 2 },
      retentionPeriod: cdk.Duration.days(1),
    });

    const sqsLambdaFunction = new NodejsFunction(this, "sqs-lambda", {
      functionName: "sqs-lambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join("./lambda/sqsLambda/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(15),
      environment: { ...environment, queueUrl: mainQueue.queueUrl },
    });

    sqsLambdaFunction.addEventSource(new SqsEventSource(mainQueue));

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

    // kms policy statement
    const lambdaKMSPolicyStatement = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ["kms:Encrypt", "kms:Decrypt"],
      resources: ["*"],
    });

    // lambda policy

    const lambdaPolicy = new iam.Policy(this, "lambda-dynamodb-policy", {
      statements: [
        lambdaDynamoDbPolicyStatement,
        lambdaSecretsManagerPolicyStatement,
        lambdaKMSPolicyStatement,
      ],
    });

    // log group for lambda
    const postLambdaLogs = new LogGroup(this, "post-lambda-logs");

    const getLambdaLogs = new LogGroup(this, "get-lambda-logs");

    // lambda function
    const postLambdaFunction = new NodejsFunction(this, "post-lambda", {
      functionName: "post-lambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join("./lambda/postLambda/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(15),
      environment: environment,
      logGroup: postLambdaLogs,
    });

  

    const getLambdaFunction = new NodejsFunction(this, "get-lambda", {
      functionName: "get-lambda",
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: join("./lambda/getLambda/index.ts"),
      handler: "handler",
      timeout: cdk.Duration.seconds(15),
      environment: environment,
      logGroup: getLambdaLogs,
    });

    // attach policy

    postLambdaFunction.role?.attachInlinePolicy(
      new iam.Policy(this, "sqs-lambdaPolicy", {
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ["sqs:SendMessage"],
            resources: ["*"],
          }),
        ],
      })
    );

    sqsLambdaFunction.role?.attachInlinePolicy(lambdaPolicy);
    getLambdaFunction.role?.attachInlinePolicy(lambdaPolicy);
    // api gateway

    const api = new apigateway.RestApi(this, "dynamodb-api", {
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      description: "Rest api for dynamodb operatios",
    });

    // resource
    const addStudentResource = api.root.addResource("add-student");
    const getStudentResource = api.root.addResource("get-student");

    // lambda integration

    const postLambdaIntegration = new apigateway.LambdaIntegration(
      postLambdaFunction
    );

    const getLambdaIntegration = new apigateway.LambdaIntegration(
      getLambdaFunction
    );

    // method
    addStudentResource.addMethod(HttpMethod.POST, postLambdaIntegration);
    getStudentResource.addMethod(HttpMethod.GET, getLambdaIntegration);
  }
}
