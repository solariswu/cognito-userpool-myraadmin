import {
	GetItemCommand,
} from '@aws-sdk/client-dynamodb';

const postURL = `https://api.${process.env.AMFA_BASE_URL}/amfa`;

const fetchAmfaSecrets = async (id) => fetch(postURL, {
	method: "POST",
	headers: {
		'Content-Type': 'application/json',
		'Accept': 'application/json',
		'Origin': `https://${process.env.AMFA_BASE_URL}`,
	},
	body: JSON.stringify({
		phase: 'admingetsecretinfo', tenantid: id
	}),
});

export const getResData = async (id, cognitoToken, dynamodb) => {

	//fetch tenant Info
	const params = {
		TableName: process.env.AMFATENANT_TABLE,
		Key: {
			id: { S: id },
		},
	};

	const result = await dynamodb.send(new GetItemCommand(params));

	console.log('get tenants result', result);

	const item = result.Item;


	const res = await fetchAmfaSecrets(id);
	const resJson = await res.json();

	console.log('get secret json from amfa', resJson);
	const message = resJson.message;


	if (item && item.name) {

		return {
			id,
			name: item.name.S,
			contact: item.contact.S,
			url: item.url.S,
			samlproxy: item.samlproxy?.BOOL,
			samlIdPMetadataUrl: process.env.SAMLPROXY_METADATA_URL,
			...message,
			// branding: item.branding,
		};
	}

	throw new Error('Not Found!');
};

export default getResData;