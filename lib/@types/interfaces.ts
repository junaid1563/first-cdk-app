import * as cdk from "aws-cdk-lib";

export interface DynamoDbStackProps extends cdk.StackProps {
  secondaryKmskeyArn: string;
}

export interface KmsKeyProps extends cdk.StackProps {}

export interface PostData {
  firstname: string;
  lastname: string;
  class: number;
  age: number;
  rollNumber: number;
}
