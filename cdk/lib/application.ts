import { Certificate } from "aws-cdk-lib/aws-certificatemanager";

import { CfnOutput, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { WebApplication } from './webapp';

import { SSOApiGateway } from './httpapi';
import { SSOUserPool } from './userpool';
import { app_userpool_info } from "../config";
import { createPostDeploymentLambda } from "./postDeployment";


export interface AppStackProps extends StackProps {
  siteCertificate: Certificate;
  apiCertificate: Certificate;
  domainName: string | undefined;
  hostedUIDomain: string | undefined;
  hostedZoneId: string | undefined;
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
    apigateway.createAdminApiEndpoints(userPool.appUserPoolId, userPool.samlClient.userPoolClientId,
      userPool.samlClient.userPoolClientSecret.unsafeUnwrap());
    apigateway.createEndUserPortalApiEndpoints(userPool.appUserPoolId);

    apigateway.attachMetadataS3(webapp.s3bucket);

    createPostDeploymentLambda(this,
      userPool.appUserPoolId,
      userPool.adminUserpool.userPoolId,
      userPool.adminClient.userPoolClientId,
      userPool.samlClient.userPoolClientId,
    );

    new CfnOutput(this, 'AdminPortal UserPoolId', { value: userPool.adminUserpool.userPoolId, });

    new CfnOutput(this, 'AdminPortal AppClientId', { value: userPool.adminClient.userPoolClientId, });

    if (app_userpool_info.needCreate) {
      new CfnOutput(this, 'Login Domain Name', { value: `https://${props.hostedUIDomain}.auth.${props.env?.region}.amazoncognito.com` });
      new CfnOutput(this, 'Hosted UI AppClientID', { value: userPool.hostedUIClient.userPoolClientId });
    }

    new CfnOutput(this, 'Admin Login Hosted UI URL', { value: `https://${props.hostedUIDomain}.auth.${props.env?.region}.amazoncognito.com` });

    new CfnOutput(this, 'Application UserPoolID', { value: userPool.appUserPoolId });

    new CfnOutput(this, 'Admin Portal KickOff URL', { value: `https://${props.domainName}` });

    new CfnOutput(this, 'SAML Proxy App Client ID', { value: userPool.samlClient.userPoolClientId })

  }
}
