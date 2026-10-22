#!/usr/bin/env bash
CLI_LOCATION="$(pwd)/cli"
printf "Building plugin in $(pwd)"
echo "1687" | sudo -S $CLI_LOCATION/decky plugin build $(pwd)