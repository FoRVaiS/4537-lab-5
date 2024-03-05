#!/bin/bash

SERVICE=$1
VALID_SERVICES=$(docker compose config --services)

fn_display_services() {
  echo -e "\nPlease use one of the valid services below:"

  for service in $@; do
    echo " - $service"
  done
}

if [ -z "$SERVICE" ]; then
  echo "Usage: $0 <service>"
  fn_display_services $VALID_SERVICES
  exit 1
fi

if ! echo "$VALID_SERVICES" | grep -qE "$SERVICE"; then
  echo "Invalid service: $SERVICE"
  fn_display_services $VALID_SERVICES
  exit 1
fi
