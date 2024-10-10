/* eslint-disable */

import { AdminHostedUIURL, AdminPortalClientId, AdminPortalUserPoolId } from "./amfaext";

const awsmobile = {
	logo_img_url: `https://${process.env.ADMINPORTAL_DOMAIN_NAME}/Logo.png`,
	aws_project_region: process.env.CDK_DEPLOY_REGION,
	aws_backend_api_url: `https://api.${process.env.ADMINPORTAL_DOMAIN_NAME}`,
	aws_samlproxy_api_url: 'https://api.samlproxy.amfa.aws-amplify.dev/samlproxy',
	aws_user_pools_id: AdminPortalUserPoolId,  // admin userpool id
	aws_user_pools_web_client_id: AdminPortalClientId,
	aws_hosted_ui_url: AdminHostedUIURL
};
export default awsmobile;
