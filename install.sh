#!/bin/bash
unset TENANT_ID && unset ROOT_DOMAIN_NAME && ROOT_HOSTED_ZONE_ID && unset APP_USERPOOL_ID && unset SP_PORTAL_URL && unset EXTRA_APP_URL

source ./config.sh

$(aws route53 create-hosted-zone --name adminportal.apersona4.aws-amplify.dev --caller-reference $RANDOM | jq .DelegationSet.NameServers)
if [ -z "$TENANT_ID" ]; then
    echo "TENANT_ID is not set, please set TENANT_ID in config.sh"
    exit 1
fi

if [ -z "$ROOT_DOMAIN_NAME" ]; then
    echo "ROOT_DOMAIN_NAME is not set, please set ROOT_DOMAIN_NAME in config.sh"
    exit 1
fi

if [ -z "$ROOT_HOSTED_ZONE_ID" ]; then
    echo "ROOT_HOSTED_ZONE_ID is not set, please set ROOT_HOSTED_ZONE_ID in config.sh"
    exit 1
fi

DOMAINNAME=$(aws route53 get-hosted-zone --id $ROOT_HOSTED_ZONE_ID | jq -r .HostedZone.Name)
if [ "$DOMAINNAME" != "$ROOT_DOMAIN_NAME""." ]; then
    echo "ROOT_DOMAIN_NAME and ROOT_HOSTED_ZONE_ID does not match"
    exit 1
fi

if aws sts get-caller-identity >/dev/null; then

    ADMINPORTAL_DOMAIN_NAME="adminportal.""$ROOT_DOMAIN_NAME"
    ADMINPORTAL_HOSTED_ZONE_ID=$(aws route53 create-hosted-zone --name $ADMINPORTAL_DOMAIN_NAME --caller-reference $RANDOM | jq .id)
    NAME_SERVERS=$(aws route53 get-hosted-zone --id $ADMINPORTAL_HOSTED_ZONE_ID | jq .DelegationSet.NameServers)

    $(rm -rf ns_record.json)

    echo " {                         " >> ns_record.json
    echo "  \"Changes\": [{          " >> ns_record.json
    echo "  \"Action\": \"CREATE\",  " >> ns_record.json
    echo "  \"ResourceRecordSet\": { " >> ns_record.json
    echo "  \"Name\": \"$ADMINPORTAL_DOMAIN_NAME\", " >> ns_record.json
    echo "  \"Type\": \"NS\",        " >> ns_record.json
    echo "  \"TTL\": 300,            " >> ns_record.json
    echo "  \"ResourceRecords\": [   " >> ns_record.json

    count=0
    for NAME_SERVER in $NAME_SERVERS; do
            if [ $count = 1 ] || [ $count = 2 ] || [ $count = 3 ]; then
                    echo "  { \"Value\": ${NAME_SERVER%?}}, "  >> ns_record.json
            fi
            if [ $count = 4 ]; then
                    echo "  { \"Value\": $NAME_SERVER} "  >> ns_record.json
            fi
            ((count++))
    done

    echo "                       ]   " >> ns_record.json
    echo "  }}]                      " >> ns_record.json
    echo " }                         " >> ns_record.json

    RESULT=$(aws route53 change-resource-record-sets --hosted-zone-id $ROOT_HOSTED_ZONE_ID --change-batch file://ns_record.json)
    $(rm -rf ns_record.json)

    source ~/.bashrc
    NODE_OPTIONS=--max-old-space-size=8192

    echo "install application dependency libs"
    npm install

    if [ -z "$SP_PORTAL_URL" ]; then
        echo "SP_PORTAL_URL is not configured"
        if [ -z "$EXTRA_APP_URL" ]; then
        echo "EXTRA_APP_URL is not configured too, you would need to manually config userpool callback url later"
        else
        export SP_PORTAL_URL=$EXTRA_APP_URL
        echo "using EXTRA_APP_URL as default application url"
        fi
    fi


    #get region and account by EC2 info
    TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
    EC2_AVAIL_ZONE=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/availability-zone)
    export CDK_DEPLOY_REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region)
    export CDK_DEPLOY_ACCOUNT=$(aws sts get-caller-identity | jq -r .Account)


    if ! aws iam get-role --role-name CrossAccountDnsDelegationRole-DO-NOT-DELETE >/dev/null 2>&1; then
        rm delegationRole.json
        echo "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"AWS\":\"arn:aws:iam::$CDK_DEPLOY_ACCOUNT:root\"},\"Action\":\"sts:AssumeRole\"}]}" >> delegationRole.json
        aws iam create-role --role-name CrossAccountDnsDelegationRole-DO-NOT-DELETE --assume-role-policy-document file://delegationRole.json
        aws iam create-policy --policy-name dns-delegation-policy --policy-document file://delegationPolicy.json
        aws iam attach-role-policy --role-name CrossAccountDnsDelegationRole-DO-NOT-DELETE --policy-arn "arn:aws:iam::$CDK_DEPLOY_ACCOUNT:policy/dns-delegation-policy"
    fi

    echo "generate ADMIN Portal front end config file"

    rm -rf src/aws-export_gen.js
    echo "const awsmobile = {" >> src/aws-export_gen.js
    echo "    \"logo_img_url\": \"https://adminportal.$ROOT_DOMAIN_NAME/Logo.png\"," >> src/aws-export_gen.js
    echo "    \"aws_project_region\": \"$CDK_DEPLOY_REGION\"," >> src/aws-export_gen.js
    echo "    \"aws_backend_api_url\": \"https://api.$ROOT_DOMAIN_NAME\"," >> src/aws-export_gen.js
    echo "    \"aws_hosted_ui_url\": \"https://adminportal-$TENANT_ID.auth.$CDK_DEPLOY_REGION.amazoncognito.com\"," >> src/aws-export_gen.js
    echo "    \"app_callback_uri\": \"$SP_PORTAL_URL\"," >> src/aws-export_gen.js
    echo "    \"aws_samlproxy_api_url\": \"https://api.samlproxy.amfa.aws-amplify.dev/samlproxy\"," >> src/aws-export_gen.js
    echo "    \"aws_user_pools_id\": \"<fillAdminUserPoolIdHere>\"," >> src/aws-export_gen.js
    echo "    \"aws_user_pools_web_client_id\": \"<fillAdminUserPoolAppClientIdHere>\"," >> src/aws-export_gen.js
    echo "}; export default awsmobile;" >> src/aws-export_gen.js

    npm run build
    npm run lambda-build

    echo ""
    echo "**********************************"
    echo "Start building...please wait ..."
    npm run cdk-build

    #check DNS domain

    #bootstrap CDK account and region
    # set -e

    RED='\033[0;31m'
    BOLD="\033[1m"
    YELLOW="\033[38;5;11m"
    NC='\033[0m' # No Color

    echo "*************************************************************************************"
    echo "Now starting deployment of AMFA admin portal"
    npx cdk deploy "$@" --all
    echo "Deploy finished"
    echo "Remember to update src/aws-export.js file according to src/aws-export_gen.js file and deploy again."
    echo "***************"
    unset NODE_OPTIONS
else
    echo -e "${RED} You must execute this script from an EC2 instance which have an Admin Role attached${NC}"
fi

unset TENANT_ID && unset ROOT_DOMAIN_NAME && unset ADMINPORTAL_HOSTED_ZONE_ID && unset SP_PORTAL_URL && unset EXTRA_APP_URL
