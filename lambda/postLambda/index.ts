import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PostData } from "../../lib/@types/interfaces";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  // TODO implement

  console.log(`region : ${process.env.REGION}`);

  const data: PostData = JSON.parse(event?.body!);
  console.log(`Data from post api : ${JSON.stringify(data)}`);

  const client = new SQSClient({ region: process.env.REGION });

  const command = new SendMessageCommand({
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/876567513862/mainQueue",
    MessageBody: JSON.stringify(data),
  });
  const res = await client.send(command);

  const response = {
    statusCode: 201,
    body: JSON.stringify(
      `${JSON.stringify("Data sent to queue")} has been added to StudentsTable`
    ),
  };
  return response;
};
