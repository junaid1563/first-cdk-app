import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (
  event: APIGatewayEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Inside get lambda handler");

  return {
    statusCode: 200,
    body: JSON.stringify("Done"),
  };
};
