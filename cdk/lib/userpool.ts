import { Construct } from 'constructs';
import {
  UserPool,
  UserPoolClient,
  OAuthScope,
  AccountRecovery,
  Mfa,
  UserPoolClientIdentityProvider,
  ProviderAttribute,
  OidcAttributeRequestMethod,
  UserPoolIdentityProviderOidc,
} from 'aws-cdk-lib/aws-cognito';

import { Duration } from 'aws-cdk-lib';

import { AppStackProps } from './application';
import { apps_urls, current_stage, hostedUI_domain, project_name, oidc_info, app_userpool_info, service_name, enduser_portal_callbackurls, enduser_portal_logouturls } from '../config';

import { PolicyStatement, PolicyDocument, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';


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
  importUserRole: Role;
  oidcProvider: UserPoolIdentityProviderOidc;

  constructor(scope: Construct, props: AppStackProps) {
    this.scope = scope;
    this.account = props.env?.account;
    this.region = props.env?.region;
    this.domainName = props.domainName;

    this.adminUserpool = this.createUserPool('Admin');
    if (oidc_info.isNeeded) {
      this.oidcProvider = this.addOIDCProviderToAdminPool();
    }
    this.adminClient = this.addAdminClient();
    if (oidc_info.isNeeded) {
      this.adminClient.node.addDependency(this.oidcProvider);
    }

    if (!app_userpool_info.needCreate) {
      this.appUserPoolId = app_userpool_info.userPoolId ? app_userpool_info.userPoolId : '';
    }
    else {
      this.appUserPool = this.createUserPool('Apps');
      this.appUserPoolId = this.appUserPool.userPoolId;
      this.hostedUIClient = this.addHostedUIAppClient();
      this.addHostedUIDomain();
    }
    this.samlClient = this.addSamlClient();
    this.enduserPortalClient = this.addEnduserPortalClient();

    this.createImportUserRole();

  }

  private createImportUserRole() {
    const importUserPolicyStatement = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: [
            "logs:CreateLogGroup",
            "logs:CreateLogStream",
            "logs:DescribeLogStreams",
            "logs:PutLogEvents"
          ],
          resources: [
            "arn:aws:logs:*:*:log-group:/aws/cognito/*"
          ],
        }),
      ],
    });

    this.importUserRole = new Role(this.scope, 'ImportUserRole', {
      assumedBy: new ServicePrincipal('cognito-idp.amazonaws.com'),
      roleName: `${project_name}-ImportUserRole`,
      inlinePolicies: {
        CupImportUserPolicy: importUserPolicyStatement
      }
    });
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
      mfa: type === 'Admin'? Mfa.REQUIRED : Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      // forgotPassword recovery method, phone by default
      accountRecovery: AccountRecovery.EMAIL_ONLY,
    });
  }


  private addOIDCProviderToAdminPool() {
    const issuerUrl = oidc_info.issuerUrl;
    const clientId = oidc_info.clientId;
    const clientSecret = oidc_info.clientSecret;

    return new UserPoolIdentityProviderOidc(
      this.scope,
      'OIDCProvider',
      {
        clientId,
        clientSecret,
        issuerUrl,
        userPool: this.adminUserpool,
        // the properties below are optional
        attributeMapping: {
          email: ProviderAttribute.other('email'),
        },
        attributeRequestMethod: OidcAttributeRequestMethod.GET,
        identifiers: ['myoidc'],
        name: 'myoidc',
        scopes: ['openid email phone'],
      }
    );
  };

  private addAdminClient() {
    this.adminUserpool.addDomain('adminHostedUI-domain', {
      cognitoDomain: {
        domainPrefix: `${service_name}-${project_name}-${current_stage}001`,
      },
    });

    const supportedIdentityProviders = [UserPoolClientIdentityProvider.COGNITO];
    if (oidc_info.isNeeded) {
      supportedIdentityProviders.push(UserPoolClientIdentityProvider.custom('myoidc'));
    }
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
        logoutUrls: [`https://${this.domainName}`, 'http://localhost:5173', ],
      },
      userPoolClientName: 'AdminPortalClient',
      supportedIdentityProviders,
    });
  }

  private addHostedUIAppClient() {
    return new UserPoolClient(this.scope, 'hostedUIClient', {
      userPool: this.appUserPool,
      generateSecret: false,
      authFlows: {
        userSrp: true,
      },
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.OPENID, OAuthScope.PROFILE, OAuthScope.COGNITO_ADMIN],
        callbackUrls: apps_urls,
        logoutUrls: apps_urls,
      },
      userPoolClientName: 'hostedUIClient',
      supportedIdentityProviders: [
        UserPoolClientIdentityProvider.COGNITO,
      ],
    });
  };

  private addHostedUIDomain(
  ) {
    return this.appUserPool.addDomain('hostedUI-domain', {
      cognitoDomain: {
        domainPrefix: hostedUI_domain,
      },
    });
  };

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