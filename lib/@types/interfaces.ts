import * as cdk from "aws-cdk-lib";

export interface DynamoDbStackProps extends cdk.StackProps {
  secondaryKmskeyArn: string;
}

export interface KmsKeyProps extends cdk.StackProps {}
