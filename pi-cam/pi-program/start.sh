#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ENTRY_POINT="node $DIR/../node_modules/.bin/ts-node -T $DIR/detect.ts"

echo "START $ENTRY_POINT"
exec $ENTRY_POINT