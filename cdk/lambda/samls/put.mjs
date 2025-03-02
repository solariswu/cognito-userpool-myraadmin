import { PutItemCommand } from "@aws-sdk/client-dynamodb";

const storeSPInfo = async (payload, dynamodbISP) => {

    const params = {
        Item: {
            id: {
                S: '#SAML#' + payload.id,
            },
            name: {
                S: payload.name,
            },
            logoUrl: {
                S: payload.logoUrl ? payload.logoUrl : '',
            },
            serviceUrl: {
                S: payload.serviceUrl,
            },
            released: {
                BOOL: payload.released ? true : false,
            }
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: process.env.AMFA_SPINFO_TABLE,
    };

    console.log('storeSPInfo Input:', params);

    const data = await dynamodbISP.send(new PutItemCommand(params));

    console.log('put saml sp storeSPInfo Output:', data);

    return payload;
}

export const putResData = async (payload, dynamodb) => {

    console.log('samls putResData Input:', payload);

    return await storeSPInfo(payload, dynamodb);
}

export default putResData;