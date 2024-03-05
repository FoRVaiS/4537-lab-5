PROJECT = 4537-lab-5

COMPOSE_FILE = ./docker-compose.yml
COMPOSE = docker compose -p $(PROJECT) -f $(COMPOSE_FILE)

MAKEFLAGS += --no-print-directory

.PHONY: check-valid-service clean-db logs down build run dev prod res resource resources install

###### UTILITIES ##########

check-valid-service:
	@./scripts/validate-service.sh $(SERVICE)

clean-db:
	@./scripts/clean-db.sh

########## MANAGEMENT ##########

logs:
	$(COMPOSE) logs -f $(SERVICE)

down:
	$(COMPOSE) down --remove-orphans $(shell $(COMPOSE) config --services | grep -vE "dev-container") -t 1
# Remove all docker volumes that end with `-ephemeral`
	-docker volume rm $(shell docker volume ls -q | grep -E "$(PROJECT)_.*\-ephemeral$$")

build:
	$(COMPOSE) build $(shell $(COMPOSE) config --services | grep -E "($(SERVICE)|common)$$")

########## LAUNCH ##########

run: check-valid-service
	$(COMPOSE) up -d $(shell $(COMPOSE) config --services | grep -E "($(SERVICE)|common)$$")

dev: build down
	$(MAKE) run SERVICE=resource
	$(MAKE) run SERVICE=dev

res: resources
resource: resources
resources: build down
	$(MAKE) run SERVICE=resource


########## OTHER ##########

install:
	npm install && npm install -ws
	npm run build:apps
