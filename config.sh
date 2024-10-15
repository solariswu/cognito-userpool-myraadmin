#!/bin/bash

# deployment tenant info
export TENANT_ID='' ## example 'amfa-dev006'

# DNS domain and hosted zone id, required
export ROOT_DOMAIN_NAME='' ## example 'apersona2.aws-amplify.dev'
export ROOT_HOSTED_ZONE_ID='' ## example public hosted zone 'apersona2.aws-amplify.dev' id is 'Z0123456789ABCDEFGH'

# end users userpool id
export APP_USERPOOL_ID='' ## example 'eu-west-1_QJkg4zItt'

# optional
export SP_PORTAL_URL='' ## example 'https://apersona.netlify.app' ## can be removed if not use service providers portal.
export EXTRA_APP_URL='' ## example 'https://amfa.netlify.app/' ## can be removed if no extra application using AMFA controller.




