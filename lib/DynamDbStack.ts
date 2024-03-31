import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import * as kms from "aws-cdk-lib/aws-kms";
import { DynamoDbStackProps } from "./@types/interfaces";

export class DynamoDbStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DynamoDbStackProps) {
    super(scope, id, props);

    // importing kmskey ARN output
    const kmsKeyArn = cdk.Fn.importValue("kmsKeyArn");

    // kmskey from ARN value
    const dynamoDbKmsKey = kms.Key.fromKeyArn(
      this,
      "dynamodb-kms-key",
      kmsKeyArn
    );

    const dynamoDbKmsKeySr = kms.Key.fromKeyArn(
      this,
      "dynamodb-kms-key-sr",
      props.secondaryKmskeyArn
    );

    // global dynamodb table
    const StudentsTable = new dynamodb.CfnGlobalTable(this, "student-table", {
      attributeDefinitions: [
        { attributeName: "firstname", attributeType: "S" },
        {
          attributeName: "age",
          attributeType: "N",
        },
        { attributeName: "class", attributeType: "N" },
      ], // Required
      billingMode: "PAY_PER_REQUEST",
      sseSpecification: {
        sseEnabled: true,
        sseType: "KMS",
      },
      streamSpecification: {
        streamViewType: dynamodb.StreamViewType.NEW_AND_OLD_IMAGES,
      },
      globalSecondaryIndexes: [
        {
          indexName: "age_index",
          keySchema: [
            {
              attributeName: "age",
              keyType: "HASH",
            },
          ],
          projection: {
            projectionType: "KEYS_ONLY",
          },
        },
      ],
      keySchema: [
        { attributeName: "firstname", keyType: "HASH" },
        {
          attributeName: "class",
          keyType: "RANGE",
        },
      ], // Required

      replicas: [
        {
          region: "us-east-1",
          deletionProtectionEnabled: false,
          tags: [{ key: "region", value: "primary" }],
          pointInTimeRecoverySpecification: {
            pointInTimeRecoveryEnabled: true,
          },
          sseSpecification: {
            kmsMasterKeyId: dynamoDbKmsKey.keyId,
          },
        },
        {
          region: "us-west-2",
          deletionProtectionEnabled: false,
          tags: [{ key: "region", value: "secondary" }],
          pointInTimeRecoverySpecification: {
            pointInTimeRecoveryEnabled: true,
          },
          sseSpecification: {
            kmsMasterKeyId: dynamoDbKmsKeySr.keyId,
          },
        },
      ], // Required
      tableName: "studentDomain",
    });
  }
}
