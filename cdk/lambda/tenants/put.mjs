import {
	PutItemCommand,
} from '@aws-sdk/client-dynamodb';

const samlurl = process.env.SAMLPROXY_API_URL;
const samlReloadUrl = process.env.SAMLPROXY_RELOAD_URL;

const taggleSaml = async (cognitoToken, enable) => {

	const response = await fetch(samlurl, {
		method: "PUT",
		cache: "no-cache",
		headers: {
			"Content-Type": "application/json",
			"Authorization": cognitoToken,
		},
		body: JSON.stringify({
			action: enable ? 'enable' : 'disable',
			clientId: process.env.SAML_CLIENTID,
		}), // body data type must match "Content-Type" header
	});
	console.log('samlslist post result', response);

	const res = await fetch(samlReloadUrl, {
		method: "GET", // *GET, POST, PUT, DELETE, etc.
		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
		headers: {
			"Content-Type": "application/json",
			"Authorization": cognitoToken,
		},
	});
	const resTxt = await res.text();
	console.log('samlproxy reload result', res);
	console.log('samlproxy reload result text', resTxt);
}

export const putResData = async (payload, previousData, cognitoToken, dynamodb) => {
	console.log('putResData Input:', payload);

	const params = {
		Item: {
			id: {
				S: payload.id,
			},
			name: {
				S: payload.name,
			},
			contact: {
				S: payload.contact,
			},
			url: {
				S: payload.url,
			},
			samlproxy: {
				BOOL: payload.samlproxy
			}
		},
		ReturnConsumedCapacity: 'TOTAL',
		TableName: process.env.AMFATENANT_TABLE,
	};

	const item = await dynamodb.send(new PutItemCommand(params));

	if (item) {

		if (payload.samlproxy !== previousData.samlproxy) {
			await taggleSaml (cognitoToken, payload.samlproxy)
		}

		return {
			id: item.id,
			name: item.name,
			contact: item.contact,
			samlproxy: item.samlproxy,
			url: item.url,
		}
	}

	return null;
}

export default putResData;