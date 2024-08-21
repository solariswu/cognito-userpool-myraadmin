/* eslint-disable */

const project_name = "adminportal";
const stage = 'dev';
const region = 'eu-west-1';

// don't change this value. It's different than the one in amfa.
// this is not used in email header/footer.
const service_name = "amfa";


const root_domain = `${project_name}-${stage}.amfa.aws-amplify.dev`;

const awsmobile = {
	logo_img_url: `https://${root_domain}/Logo.png`,
	aws_project_region: region,
	aws_user_pools_id: "eu-west-1_ibOks955Q",  // admin userpool id
	aws_user_pools_web_client_id: "4kbb8vveiplsjqdb8onaldv7nq",
	aws_backend_api_url: `https://api.${root_domain}`,
	aws_hosted_ui_url: `https://${service_name}-${project_name}-${stage}001.auth.${region}.amazoncognito.com`,
	app_callback_uri: "https://amfa.netlify.app",
	aws_samlproxy_api_url: 'https://api.samlproxy.amfa.aws-amplify.dev/samlproxy'
};
export default awsmobile;
