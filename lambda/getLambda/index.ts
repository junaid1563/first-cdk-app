import {
  DynamoDBClient,
  ExecuteStatementCommand,
} from "@aws-sdk/client-dynamodb";
import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { PostData } from "../../lib/@types/interfaces";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  const client = new DynamoDBClient({ region: process.env.REGION });
  console.log(`region : ${process.env.REGION}`);

  const command = new ExecuteStatementCommand({
    Statement: `select * from ${process.env.StudentsTable}`,
  });
  const res = await client.send(command);
  console.log(`${res} item retrived to dynamodb`);

  let outputData = [];
  const data = res.Items || [];
  for (const item of data) {
    outputData.push({
      firstname: item.firstname.S,
      lastname: item.lastname.S,
      age: item.age.N,
      class: item.class.N,
      rollNumber: item.rollNumber.N,
    });
  }
  const response = {
    statusCode: 201,
    body: JSON.stringify(outputData),
  };
  return response;
};
