#!/bin/bash

# Create network if it doesn't exist
docker network create contract-management-network || true

# Build and start containers
docker-compose up --build