#!/bin/bash

set -e

AMFA_FOLD=$(basename "$(pwd)")

check_folder() {
    if [ -d "../${AMFA_FOLD}_pre-release" ]; then
        echo "../${AMFA_FOLD}_pre-release already exists"
        read -p "Do you want to override it? (y/n) " response
        if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
            rm -rf "../${AMFA_FOLD}_pre-release"
        else
            exit 1
        fi
    fi
}

build_project() {
    echo 'Making pre-release ... wait'
    npm install --legacy-peer-deps
    npm run build
    npm run lambda-build
    rm -rf node_modules
}

copy_project() {
    cd ..
    cp -r "$AMFA_FOLD" "${AMFA_FOLD}_pre-release" >/dev/null 2>&1
    cd "${AMFA_FOLD}_pre-release"
}

clean_up() {
    rm -rf cdk.out .git node_modules src public mk_release.sh mk_pre-release.sh config_bak.sh
    rm -rf cdk/lambda/serviceproviderslist/*.mjs cdk/lambda/serviceproviderslist/dist/*.map
    rm -rf cdk/lambda/samlslist/*.mjs cdk/lambda/samlslist/dist/*.map
    rm -rf cdk/lambda/smtpconfig/*.mjs cdk/lambda/smtpconfig/dist/*.map
    rm -rf cdk/lambda/samls/*.mjs cdk/lambda/samls/dist/*.map
    rm -rf cdk/lambda/samlslist/*.mjs cdk/lambda/samlslist/dist/*.map
    rm -rf cdk/lambda/brandings/*.mjs cdk/lambda/brandings/dist/*.map
    rm -rf cdk/lambda/brandingslist/*.mjs cdk/lambda/brandingslist/dist/*.map
    rm -rf cdk/lambda/importusersworker/*.mjs cdk/lambda/importusersworker/dist/*.map
}

initialize_git() {
    git init >/dev/null 2>&1
    git add . >/dev/null 2>&1
    git commit -m "pre rlease version" >/dev/null 2>&1
}

main() {
    check_folder
    git checkout pre-release >/dev/null 2>&1
    build_project
    copy_project
    clean_up
    initialize_git
    echo "Pre-release version made in folder ../${AMFA_FOLD}_pre-release"
}

main "$@"
