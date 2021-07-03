#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"

ENTRY_POINT="$DIR/program.py"

echo "START $ENTRY_POINT"
exec python -u $ENTRY_POINT
# uname -a
# sleep 120
#sudo reboot
# ip link show
