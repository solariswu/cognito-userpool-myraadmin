export const project_name = 'adminportal';
export const service_name = 'amfa';
export const current_stage = 'dev';

export const root_domain = `${project_name}-${current_stage}.${service_name}.aws-amplify.dev`;

export const logo_img_url = `https://${root_domain}/Logo.png`;

export const tenant_id = 'amfa-dev004';

export const amfa_api_base = `${tenant_id}.amfa.aws-amplify.dev`

export const oidc_info = {
	isNeeded: false,
	issuerUrl: 'https://login.microsoftonline.com/37da09ec-35db-45cf-a992-056cd0b990e8/v2.0',
	clientSecret: 'fill-later',
	clientId: 'ac58191d-c9cc-455a-b05a-ae9f2bd47b42',
}

export const stage_config = {
	dev : {
		env: {
			account: '531680862493',
			region: 'eu-west-1',
		},
		hostedZoneId: 'Z03307471XQKJVRSQV99A',
		domainName: `${root_domain}`,
	},
}

export const AMFACONFIG_TABLE = 'AmfaStack-amfaconfigamfadev0043E950B8A-189081ZBP9Q8G';
export const AMFATENANT_TABLE = `amfa-${stage_config[current_stage].env.account}-${stage_config[current_stage].env.region}-tenanttable`;

export const app_userpool_info = {
	needCreate: false,
	userPoolId: 'eu-west-1_vitRQ9sum',
}

export const hostedUI_domain = `${project_name}-${current_stage}001`;
export const apps_urls = ['https://amfa.netlify.app/'];
export const enduser_portal_callbackurls = ['http://localhost:5173/auth-callback', 'https://amfa-awsdemo-userportal.netlify.app/auth-callback', 'https://apersona.netlify.app/auth-callback'];
export const enduser_portal_logouturls = ['http://localhost:5173', 'https://amfa-awsdemo-userportal.netlify.app', 'https://apersona.netlify.app'];

// SAML proxy now is one single instance with static domain assigned
// manually deployed
// might change later
export const samlproxy_base_url = 'https://amfasaml.aws-amplify.dev/';
export const api_samlproxy_base_url = 'https://api.samlproxy.amfa.aws-amplify.dev/'
export const samlproxy_api_url = `${api_samlproxy_base_url}samlproxy`;
export const samlproxy_reload_url = `${api_samlproxy_base_url}reloadsamlproxy`;
export const samlproxy_metadata_url = `${samlproxy_base_url}/Saml2IDP/proxy.xml`;