#!/usr/bin/env bash 

function install_package_if_needed() {
    local p=${1:-Package required}
    local v=${2:-Version required}
    shift 2
    local i=$(node -p "require('$p/package.json').version" 2>/dev/null)
    [ "$i" == "$v" ] || npm "$@" install "$p@$v" -f
}

BASEDIR=$(dirname "$0")

install_package_if_needed @jcesarmobile/ssl-skip 0.2.0

sh $BASEDIR/core.sh
npx vite --host


