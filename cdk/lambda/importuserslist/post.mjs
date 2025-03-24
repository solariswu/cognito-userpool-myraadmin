import {
  CreateUserImportJobCommand,
  StartUserImportJobCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key,Content-Range,X-Requested-With",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
};

export const postResData = async (data, client) => {
  console.log("postResData Input:", data);
  const UserPoolId = process.env.USERPOOL_ID;

  if (data.action === "getS3SignedUrl") {
    console.log("Creating Import job");
    const params = {
      CloudWatchLogsRoleArn: process.env.CW_IAM_ROLE,
      JobName: "adminportalCreation",
      UserPoolId,
    };
    const command = new CreateUserImportJobCommand(params);
    let response = await client.send(command);
    const s3SignedUrl = response.UserImportJob?.PreSignedUrl;
    const job_id = response.UserImportJob?.JobId;
    console.log("Presigned Url: ", s3SignedUrl);
    if (s3SignedUrl) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ s3SignedUrl, job_id }),
      };
    } else {
      console.log("Failed to create import job. Service Response", response);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ message: "Failed to create import job." }),
      };
    }
  }

  if (data.action === "startimportjob") {
    const params = {
      JobId: data.job_id,
      UserPoolId,
    };
    const command = new StartUserImportJobCommand(params);
    let response = await client.send(command);
    console.log("Start Import Job Response: ", response);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Import job started." }),
    };
  }

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({
      message: "Unknow request received in import user.",
    }),
  };
};

export default postResData;
