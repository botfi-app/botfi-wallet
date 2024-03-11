#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

npm install --save-dev "@jcesarmobile/ssl-skip" -f

unlink $BASEDIR/../capacitor.config.ts
cp -f $BASEDIR/../capacitor.config-dev.ts $BASEDIR/../capacitor.config.ts

npx cap sync && \
npx cap run android &&  \
npx cap sync