#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

node $BASEDIR/multicall3.cjs

# compile contracts with hardhat
npx hardhat compile

node $BASEDIR/deployless.cjs