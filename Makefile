# Makefile for ContractLens

# Use BuildKit Bake for faster and more efficient builds
DOCKER_COMPOSE = COMPOSE_BAKE=true docker compose

# Build and run the docker compose services
.PHONY: up
up:
	$(DOCKER_COMPOSE) up --build

# Stop the docker compose services
.PHONY: down
down:
	$(DOCKER_COMPOSE) down

# Rebuild the docker compose services
.PHONY: rebuild
rebuild:
	$(DOCKER_COMPOSE) down
	$(DOCKER_COMPOSE) up --build

# View logs of the docker compose services
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs -f

# Remove all containers, networks, and volumes
.PHONY: clean
clean:
	$(DOCKER_COMPOSE) down -v
