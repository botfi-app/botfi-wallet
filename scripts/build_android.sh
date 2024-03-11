#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

unlink $BASEDIR/../capacitor.config.ts
cp -f $BASEDIR/../capacitor.config-prod.ts $BASEDIR/../capacitor.config.ts

#unlink $BASEDIR/../main.js
#cp -f $BASEDIR/../main_capacitor.js $BASEDIR/../main.js 

#SSL_SKIP_DIR="$BASEDIR/../node_modules/@jcesarmobile/ssl-skip"

#if [ -d $SSL_SKIP_DIR ]; then
npm uninstall "@jcesarmobile/ssl-skip" -f
#fi

sh $BASEDIR/build.sh
 
# remove som externalized files 
rm -rf $BASEDIR/../dist/images/crypto/

npx cap sync  
npx cap copy 
#npx cap open android