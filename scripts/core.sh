#!/usr/bin/env bash 

BASEDIR=$(dirname "$0")

node $BASEDIR/multicall3.cjs

# compile contracts with hardhat
npx hardhat compile

node $BASEDIR/deployless.cjs

## the generated abi gives error, so paused for now
#node $BASEDIR/optimizeAbi.cjs