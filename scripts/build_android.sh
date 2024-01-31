#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

#SSL_SKIP_INSTALLED=$(node $BASEDIR/module_exists.cjs "@jcesarmobile/ssl-skip")

SSL_SKIP_DIR="$BASEDIR/../node_modules/@jcesarmobile/ssl-skip"

if [ -d $SSL_SKIP_DIR ]; then
    npm uninstall "@jcesarmobile/ssl-skip" -f
fi

sh $BASEDIR/build.sh
 
# remove som externalized files 
rm -rf $BASEDIR/../dist/images/crypto/

npx cap sync  
npx cap copy 
#npx cap open android