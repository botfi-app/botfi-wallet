#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

#SSL_SKIP_DIR="$BASEDIR/../node_modules/@jcesarmobile/ssl-skip"

#if [ ! -d $SSL_SKIP_DIR ]; then
    npm install --save-dev "@jcesarmobile/ssl-skip" -f
#fi

unlink $BASEDIR/../capacitor.config.ts
cp -f $BASEDIR/../capacitor.config-dev.ts $BASEDIR/../capacitor.config.ts

cross-env NODE_ENV=development npx cap sync && \
npx cap run android &&  \
npx cap sync