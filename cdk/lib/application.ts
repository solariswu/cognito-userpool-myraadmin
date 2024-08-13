import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { WebApplication } from './webapp';

import { SSOApiGateway } from './httpapi';
import { SSOUserPool } from './userpool';
import { hostedUI_domain, service_name, current_stage, app_userpool_info, project_name } from "../config";
import { createPostDeploymentLambda } from "./postDeployment";


export interface AppStackProps extends StackProps {
  siteCertificate: Certificate;
  apiCertificate: Certificate;
  domainName: string;
  hostedUIDomain: string;
  hostedZoneId: string;
  assetsPath: string;
  amfaBaseUrl: string;
}

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    // frontend
    // use the domain created above to create the frontend web app.
    const webapp = new WebApplication(this, props);

    // backend
    // admin http apigateway
    const apigateway = new SSOApiGateway(this, props);

    // userpool creations - application and admin userpools
    const userPool = new SSOUserPool(this, props);


    apigateway.attachAuthorizor(userPool);

    // enable admin api endpoints
    apigateway.createAdminApiEndpoints(userPool.appUserPoolId, userPool.samlClient.userPoolClientId);
    apigateway.createEndUserPortalApiEndpoints(userPool.appUserPoolId);

    apigateway.attachMetadataS3 (webapp.s3bucket);

    createPostDeploymentLambda(this,
      userPool.appUserPoolId,
      userPool.adminUserpool.userPoolId,
      userPool.adminClient.userPoolClientId,
      userPool.samlClient.userPoolClientId,
    );

    new CfnOutput(this, 'AdminPortal UserPoolId', { value: userPool.adminUserpool.userPoolId, });

    new CfnOutput(this, 'userPoolAdminAppClientId', { value: userPool.adminClient.userPoolClientId, });

    if (app_userpool_info.needCreate) {
      new CfnOutput(this, 'Login Domain Name', { value: `https://${hostedUI_domain}.auth.${props.env?.region}.amazoncognito.com` });
      new CfnOutput(this, 'Hosted UI AppClientID', { value: userPool.hostedUIClient.userPoolClientId });
    }

    new CfnOutput(this, 'Admin Login Hosted UI URL', { value: `${service_name}-${project_name}-${current_stage}001.auth.${props.env?.region}.amazoncognito.com` });

    new CfnOutput(this, 'Application UserPoolID', { value: userPool.appUserPoolId });

    new CfnOutput(this, 'Admin Portal KickOff URL', { value: `https://${props.domainName}` });

  }
}
