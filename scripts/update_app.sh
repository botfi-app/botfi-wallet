#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

cd $BASEDIR/../

git pull 
#npx @capgo/cli encrypt .