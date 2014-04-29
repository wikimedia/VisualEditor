#!/usr/bin/env bash
cd $(cd $(dirname $0)/..; pwd)

# Disable parallel processing which seems to be causing problems under Ruby 1.8
jsduck --config .docs/config.json --processes 0
ec=$?

cd - > /dev/null

# Exit with exit code of jsduck command
exit $ec
