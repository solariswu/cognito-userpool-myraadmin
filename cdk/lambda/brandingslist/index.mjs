import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

const s3ISP = new S3Client({ region: process.env.AWS_REGION });

const types = ['spportal', 'adminportal']

export const handler = async (event) => {

    console.info("EVENT\n" + JSON.stringify(event, null, 2))

    let errMsg = { type: 'exception', message: 'Service Error' };

    const startIdx = 0;

    const getResData = async (type, s3) => {
        const params = {
            Bucket: type === 'spportal' ? process.env.SPPORTAL_BUCKETNAME : process.env.ADMINPORTAL_BUCKETNAME,
            Key: 'branding.json',
        };
        const data = await s3.send(new GetObjectCommand(params));
        const body = await data.Body.transformToString();

        return JSON.parse(body);
    }

    let promises = []
    types.map ((type) => promises.push(getResData(type)))

    const [spInfo, adminInfo] = await Promise.allSettled (promises);

    if (spInfo.status === 'rejected' && adminInfo === 'rejected') {
        return response(404, JSON.stringify({ data: 'Not Found' }));
    }

    let resData = []

    if (spInfo.value) {
        resData.push({id: 'spportal', ...spInfo.value})
    }

    if (adminInfo.value) {
        resData.push({id: 'adminportal', ...adminInfo.value})
    }

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
