import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import { SQSEvent } from "aws-lambda";
import { PostData } from "../../lib/@types/interfaces";

export const handler = async (event: SQSEvent) => {
  // TODO implement
  const dataObject = event.Records;
  let dat;
  for (const record of dataObject) {
    dat = JSON.parse(record.body);
  }
  let data: PostData = dat;
  console.log(`Data in sqs lambda : ${JSON.stringify(data)}`);

  const client = new DynamoDBClient({ region: process.env.REGION });
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
      `${JSON.stringify(
        "Sent message to main queue"
      )} has been added to StudentsTable`
    ),
  };
  return response;
};
