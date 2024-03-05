#!/bin/bash

API_DOTENV='./apps/api/.env'

# Check if the API env file exists
if ! [ -f $API_DOTENV ]; then
  echo "Can not find API .env file"
fi

. $API_DOTENV # Source all the variables into this bash instance

# This assumes that all the required information is defined
# in the .env file correctly
DATABASES=("$DATABASE_NAME")
PASSWORD=$DATABASE_PASSWORD

mysql_exec() {
  local command="$1"
  local database="$2"
  docker compose -p 4537-lab-5 -f ./docker-compose.yml exec -e=MYSQL_PWD=$PASSWORD -it mysql-resource sh -c "mysql -Nse \"$command\" $database"
}

for database in ${DATABASES[@]}; do
  tables=$(mysql_exec "SHOW TABLES" "$database")

  for table in $tables; do
    echo -e "[$database] Dropping $table..."
    mysql_exec "SET foreign_key_checks = 0; DROP TABLE $table" $database
  done
done
