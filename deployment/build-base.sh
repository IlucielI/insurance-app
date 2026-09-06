#!/usr/bin/env sh
set -eu

docker build \
  -f deployment/Dockerfile.base \
  -t insurance-app-base:latest \
  .
