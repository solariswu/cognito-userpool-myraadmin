
import { getSMTP, setSMTP } from './kmsUtil.mjs';

export const handler = async (event) => {

    console.info("EVENT\n" + JSON.stringify(event, null, 2))
    console.log('event.requestContext.http.method: ', event.requestContext.http.method);

    const headers = {
        'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Api-Key,X-Requested-With',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST',
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

    const testSMTP = async (secret) => {
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            host: secret.host,
            port: secret.port,
            secure: secret.secure,
            auth: {
                user: secret.user,
                pass: secret.pass,
            },
        });

        try {
            // send mail with defined transport object
            const info = await transporter.sendMail({
                from: secret.user, // sender address
                to: secret.toUser, // list of receivers
                subject: "Admin Test SMTP", // Subject line
                text: "Hello world?", // plain text body
                html: "<b>Hello world?</b>", // html body
            });

            console.log("Message sent: %s", info.messageId);

            return response(200, JSON.stringify({ data: 'OK' }));
        } catch (error) {
            console.log('smtp test error message:', error.message);
            console.log('smtp test error stack:', error.stack);
            return response(500, JSON.stringify({ data: error.message ? error.message : 'message not sent' }));
        }
    }


    const cognitoToken = event.headers.authorization;

    try {
        switch (event.requestContext.http.method) {
            case 'GET':
                const getResult = await getSMTP();
                return response(200, JSON.stringify({ data: getResult }));
            case 'PUT':
				const payload = JSON.parse(event.body);
				const putResult = await setSMTP(payload.data);
				return response(200, JSON.stringify({ data: putResult }));
            case 'POST':
				const body = JSON.parse(event.body);
				return await testSMTP(body.data);
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


