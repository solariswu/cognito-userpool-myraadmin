/* eslint-disable */

const awsmobile = {
	logo_img_url: `https://${process.env.ADMINPORTAL_DOMAIN_NAME}/Logo.png`,
	aws_project_region: process.env.CDK_DEPLOY_REGION,
	aws_backend_api_url: `https://api.${process.env.ADMINPORTAL_DOMAIN_NAME}`,
	aws_samlproxy_api_url: 'https://api.samlproxy.amfa.aws-amplify.dev/samlproxy',
	aws_user_pools_id: "eu-west-1_ibOks955Q",  // admin userpool id
	aws_user_pools_web_client_id: "4kbb8vveiplsjqdb8onaldv7nq",
	aws_hosted_ui_url: `https://${service_name}-${project_name}-${process.env.CDK_DEPLOY_ACCOUNT}.auth.${process.env.CDK_DEPLOY_REGION}.amazoncognito.com`
};
export default awsmobile;
