//AWS configurations
import {
  CognitoIdentityProviderClient,
  DescribeUserImportJobCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key,Content-Range,X-Requested-With",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
};

export const handler = async (event) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));

  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Successful preflight call." }),
    };
  }

  if (event.httpMethod !== "POST" || !event.body) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ message: "Invalid HTTP method." }),
    };
  }

  try {
    const body = JSON.parse(event.body);


    if (body.action === "queryUserImport") {
      //query user import job status
      const params = {
        JobId: body.job_id,
        UserPoolId: userPoolId,
      };
      const command = new DescribeUserImportJobCommand(params);
      const response = await client.send(command);
      const result = response.UserImportJob;
      console.log("Query job status", reponse);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ result }),
      };
    }
  } catch (e) {
    console.log("Catch an error: ", e);
    switch (e.name) {
      case "ThrottlingException":
        errMsg = { type: "exception", message: "Too many requests" };
        break;
      case "InvalidParameterValue":
      case "InvalidParameterException":
        errMsg = { type: "exception", message: "Invalid parameter" };
        break;
      default:
        errMsg = { type: "exception", message: "Service Error" };
        break;
    }
  }

  // TODO implement
  const response = {
    statusCode: 500,
    body: JSON.stringify(errMsg),
  };
  return response;
};
