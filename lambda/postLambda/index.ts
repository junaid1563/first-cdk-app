import { APIGatewayEvent, APIGatewayProxyResult } from "aws-lambda";

export const handler = async (event:APIGatewayEvent) : Promise<APIGatewayProxyResult>=> {
  // TODO implement
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
  return response;
};

