
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import * as path from 'path';

import { Construct } from 'constructs';
import { AppStackProps } from './application';
import {
    CorsHttpMethod,
    HttpApi,
    HttpMethod,
    DomainName,
} from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { HttpUserPoolAuthorizer } from 'aws-cdk-lib/aws-apigatewayv2-authorizers';

import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { ARecord, HostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGatewayv2DomainProperties } from 'aws-cdk-lib/aws-route53-targets';
import { SSOUserPool } from './userpool';
import { AMFACONFIG_TABLE, AMFATENANT_TABLE, current_stage, project_name, service_name, stage_config, samlproxy_api_url, tenant_id, samlproxy_metadata_url, samlproxy_reload_url } from '../config';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import { UserPool } from 'aws-cdk-lib/aws-cognito';


export class SSOApiGateway {
    scope: Construct;
    region: string | undefined;
    account: string | undefined;
    userPoolId: string;
    api: HttpApi;
    certificateArn: string;
    domainName: string;
    hostedUIDomain: string
    hostedZoneId: string;
    authorizor: HttpUserPoolAuthorizer;
    endUserAuthorizor: HttpUserPoolAuthorizer;
    amfaBaseUrl: string;
    spinfoTable: Table;

    constructor(scope: Construct, props: AppStackProps) {
        this.scope = scope;
        this.region = props.env?.region;
        this.account = props.env?.account;
        this.certificateArn = props.apiCertificate.certificateArn;
        this.domainName = props.domainName ? props.domainName : '';
        this.hostedZoneId = props.hostedZoneId ? props.hostedZoneId : '';
        this.hostedUIDomain = props.hostedUIDomain ? props.hostedUIDomain : '';
        this.amfaBaseUrl = props.amfaBaseUrl;

        this.spinfoTable = this.createSPInfoTable();

        this.createHttpApi();
    }

    public attachAuthorizor(userPool: SSOUserPool) {
        this.authorizor = new HttpUserPoolAuthorizer(
            'httpapi_authorizor',
            userPool.adminUserpool,
            { userPoolClients: [userPool.adminClient] }
        );

        this.endUserAuthorizor = new HttpUserPoolAuthorizer(
            'httpapi_authorizor_enduser',
            UserPool.fromUserPoolId(this.scope, 'appuserpool3', userPool.appUserPoolId),
            { userPoolClients: [userPool.enduserPortalClient] }
        );
    }

    public attachMetadataS3(s3bucket: Bucket) {

        const metadataListFunction = new Function(this.scope, 'spmetadataslist_function', {
            code: Code.fromAsset(path.join(__dirname, '../lambda/spmetadataslist')),
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            timeout: Duration.minutes(3),
            environment: {
                S3_BASE_URL: `${stage_config[current_stage].domainName}`,
                BUCKET: s3bucket.bucketName,
                SERVICE_NAME: service_name,
                TENANT_ID: tenant_id ? tenant_id : 'unknowntid',
            }
        });

        s3bucket.grantReadWrite(metadataListFunction);

        const metadataListIntegration = new HttpLambdaIntegration('spmetadataslist_integration', metadataListFunction);

        this.api.addRoutes({
            path: '/metadataslist',
            methods: [HttpMethod.GET, HttpMethod.POST],
            integration: metadataListIntegration,
        });

        const metadataFunction = new Function(this.scope, 'spmetadatas_function', {
            code: Code.fromAsset(path.join(__dirname, '../lambda/spmetadatas')),
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            timeout: Duration.minutes(3),
            environment: {
                S3_BASE_URL: `${stage_config[current_stage].domainName}`,
                BUCKET: s3bucket.bucketName,
                SERVICE_NAME: service_name,
                TENANT_ID: tenant_id ? tenant_id : 'unknowntid',
            }
        });

        s3bucket.grantReadWrite(metadataListFunction);

        const metadataIntegration = new HttpLambdaIntegration('spmetadatas_integration', metadataFunction);

        this.api.addRoutes({
            path: '/metadatas',
            methods: [HttpMethod.GET, HttpMethod.DELETE],
            integration: metadataIntegration,
        });
    }

    private userPoolIdToArn(userPoolId: string): string {
        return `arn:aws:cognito-idp:${this.region}:${this.account}:userpool/${userPoolId}`;
    }

    private tableNameToArn(tableName: string): string {
        return `arn:aws:dynamodb:${this.region}:${this.account}:table/${tableName}`;
    }

    private createSPInfoTable() {
        const table = new Table(this.scope, `${service_name}-${project_name}-${current_stage}-spinfo`, {
            partitionKey: { name: 'id', type: AttributeType.STRING },
            billingMode: BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY,
        });
        return table;
    }

    private createHttpApi() {

        const domain = new DomainName(this.scope, 'httpapi_domain', {
            domainName: `api.${this.domainName}`,
            certificate: Certificate.fromCertificateArn(this.scope, 'cert', this.certificateArn),
        })

        this.api = new HttpApi(this.scope, 'http-api', {
            description: 'HTTP API',
            corsPreflight: {
                allowHeaders: [
                    'Content-Type',
                    'X-Amz-Date',
                    'Authorization',
                    'X-Api-Key',
                ],
                allowMethods: [
                    CorsHttpMethod.OPTIONS,
                    CorsHttpMethod.GET,
                    CorsHttpMethod.POST,
                    CorsHttpMethod.PUT,
                    CorsHttpMethod.PATCH,
                    CorsHttpMethod.DELETE,
                ],
                allowCredentials: false,
                allowOrigins: ['*'],
            },
            defaultDomainMapping: {
                domainName: domain,
            },
            disableExecuteApiEndpoint: true
        });

        new ARecord(this.scope, 'apiAliasRecord', {
            zone: HostedZone.fromHostedZoneAttributes(this.scope, 'hostedZoneWithAttributes', {
                hostedZoneId: this.hostedZoneId,
                zoneName: this.domainName
            }),
            recordName: 'api',
            target: RecordTarget.fromAlias(new ApiGatewayv2DomainProperties(domain.regionalDomainName, domain.regionalHostedZoneId))
        })

    }

    public createAdminApiEndpoints(userPoolId: string, samlClientId: string, samlClientSecrect: string) {
        const resourceTypes = ['users', 'groups', 'idps', 'appclients'];

        resourceTypes.forEach(resourceType => {
            const lambdaList = this.createLambda(
                `${resourceType}list`,
                userPoolId,
                this.getPolicyStatements(this.userPoolIdToArn(userPoolId), resourceType, true),
            );
            // 👇 add route for GET /resource
            this.api.addRoutes({
                path: `/${resourceType}`,
                methods: [HttpMethod.DELETE, HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT],
                integration: new HttpLambdaIntegration(
                    `list-${resourceType}-integration`,
                    lambdaList,
                ),
                authorizer: this.authorizor,
            });
            const lambda = this.createLambda(
                `${resourceType}`,
                userPoolId,
                this.getPolicyStatements(this.userPoolIdToArn(userPoolId), resourceType, false)
            );
            // 👇 add route for CRUD /resource/id
            this.api.addRoutes({
                path: `/${resourceType}/{id}`,
                methods: [HttpMethod.DELETE, HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT],
                integration: new HttpLambdaIntegration(
                    `${resourceType}-integration`,
                    lambda,
                ),
                authorizer: this.authorizor,
            });
        });

        const samlsListLambda = this.createAmfaSamlSpsLambda('samlslist',
            samlClientId, samlClientSecrect, userPoolId, this.spinfoTable);
        // 👇 add route for GET /resource
        this.api.addRoutes({
            path: '/samls',
            methods: [HttpMethod.GET, HttpMethod.POST],
            integration: new HttpLambdaIntegration(
                `list-samls-integration`,
                samlsListLambda,
            ),
            authorizer: this.authorizor,
        });
        const samlsLambda = this.createAmfaSamlSpsLambda('samls',
            samlClientId, samlClientSecrect, userPoolId, this.spinfoTable);
        // 👇 add route for CRUD /resource/id
        this.api.addRoutes({
            path: '/samls/{id}',
            methods: [HttpMethod.DELETE, HttpMethod.GET, HttpMethod.PUT],
            integration: new HttpLambdaIntegration(
                'samls-integration',
                samlsLambda,
            ),
            authorizer: this.authorizor,
        });


        // tenants apis
        const lambdaList = this.createAmfaTenantsLambda(AMFATENANT_TABLE, 'tenantslist', samlClientId);
        // 👇 add route for GET /resource
        this.api.addRoutes({
            path: '/tenants',
            methods: [HttpMethod.DELETE, HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT],
            integration: new HttpLambdaIntegration(
                `list-tenants-integration`,
                lambdaList,
            ),
            authorizer: this.authorizor,
        });
        const lambda = this.createAmfaTenantsLambda(AMFATENANT_TABLE, 'tenants', samlClientId);
        // 👇 add route for CRUD /resource/id
        this.api.addRoutes({
            path: '/tenants/{id}',
            methods: [HttpMethod.DELETE, HttpMethod.GET, HttpMethod.POST, HttpMethod.PUT],
            integration: new HttpLambdaIntegration(
                'tenants-integration',
                lambda,
            ),
            authorizer: this.authorizor,
        });

        // amfa fecth configs api
        const fetchAmfaConfigLambda = this.createFetchAmfaConfigLambda(AMFACONFIG_TABLE, userPoolId);

        this.api.addRoutes({
            path: '/amfaconfig',
            methods: [HttpMethod.GET],
            integration: new HttpLambdaIntegration(
                'fetch-amfaconfig-integration',
                fetchAmfaConfigLambda,
            ),
            authorizer: this.authorizor,
        });

        // amfa smtp config api
        const smtplambda = this.createSmtpConfigLambda ();

        this.api.addRoutes({
            path: '/smtpconfig',
            methods: [HttpMethod.GET, HttpMethod.PUT, HttpMethod.POST],
            integration: new HttpLambdaIntegration(
                'smtpconfig-integration',
                smtplambda,
            ),
            authorizer: this.authorizor,
        })
    }

    public createEndUserPortalApiEndpoints(userPoolId: string) {
        const serviceProvidersListLambda = this.createServicePrvoiderLambda('serviceproviderslist', userPoolId, this.spinfoTable);
        // 👇 add route for GET /resource
        this.api.addRoutes({
            path: '/serviceproviders',
            methods: [HttpMethod.GET],
            integration: new HttpLambdaIntegration(
                `list-usrportal-splist-integration`,
                serviceProvidersListLambda,
            ),
            authorizer: this.endUserAuthorizor,
        });

        const customServiceProvidersListLambda = this.createUserCustomSPSLambda('usercustomsps', userPoolId);
        // 👇 add route for GET /resource
        this.api.addRoutes({
            path: '/usercustomsps/{id}',
            methods: [HttpMethod.GET, HttpMethod.PUT],
            integration: new HttpLambdaIntegration(
                `list-usrportal-usercustomsps-integration`,
                customServiceProvidersListLambda,
            ),
            authorizer: this.endUserAuthorizor,
        });
    }

    private createServicePrvoiderLambda(lambdaName: string, userPoolId: string, spinfoTable: Table) {

        let lambda = new Function(this.scope, lambdaName, {
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, `/../lambda/${lambdaName}/dist`)),
            environment: {
                USERPOOL_ID: userPoolId,
                AMFA_SPINFO_TABLE: spinfoTable.tableName,
                SAMLPROXY_API_URL: samlproxy_api_url,
                SAMLPROXY_RELOAD_URL: samlproxy_reload_url,
            },
            timeout: Duration.minutes(5)
        });

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: [
                            spinfoTable.tableArn,
                        ],
                        actions: [
                            'dynamodb:GetItem',
                            'dynamodb:Scan',
                        ],
                    }),
                    new PolicyStatement({
                        resources: [
                            this.userPoolIdToArn(userPoolId),
                        ],
                        actions: [
                            'cognito-idp:ListUserPoolClients',
                        ],
                    })

                ],
            })
        );

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-passrole-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: ['*'],
                        actions: ['iam:PassRole'],
                    }),
                ],
            })
        );

        return lambda;
    }

    private createUserCustomSPSLambda(lambdaName: string, userPoolId: string) {

        let lambda = new Function(this.scope, lambdaName, {
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, `/../lambda/${lambdaName}`)),
            environment: {
                USERPOOL_ID: userPoolId,
            },
            timeout: Duration.minutes(5)
        });

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: [
                            this.userPoolIdToArn(userPoolId),
                        ],
                        actions: [
                            'cognito-idp:AdminUpdateUserAttributes',
                            'cognito-idp:AdminGetUser',
                        ],
                    })

                ],
            })
        );

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-passrole-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: ['*'],
                        actions: ['iam:PassRole'],
                    }),
                ],
            })
        );

        return lambda;
    }

    private createAmfaSamlSpsLambda(lambdaName: string, samlClientId: string,
        samlClientSecret: string, userPoolId: string, spinfoTable: Table) {

        let lambda = new Function(this.scope, lambdaName, {
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, `/../lambda/${lambdaName}/dist`)),
            environment: {
                SAML_CLIENTID: samlClientId,
                SAML_CLIENTSECRET: samlClientSecret,
                AMFA_BASE_URL: this.amfaBaseUrl,
                AMFA_SPINFO_TABLE: spinfoTable.tableName,
                SAMLPROXY_API_URL: samlproxy_api_url,
                SAMLPROXY_RELOAD_URL: samlproxy_reload_url,
                USER_POOL_ID: userPoolId,
            },
            timeout: Duration.minutes(5)
        });

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: [
                            spinfoTable.tableArn,
                        ],
                        actions: [
                            'dynamodb:GetItem',
                            'dynamodb:PutItem',
                            'dynamodb:Scan',
                            'dynamodb:DeleteItem',
                        ],
                    })
                ],
            })
        );

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-passrole-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: ['*'],
                        actions: ['iam:PassRole'],
                    }),
                ],
            })
        );

        return lambda;
    }

    private createAmfaTenantsLambda(tableName: string, lambdaName: string, samlClientId: string) {

        const lambda = new Function(this.scope, lambdaName, {
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, `/../lambda/${lambdaName}`)),
            environment: {
                AMFATENANT_TABLE: tableName,
                AMFA_BASE_URL: this.amfaBaseUrl,
                SAMLPROXY_API_URL: samlproxy_api_url,
                SAMLPROXY_RELOAD_URL: samlproxy_reload_url,
                SAML_CLIENTID: samlClientId,
                SAMLPROXY_METADATA_URL: samlproxy_metadata_url,
                TENANT_ID: tenant_id ? tenant_id : 'unknowntid',
            },
            timeout: Duration.minutes(5)
        });

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: [
                            this.tableNameToArn(tableName),
                        ],
                        actions: [
                            'dynamodb:GetItem',
                            'dynamodb:PutItem',
                            'dynamodb:Scan',
                            'dynamodb:DeleteItem',
                        ],
                    }),
                    new PolicyStatement({
                        resources: ['*'],
                        actions: [
                            'secretsmanager:GetSecretValue',
                            'secretsmanager:UpdateSecretValue'
                        ],
                    }),
                ],
            })
        );

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-passrole-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: ['*'],
                        actions: ['iam:PassRole'],
                    }),
                ],
            })
        );

        return lambda;
    };

    private createFetchAmfaConfigLambda(tableName: string, userpoolId: string) {
        const lambdaName = 'amfaconfig';

        const lambda = new Function(this.scope, lambdaName, {
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, `/../lambda/${lambdaName}/dist`)),
            environment: {
                AMFACONFIG_TABLE: tableName,
                TENANT_ID: tenant_id ? tenant_id : 'unknowntid',
                AMFATENANT_TABLE,
                USERPOOL_ID: userpoolId,
            },
            timeout: Duration.minutes(5)
        });

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy-dynamo`, {
                statements: [
                    new PolicyStatement({
                        resources: [
                            this.tableNameToArn(tableName),
                            this.tableNameToArn(AMFATENANT_TABLE),
                        ],
                        actions: [
                            'dynamodb:GetItem',
                        ],
                    })
                ],
            })
        );

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy-cognito`, {
                statements: [
                    new PolicyStatement({
                        resources: [
                            this.userPoolIdToArn(userpoolId),
                        ],
                        actions: [
                            'cognito-idp:DescribeUserPool',
                        ],
                    })
                ],
            })
        );

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-passrole-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: ['*'],
                        actions: ['iam:PassRole'],
                    }),
                ],
            })
        );

        return lambda;
    };

    private getPolicyStatements(userPoolArn: string, resourceType: string, isList: boolean) {
        const statements: PolicyStatement[] = [];
        const actions = {
            users: {
                normal: [
                    'cognito-idp:AdminGetUser',
                    'cognito-idp:AdminDeleteUser',
                    'cognito-idp:AdminUpdateUserAttributes',
                    'cognito-idp:AdminListGroupsForUser',
                    'cognito-idp:AdminAddUserToGroup',
                    'cognito-idp:AdminRemoveUserFromGroup',
                    'cognito-idp:AdminSetUserMFAPreference',
                    'cognito-idp:ListIdentityProviders',
                    'cognito-idp:AdminDisableUser',
                    'cognito-idp:AdminEnableUser',
                    'cognito-idp:AdminResetUserPassword',
                ],
                list: [
                    'cognito-idp:DescribeUserPool',
                    'cognito-idp:ListUsers',
                    'cognito-idp:AdminCreateUser',
                    'cognito-idp:AdminListGroupsForUser',
                    'cognito-idp:ListIdentityProviders',
                    'cognito-idp:AdminAddUserToGroup',
                    'cognito-idp:AdminSetUserMFAPreference',
                    'cognito-idp:AdminLinkProviderForUser',
                    'cognito-idp:ListUsersInGroup',]
            },
            groups: {
                normal: [
                    'cognito-idp:DeleteGroup',
                    'cognito-idp:AdminAddUserToGroup',
                    'cognito-idp:UpdateGroup',
                    'cognito-idp:AdminRemoveUserFromGroup',
                    'cognito-idp:GetGroup'],
                list: [
                    'cognito-idp:ListGroups',
                    'cognito-idp:ListIdentityProviders',
                    'cognito-idp:CreateGroup']
            },
            idps: {
                normal: [
                    'cognito-idp:CreateIdentityProvider',
                    'cognito-idp:DescribeIdentityProvider',
                    'cognito-idp:DeleteIdentityProvider',
                    'cognito-idp:UpdateIdentityProvider'],
                list: [
                    'cognito-idp:CreateIdentityProvider',
                    'cognito-idp:ListIdentityProviders']
            },
            appclients: {
                normal: [
                    'cognito-idp:DescribeUserPool',
                    'cognito-idp:DescribeUserPoolClient',
                    'cognito-idp:UpdateUserPoolClient',
                    'cognito-idp:DeleteUserPoolClient'],
                list: [
                    'cognito-idp:DescribeUserPool',
                    'cognito-idp:ListUserPoolClients',
                    'cognito-idp:DescribeUserPoolClient',
                    'cognito-idp:CreateUserPoolClient']
            },
            samls: {
                normal: [],
                list: []
            }
        };

        statements.push(
            new PolicyStatement({
                actions: isList ? actions[resourceType as keyof typeof actions].list : actions[resourceType as keyof typeof actions].normal,
                resources: [
                    userPoolArn,
                ],
            })
        );

        if (resourceType === 'appclients') {
            statements.push(
                new PolicyStatement({
                    resources: [
                        this.spinfoTable.tableArn,
                    ],
                    actions: [
                        'dynamodb:GetItem',
                        'dynamodb:PutItem',
                        'dynamodb:Scan',
                        'dynamodb:DeleteItem',
                    ],
                })

            );
        }

        return statements;
    }

    private createLambda(lambdaName: string, userPoolId: string, statements: PolicyStatement[]) {
        const lambda = new Function(this.scope, lambdaName, {
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, `/../lambda/${lambdaName}`)),
            environment: {
                USERPOOL_ID: userPoolId,
                USERPOOL_DOMAINNAME: this.hostedUIDomain,
                AMFA_BASE_URL: this.amfaBaseUrl,
                AMFA_SPINFO_TABLE: this.spinfoTable.tableName,
            },
            timeout: Duration.minutes(5)
        });

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy`, { statements })
        );

        return lambda;
    };

    private createSmtpConfigLambda() {

        const lambdaName = 'smtpconfig';

        let lambda = new Function(this.scope, lambdaName, {
            runtime: Runtime.NODEJS_20_X,
            handler: 'index.handler',
            code: Code.fromAsset(path.join(__dirname, `/../lambda/${lambdaName}/dist`)),
            environment: {
                TENANT_ID: tenant_id ? tenant_id : 'unknowntid',
            },
            timeout: Duration.minutes(5)
        });

        lambda.role?.attachInlinePolicy(
            new Policy(this.scope, `${lambdaName}-policy`, {
                statements: [
                    new PolicyStatement({
                        resources: ['*'],
                        actions: [
                            'secretsmanager:GetSecretValue',
                            'secretsmanager:UpdateSecretValue'
                        ],
                    }),
                ],
            })
        );

        return lambda;
    }

}