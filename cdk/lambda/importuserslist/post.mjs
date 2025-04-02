import * as crypto from "crypto";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key,Content-Range,X-Requested-With",
  "Access-Control-Allow-Credentials": true,
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
};

const lambda = new LambdaClient({ region: process.env.AWS_REGION });

const genImportUsersJob = async (
  userPoolId,
  userData,
  admin,
  notify,
  dynamodb,
) => {
  console.log("generating user import job id for userpool id:", userPoolId);

  const jobid = crypto.randomUUID();
  const timestamp = Date.now();
  console.log ('userData', userData)

  const params = {
    Item: {
      jobid: {
        S: jobid,
      },
      userdata: {
        S: JSON.stringify(userData),
      },
      notify: {
        BOOL: notify,
      },
      jobstatus: {
        S: "PENDING",
      },
      userpoolid: {
        S: userPoolId,
      },
      createdby: {
        S: admin ? admin : '',
      },
      timestamp: {
        N: `${timestamp}`,
      },
      ttl: {
        N: `${parseInt(timestamp / 1000 + 3600 * 24 * 7)}`, //7 days
      },
    },
    ReturnConsumedCapacity: "TOTAL",
    TableName: process.env.IMPORTUSERS_JOB_ID_TABLE,
  };

  console.log ("params:", params)
  const putItemCommand = new PutItemCommand(params);
  const results = await dynamodb.send(putItemCommand);
  console.log("user import job id creation result:", results);

  return jobid;
};

export const postResData = async (data, userpoolId, dynamodbISP) => {
  try {
    const jobid = await genImportUsersJob(
      userpoolId,
      data.userData,
      data.admin,
      data.notify,
      dynamodbISP,
    );

    // start worker lambda with event type
    console.log("start worker lambda with event type");

    const command = new InvokeCommand({
      FunctionName: process.env.IMPORTUSERS_WORKER_LAMBDA,
      InvocationType: "Event",
      Payload: JSON.stringify({
        jobid: jobid,
        tableName: process.env.IMPORTUSERS_JOB_ID_TABLE,
      }),
    });

    const response = await lambda.send(command);
    console.log("start worker lambda response:", response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "Import job started.", JobId: jobid }),
    };
  } catch (e) {
    console.log("Catch an error: ", e);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ message: "Failed to start import job." }),
    };
  }
};

export default postResData;
