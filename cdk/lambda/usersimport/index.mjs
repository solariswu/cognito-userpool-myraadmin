//AWS configurations
import {
	StartUserImportJobCommand,
	CognitoIdentityProviderClient,
	CreateUserImportJobCommand,
} from "@aws-sdk/client-cognito-identity-provider";

const cognitoISP = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });

const headers = {
	'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key,X-Requested-With',
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
};

export const handler = async (event) => {

	console.info("EVENT\n" + JSON.stringify(event, null, 2))

	const response = (statusCode = 200, body) => {
		console.log('return with:', {
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

	const getResData = async () => {
		const data = await cognitoISP.send(new CreateUserImportJobCommand(
			{
				JobName: 'ImportJob_' + Math.round(Date.now() / 1000),
				UserPoolId: process.env.USERPOOL_ID,
				CloudWatchLogsRoleArn: process.env.CLOUDWATCH_ROLE_ARN,
			}));


		if (data.UserImportJob && data.UserImportJob.PreSignedUrl) {

			return {
				id: data.UserImportJob.JobId,
				jobName: data.UserImportJob.JobName,
				preSignedUrl: data.UserImportJob.PreSignedUrl,
				status: data.UserImportJob.Status,
				created: data.UserImportJob.CreationDate,
			}
		}

		return null;
	}

	const postResData = async (payload) => {
		const startJobInput = JSON.parse(payload);
		const data = await cognitoISP.send(new StartUserImportJobCommand({
			JobId: startJobInput.jobId,
			CloudWatchLogsRoleArn: process.env.CLOUDWATCH_ROLE_ARN,
			UserPoolId: process.env.USERPOOL_ID,
		}));
		console.log('start import data: ', data);
		return data.UserImportJob;
	}

	try {
		let resData = null;

		switch (event.requestContext.http.method) {
			case 'GET':
				resData = await getResData();
				if (resData) {
					return response(200, JSON.stringify({ data: resData }));
				}
				break;
			case 'POST':
				resData = await postResData(event.body);
				if (resData) {
					return response(200, JSON.stringify({ data: resData }));
				}
				break;
			case 'OPTIONS':
				return response(200, JSON.stringify({ data: 'ok' }));
			default:
				break;
		}
	} catch (e) {
		console.log('Catch an error: ', e)
	}

	return {
		statusCode: 500,
		headers,
		body: JSON.stringify({ type: 'exception', message: 'Service Error' }),
	}
};
