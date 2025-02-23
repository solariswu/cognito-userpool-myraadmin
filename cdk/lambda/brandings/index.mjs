
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

const s3ISP = new S3Client({ region: process.env.AWS_REGION });

export const handler = async (event) => {

    console.info("EVENT\n" + JSON.stringify(event, null, 2))
    console.log('event.requestContext.http.method: ', event.requestContext.http.method);

    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key,X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT',
    };

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

    const cognitoToken = event.headers.authorization;

    const bucketList = {
        "spportal": process.env.SPPORTAL_BUCKETNAME,
        "adminportal": process.env.ADMINPORTAL_BUCKETNAME
    }

    const getResData = async (type, s3) => {
        const params = {
            Bucket: bucketList[type],
            Key: 'branding.json',
        };
        const data = await s3.send(new GetObjectCommand(params));
        const body = await data.Body.transformToString();

        return JSON.parse(body);
    }

    const putResData = async (data, s3) => {
        const params = {
            Bucket: bucketList[data.type],
            Key: 'branding.json',
            Body: JSON.stringify(data),
        };
        await s3.send(new PutObjectCommand(params));
        return data;
    }

    try {
        switch (event.requestContext.http.method) {
            case 'GET':
                const getResult = await getResData(event.pathParameters?.id, s3ISP);
                return response(200, JSON.stringify({ data: getResult }));
            case 'PUT':
				const payload = JSON.parse(event.body);
				const putResult = await putResData(payload.data);
				return response(200, JSON.stringify({ data: putResult }));
            case 'OPTIONS':
                return response(200, JSON.stringify({ data: 'ok' }));
            default:
                return response(404, JSON.stringify({ data: 'Not Found' }));
        }
    }
    catch (e) {
        console.log('Catch an error: ', e)
    }

    return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ type: 'exception', message: 'Service Error' }),
    };
}


