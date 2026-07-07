#!/bin/bash

set -e

for DIR in "next-gdg"
do
    pushd $DIR
    npm ci
    rm -rf node_modules/@bytecat/glide-data-grid
    ln -s ../../../../packages/core/ node_modules/@bytecat/glide-data-grid
    popd
done
