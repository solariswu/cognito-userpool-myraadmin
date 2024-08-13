
import {
    CognitoIdentityProviderClient,
    SetUICustomizationCommand,
    DescribeUserPoolClientCommand,
    UpdateUserPoolClientCommand,
} from '@aws-sdk/client-cognito-identity-provider';

// import {
//     DynamoDBClient,
//     GetItemCommand,
// } from '@aws-sdk/client-dynamodb';

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION });
// const dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    // const params = {
    //     TableName: process.env.AMFACONFIG_TABLE,
    //     Key: {
    //         configtype: { S: 'amfaBrandings' },
    //     },
    // };

    // const getItemCommand = new GetItemCommand(params);

    try {
        //     const config = await dynamodb.send(getItemCommand);

        //     if (config?.Item?.value?.S) {

        //         const result = JSON.parse(config.Item.value.S);

        //         console.log(`get amfaBrandings:`, result);

        //         if (result && result?.logo_url) {
        const logo_url = 'https://downloads.apersona.com/downloads/aPersona_Logos_Package/aPLogo-370x67.png';
        const response = await fetch(logo_url);
        const buf = await response.arrayBuffer();

        const res = await cognito.send(new SetUICustomizationCommand({
            UserPoolId: process.env.ADMINPOOL_ID,
            ClientId: process.env.CLIENT_ID,
            ImageFile: Buffer.from(buf),//blob,
        }))

        console.log('set ui customization res:', res);
        // }
        // else {
        //     console.log("Can't find logo_url from branding config")
        // }
        //     }
        //     else {
        //         console.log("Cant't correctly get brandings from DB");
        //     }
    }
    catch (error) {
        console.error('set ui customization failed with:', error);
        console.error('RequestId: ' + error.requestId);
    }

    try {
        const res = await cognito.send(new DescribeUserPoolClientCommand({
            UserPoolId: process.env.USERPOOL_ID,
            ClientId: process.env.SAML_CLIENT_ID,
        }))

        let params = res.UserPoolClient;
        delete params.CreationDate;
        delete params.LastModifiedDate;
        delete params.ClientSecret;
        params.CallbackURLs.push(`${process.env.SAML_CALLBACK_URL}`);

        const response = await cognito.send(new UpdateUserPoolClientCommand(params))

        console.log('update userpoolclient result', response)
    }
    catch (error) {
        console.error('describe user pool client failed with:', error);
        console.error('RequestId: ' + error.requestId);
    }

};
