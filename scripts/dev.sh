#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

SSL_SKIP_DIR="$BASEDIR/../node_modules/@jcesarmobile/ssl-skip"

if [ ! -d $SSL_SKIP_DIR ]; then
    npm install --save-dev "@jcesarmobile/ssl-skip" -f
fi


sh $BASEDIR/core.sh
npx vite --host


