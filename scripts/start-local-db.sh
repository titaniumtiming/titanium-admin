#!/bin/bash
# Use this script to start a local docker container for a local development database

# TO RUN ON WINDOWS: 
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-local-database.sh`

# On Linux and macOS you can run this script directly - `./start-local-database.sh`

DB_CONTAINER_NAME="local-titanium-admin-mssql"  # Changed to reflect MSSQL
DB_NAME="local_db" # Change to your local database name
DB_PORT=1433 # Default SQL Server port

if ! [ -x "$(command -v docker)" ]; then
  echo "Docker is not installed. Please install Docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  docker start $DB_CONTAINER_NAME
  echo "LOCAL MSSQL database container started"
  exit 0
fi

# # instead of creating new, for now just exit early. This is to avoid the need to restore the database incase the env variables are wrong. If using db for the first time then comment out the next two lines:
# echo "Could not find a local MSSQL database container. Please check your .env file and try again."
# exit 0


# import env variables from .env
set -a
source .env

DB_PASSWORD=$(echo $LOCAL_DATABASE_URL | awk -F':' '{print $3}' | awk -F'@' '{print $1}')

if [ "${#DB_PASSWORD}" -lt 8 ]; then
  echo "The database password must be at least 8 characters long."
  DB_PASSWORD=$(openssl rand -base64 12)
  echo "A random password has been generated for the MSSQL SA user."
fi





# Update the .env file with the new SA password
sed -i -e "s#LOCAL_DATABASE_URL=.*@#LOCAL_DATABASE_URL=$DB_PASSWORD@#" .env

# Run the SQL Server container with the specified environment variables
docker run --name $DB_CONTAINER_NAME \
  -e 'ACCEPT_EULA=Y' \
  -e "SA_PASSWORD=$DB_PASSWORD" \
  -e "MSSQL_PID=Express" \
  -d -p $DB_PORT:1433 \
  mcr.microsoft.com/mssql/server:2019-latest


# local-titanium-admin-mssql

# docker exec -i a60e0462358f571167e797f8966aa748d3ea43697c16b731a032e9f9ccead3a4 mysql -u root -p eesspeveaGHKc8y3 titanium-admin < /tmp/dump.sql


# echo "Waiting for SQL Server to start up..."
# # Loop until SQL Server is ready to accept connections
# until docker exec $DB_CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$DB_PASSWORD" -Q "SELECT 1" &> /dev/null
# do
#     echo "Waiting for SQL Server..."
#     sleep 5
# done

# # Copy the .bak file into the container
# echo "Copying .bak file into the container..."
# docker cp ./scripts/RaceTec.bak local-titanium-admin-mssql:/var/opt/mssql/backup/RaceTec.bak


# # Restore the database from the .bak file using sqlcmd
# echo "Restoring database from .bak file..."
# docker exec $DB_CONTAINER_NAME /opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P "$DB_PASSWORD" \
#   -Q "RESTORE DATABASE RaceTec FROM DISK = '/var/opt/mssql/RaceTec.bak' WITH FILE = 1, NOUNLOAD, REPLACE, STATS = 5"

# echo "Local MSSQL database container was successfully created and database restored"
