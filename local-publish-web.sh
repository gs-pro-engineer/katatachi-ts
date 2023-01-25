#!/usr/bin/env bash
set -e

pushd ./web
yarn install
yarn build
popd

rm -rf ./katatachi/web
mv ./web/build ./katatachi/web
