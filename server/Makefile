.PHONY: dev docker-down docker-up build deploy db-generate

dev: docker-down docker-up npm-dev

docker-down:
	docker compose down

docker-up:
	docker compose up -d

npm-dev:
	npm run dev

build:
	npm run build

db-generate:
	npm run db:generate
