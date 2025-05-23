import {
  DynamoDBClient,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

//AWS configurations
const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

const headers = {
  "Access-Control-Allow-Headers":
    "Content-Type,Authorization,X-Api-Key,X-Requested-With",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
};

const response = (statusCode = 200, body) => {
  console.log("return with:", {
    statusCode,
    headers,
    body,
  });
  return {
    statusCode,
    headers,
    body,
  };
};

// input event format:
//   { jobid: jobid, tableName: tableName }
export const handler = async (event) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));

  console.log(
    "event.requestContext.http.method: ",
    event.requestContext.http.method,
  );

  // get users csv content from dynamodb table.
  // table index is event.jobid, table name is event.tableName
  // get the csv content from dynamodb table, and convert to csv content string.
  const getUserData = async (jobid, tableName) => {
    const params = {
      TableName: tableName,
      Key: {
        jobid: {
          S: jobid,
        },
      },
    };
    const res = await dynamodb.send(new GetItemCommand(params));

    if (res.Item) {
      let failedUsersNumber = 0;
      let FailureDetails = [];

      const params = {
        Bucket: process.env.IMPORTUSERS_BUCKET,
        Key: `jobs/${jobid}_result`,
      };
      const command = new GetObjectCommand(params);
      try {
        const response = await s3.send(command);
        const body = await response.Body.transformToString();
        if (body) {
          JSON.parse(body).map((item) => {
            failedUsersNumber++;
            FailureDetails.push(item);
          });
        }
      } catch (e) {
        console.log("error", e);
      }

      return {
        id: res.Item.jobid.S,
        JobId: res.Item.jobid.S,
        CreationDate: new Date(parseInt(res.Item.timestamp.N)).toUTCString(),
        ...(res.Item.completiondate && {
          CompletionDate: new Date(
            parseInt(res.Item.completiondate.N),
          ).toUTCString(),
        }),
        Status: res.Item.jobstatus.S,
        FailedUsers: failedUsersNumber,
        FailureDetails,
        TotalUsers: res.Item.totalusers?.N,
        userpoolid: res.Item.userpoolid.S,
        CreatedBy: res.Item.createdby.S,
        notify: res.Item.notify.BOOL,
      };
    }

    return { id: jobid };
  };

  const deleteUserData = async (jobid, tableName) => {
    let params = {
      TableName: tableName,
      Key: {
        jobid: {
          S: jobid,
        },
      },
    };
    let command = new DeleteItemCommand(params);
    let res = await dynamodb.send(command);

    params = {
      Bucket: process.env.IMPORTUSERS_BUCKET,
      Key: `jobs/${jobid}_result`,
    };

    command = new DeleteObjectCommand(params);
    res = await s3.send(command);
    console.log("delete success");

    return { id: jobid };
  };

  // For each user info, call cognito adminCreateUser API to create user in the userpool - process.env.USERPOOL_ID
  // Count and record successful users amount, count and record failed users amount and faild users' name in an array.
  try {
    switch (event.requestContext.http.method) {
      case "GET":
        const getResult = await getUserData(
          event.pathParameters?.id,
          process.env.IMPORTUSERS_JOB_ID_TABLE,
        );
        return response(200, JSON.stringify({ data: getResult }));
      case "DELETE":
        const deleteResult = await deleteUserData(
          event.pathParameters?.id,
          process.env.IMPORTUSERS_JOB_ID_TABLE,
        );
        return response(200, JSON.stringify({ data: deleteResult }));
      case "OPTIONS":
        return response(200, JSON.stringify({ data: "ok" }));
      default:
        return response(404, JSON.stringify({ data: "Not Found" }));
    }
  } catch (e) {
    console.log("Catch an error: ", e);
  }

  return {
    statusCode: 500,
    headers,
    body: JSON.stringify({ type: "exception", message: "Service Error" }),
  };
};
