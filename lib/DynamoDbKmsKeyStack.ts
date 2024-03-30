import * as cdk from "aws-cdk-lib";
import * as kms from "aws-cdk-lib/aws-kms";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class DynamoDbKmsKeyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // policy for kms key
    // add dynamo db policies

    // const dynamoDBPolicy = new iam.Policy(this, "dynamodb-policy", {
    //   statements: [
    //     new iam.PolicyStatement({
    //       effect: iam.Effect.ALLOW,
    //       actions: [
    //         "dynamodb:BatchGetItem",
    //         "dynamodb:BatchWriteItem",
    //         "dynamodb:PutItem",
    //         "dynamodb:RestoreTableToPointInTime",
    //         "dynamodb:CreateTableReplica",
    //         "dynamodb:Query",
    //         "dynamodb:UpdateGlobalTable",
    //         "dynamodb:UpdateItem",
    //         "dynamodb:ListGlobalTables",
    //         "dynamodb:DescribeGlobalTable",
    //         "dynamodb:RestoreTableFromBackup",
    //         "dynamodb:GetItem",
    //         "dynamodb:CreateGlobalTable",
    //       ],
    //     }),
    //   ],
    // });

    const kmsKey = new kms.CfnKey(this, "key", {
      description: "kms key for dynamodb table data encryption",
      enableKeyRotation: false,
      enabled: true,
      multiRegion: false,
      pendingWindowInDays: 2,
      tags: [
        {
          key: "region",
          value: cdk.Stack.of(this).region,
        },
      ],
    });

    // output kmskey arn
    
    new cdk.CfnOutput(this, "kms-keyid-arn", {
      value: kmsKey.attrArn,
      description: "arn for kms key",
      exportName: "kmsKeyArn",
    });
  }
}
