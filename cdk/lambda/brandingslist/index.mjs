import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3ISP = new S3Client({ region: process.env.AWS_REGION });
const types = [process.env.SPPORTAL_BUCKETNAME, process.env.ADMINPORTAL_BUCKETNAME]

export const handler = async (event) => {

    console.info("EVENT\n" + JSON.stringify(event, null, 2))

    const startIdx = 0;

    const getResData = async (bucketName, s3) => {
        const params = {
            Bucket: bucketName,
            Key: 'branding.json',
        };
        const data = await s3.send(new GetObjectCommand(params));
        const body = await data.Body.transformToString();

        console.log ('get type from s3, response body', body)

        return JSON.parse(body);
    }

    let promises = [], resData = []
    types.map ((type) => promises.push(getResData(type, s3ISP)))

    const resultsArray = await Promise.allSettled (promises);

    resultsArray.map ((result) => {
        if (result.status === 'fulfilled') {
            resData.push(result.value)
        }
    })

    resData.sort((a, b) => {
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
    });

    return {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key,Content-Range,X-Requested-With',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
            'Access-Control-Expose-Headers': 'Content-Range',
            'Content-Range': `brandings ${startIdx + 1}-${startIdx + 1 + resData.length}`,
        },
        body: JSON.stringify({
            data: resData,
            total: resData.length,
        }),
    }
};
