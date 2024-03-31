import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { PostData } from "../../lib/@types/interfaces";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  // TODO implement
  const client = new DynamoDBClient({ region: process.env.REGION });
  console.log(`region : ${process.env.REGION}`);

  const data: PostData = JSON.parse(event?.body!);
  console.log(`Data from post api : ${JSON.stringify(data)}`);
  if (
    !data.firstname ||
    !data.age ||
    !data.class ||
    !data.lastname ||
    !data.rollNumber
  ) {
    return {
      statusCode: 406,
      body: "Please enter correct data",
    };
  }

  const input = {
    TableName: process.env.StudentsTable,
    Item: {
      firstname: {
        S: data.firstname,
      },
      lastname: {
        S: data.lastname,
      },
      class: {
        N: String(data.class),
      },
      age: {
        N: String(data.age),
      },
      rollNumber: {
        N: String(data.rollNumber),
      },
    },
  };
  const command = new PutItemCommand(input);
  const res = await client.send(command);
  console.log(`${res} item added to dynamodb`);

  const response = {
    statusCode: 201,
    body: JSON.stringify(
      `${JSON.stringify(input)} has been added to StudentsTable`
    ),
  };
  return response;
};
