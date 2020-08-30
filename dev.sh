#!/bin/sh

docker-compose -f docker-compose.common.yml -f docker-compose.dev.yml $@