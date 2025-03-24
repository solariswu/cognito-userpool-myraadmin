//AWS configurations

import {
  ListUserImportJobsCommand,
  CognitoIdentityProviderClient
} from "@aws-sdk/client-cognito-identity-provider";

import postResData from "./post.mjs";

const cognitoISP = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const handler = async (event) => {
  console.info("EVENT\n" + JSON.stringify(event, null, 2));

  //To get the list of Users in aws Cognito
  let params = {};
  let filter = {};
  let filterString = "";

  let errMsg = { type: "exception", message: "Service Error" };

  try {
    if (
      event.requestContext.http.method === "POST" &&
      (!event.queryStringParameters || !event.queryStringParameters.page)
    ) {
      // invite new user
      const body = JSON.parse(event.body);
      console.log("POST data: ", body);
      const postResult = await postResData(body, cognitoISP);
      return postResult;
    } else {
      let PaginationToken = null;

      if (
        event.queryStringParameters &&
        event.queryStringParameters.page &&
        parseInt(event.queryStringParameters.page) > 1 &&
        event.body
      ) {
        PaginationToken = event.body;
      }

      if (
        event.queryStringParameters &&
        event.queryStringParameters.page &&
        parseInt(event.queryStringParameters.page) > 1 &&
        !event.body
      ) {
        const start =
          (parseInt(event.queryStringParameters.page) - 1) *
          parseInt(event.queryStringParameters.perPage) +
          1;
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Headers":
              "Content-Type,Authorization,X-Api-Key,Content-Range,X-Requested-With",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
            "Access-Control-Expose-Headers": "Content-Range",
            "Content-Range": `importuserslist ${start}-${start}/${0}`,
          },
          body: JSON.stringify({
            data: [],
            pageInfo: {
              hasPreviousPage: true,
              hasNextPage: false,
            },
            PaginationToken: null,
          }),
        };
      }

      let listUserImportData = {};
      let usersCount = 0;
      if (event.queryStringParameters && event.queryStringParameters.filter) {
        filter = JSON.parse(event.queryStringParameters.filter);
      }

      if (Object.keys(filter).includes("given_name")) {
        filterString = 'given_name ^= "' + filter["given_name"] + '"';
      }

      if (Object.keys(filter).includes("family_name")) {
        filterString = 'family_name ^= "' + filter["family_name"] + '"';
      }

      if (Object.keys(filter).includes("email")) {
        filterString = 'email ^= "' + filter["email"] + '"';
      }

      console.log("filterString", filterString);
      console.log("filter", filter);
      //Saving the Pagination token for each page in obj

      params = {
        UserPoolId: process.env.USERPOOL_ID,
        MaxResults: parseInt(event.queryStringParameters.perPage), // No of users to display per page
        ...(PaginationToken && { PaginationToken: PaginationToken }), // tokens[1] contain the token query for page 1.
      };

      console.info("params", params);

      const listUserImportJobData = await cognitoISP.send(new ListUserImportJobsCommand(params));
      console.log("listUser result", listUserImportJobData);
      // If no remaining jobs are there, no paginationToken is returned from cognito
      PaginationToken = listUserImportJobData.PaginationToken;

      let resData = listUserImportJobData.UserImportJobs;
      const page = parseInt(event.queryStringParameters.page);
      const perPage = parseInt(event.queryStringParameters.perPage);
      const start = (page - 1) * perPage + 1;
      const end = resData.length + start - 1;

      if (resData && resData.length > 0) {
        resData.map((item) => {
          item.id = item.JobId.split("-")[1];
          delete item.CloudWatchLogsRoleArn
          delete item.PreSignedUrl
          return item;
        })
      }

      resData.sort((a, b) => {
        if (a.StartDate > b.StartDate) return -1;
        if (a.StartDate < b.StartDate) return 1;
        return 0;
      });

      console.log('list user import jobs resData', resData)

      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers":
            "Content-Type,Authorization,X-Api-Key,Content-Range,X-Requested-With",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
          "Access-Control-Expose-Headers": "Content-Range",
          "Content-Range": `users ${start}-${end}/${usersCount}`,
        },
        body: JSON.stringify({
          data: resData,
          // total: usersCount,//resData.length,
          pageInfo: {
            hasPreviousPage: page > 1 ? true : false,
            hasNextPage: PaginationToken ? true : false,
          },
          PaginationToken,
        }),
      };
    }
  } catch (e) {
    console.log("Catch an error: ", e);
    switch (e.name) {
      case "InvalidPasswordException":
        errMsg = { type: "exception", message: "Invalid Password" };
        break;
      case "UserNotFoundException":
        errMsg = { type: "exception", message: "User not found" };
        break;
      case "UserNotConfirmedException":
        errMsg = { type: "exception", message: "User not confirmed" };
        break;
      case "NotAuthorizedException":
        errMsg = { type: "exception", message: "Not authorized" };
        break;
      case "TooManyRequestsException":
        errMsg = { type: "exception", message: "Too many requests" };
        break;
      case "UsernameExistsException":
        errMsg = {
          type: "exception",
          message: "Username/email already exists",
        };
        break;
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
    headers: {
      "Access-Control-Allow-Headers":
        "Content-Type,Authorization,X-Api-Key,Content-Range,X-Requested-With",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,GET,POST",
      "Access-Control-Expose-Headers": "Content-Range",
    },
    body: JSON.stringify(errMsg),
  };
  return response;
};
