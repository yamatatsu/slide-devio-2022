#!/usr/bin/env bash

export DATABASE_URL=mysql://$DB_USERNAME:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

exec "$@"
