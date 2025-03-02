/* eslint-disable */

import { AdminHostedUIURL, AdminPortalClientId, AdminPortalUserPoolId, ProjectRegion, AdminPortalDomainName } from "/amfaext.js";

const awsmobile = {
	logo_img_url: `https://${AdminPortalDomainName}/Logo.png`,
	aws_project_region: ProjectRegion,
	aws_backend_api_url: `https://api.${AdminPortalDomainName}`,
	aws_samlproxy_api_url: 'https://api.samlproxy.apersona.com/samlproxy',
	aws_user_pools_id: AdminPortalUserPoolId,  // admin userpool id
	aws_user_pools_web_client_id: AdminPortalClientId,
	aws_hosted_ui_url: AdminHostedUIURL
};
export default awsmobile;
