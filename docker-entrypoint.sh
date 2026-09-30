#!/bin/sh
set -eu

if [ -z "${CROP_HEALTH_API_KEY:-}" ]; then
  echo "CROP_HEALTH_API_KEY is required to start the Fieldwise API proxy." >&2
  exit 1
fi

envsubst '${CROP_HEALTH_API_KEY}' < /etc/nginx/default.conf.template > /etc/nginx/conf.d/default.conf
exec nginx -g 'daemon off;'
