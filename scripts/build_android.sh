#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

npm uninstall "@jcesarmobile/ssl-skip" -f

sh $BASEDIR/build.sh
 
# remove som externalized files 
rm -rf $BASEDIR/../dist/images/crypto/

npx cap sync  
npx cap copy 
npx cap open android