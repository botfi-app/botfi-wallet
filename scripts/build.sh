#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

node $BASEDIR/multicall3.js
npx vite build