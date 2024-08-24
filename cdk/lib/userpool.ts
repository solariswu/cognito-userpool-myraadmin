import { Construct } from 'constructs';
import {
  UserPool,
  UserPoolClient,
  OAuthScope,
  AccountRecovery,
  Mfa,
  UserPoolClientIdentityProvider,
  UserPoolIdentityProviderOidc,
} from 'aws-cdk-lib/aws-cognito';

import { Duration, Fn } from 'aws-cdk-lib';

import { AppStackProps } from './application';
import {
  apps_urls, hostedUI_domain_prefix,
  app_userpool_info, enduser_portal_callbackurls,
  enduser_portal_logouturls
} from '../config';


export class SSOUserPool {
  scope: Construct;
  region: string | undefined;
  account: string | undefined;
  appUserPoolId: string;
  adminUserpool: UserPool;
  appUserPool: UserPool;
  hostedUIClient: UserPoolClient;
  backEndUserClient: UserPoolClient;
  adminClient: UserPoolClient;
  samlClient: UserPoolClient;
  enduserPortalClient: UserPoolClient;
  domainName: string;
  oidcProvider: UserPoolIdentityProviderOidc;

  constructor(scope: Construct, props: AppStackProps) {
    this.scope = scope;
    this.account = props.env?.account;
    this.region = props.env?.region;
    this.domainName = props.domainName;

    this.adminUserpool = this.createUserPool('Admin');
    this.adminClient = this.addAdminClient();

    const userpoolid = Fn.importValue('useridppoolid').toString();
    // this.appUserPoolId = userpoolid
    this.appUserPoolId = userpoolid && userpoolid.length > 1 ? userpoolid :
      app_userpool_info.userPoolId ? app_userpool_info.userPoolId : '';

    this.samlClient = this.addSamlClient();
    this.enduserPortalClient = this.addEnduserPortalClient();

  }

  private createUserPool = (type: string) => {
    return new UserPool(this.scope, `SSO-${type}-userpool}`, {
      userPoolName: `SSO-${type}-UserPool`,
      // use self sign-in is disable by default
      selfSignUpEnabled: false,
      signInAliases: {
        // username sign-in
        username: false,
        // email as username
        email: true,
        phone: false,
      },
      signInCaseSensitive: false,
      // user attributes
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
      },
      // temporary password lives for 30 days
      passwordPolicy: {
        tempPasswordValidity: Duration.days(30),
        requireSymbols: true,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
      },
      // no customer attribute
      // MFA optional
      mfa: Mfa.REQUIRED,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      // forgotPassword recovery method, phone by default
      accountRecovery: AccountRecovery.EMAIL_ONLY,
    });
  }

  private addAdminClient() {
    this.adminUserpool.addDomain('adminHostedUI-domain', {
      cognitoDomain: {
        domainPrefix: hostedUI_domain_prefix,
      },
    });

    const supportedIdentityProviders = [UserPoolClientIdentityProvider.COGNITO];
    return new UserPoolClient(this.scope, 'adminClient', {
      userPool: this.adminUserpool,
      generateSecret: false,
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.COGNITO_ADMIN],
        callbackUrls: [`https://${this.domainName}`, 'http://localhost:5173', `https://${this.domainName}/auth-callback`, 'http://localhost:5173/auth-callback'],
        logoutUrls: [`https://${this.domainName}`, 'http://localhost:5173',],
      },
      userPoolClientName: 'AdminPortalClient',
      supportedIdentityProviders,
    });
  }

  private addSamlClient() {

    return new UserPoolClient(this.scope, 'samlproxyclient', {
      userPool: UserPool.fromUserPoolId(this.scope, 'appuserpool', this.appUserPoolId),
      generateSecret: true,
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.EMAIL],
        callbackUrls: ['http://localhost:3000/', ...apps_urls],
        logoutUrls: ['http://localhost:3000/', ...apps_urls],
      },
      userPoolClientName: 'samlproxyClient',
      supportedIdentityProviders: [UserPoolClientIdentityProvider.custom('apersona')],
    });
  };

  private addEnduserPortalClient() {

    return new UserPoolClient(this.scope, 'spportalclient', {
      userPool: UserPool.fromUserPoolId(this.scope, 'appuserpool2', this.appUserPoolId),
      generateSecret: false,
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.EMAIL],
        callbackUrls: enduser_portal_callbackurls,
        logoutUrls: enduser_portal_logouturls,
      },
      userPoolClientName: 'amfasys_spPortalClient',
      supportedIdentityProviders: [UserPoolClientIdentityProvider.custom('apersona')],
    });
  };

}