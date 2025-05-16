# Main Makefile for the frontend project

# Include other Makefiles
include Makefiles/App.mka
include Makefiles/storybook.mk

# Default help command
help:
	@echo "Application Commands:"
	@echo "  make app-up       - Start application container"
	@echo "  make app-shell    - Open shell in the application container"
	@echo "  make app-down     - Stop application container"
	@echo "  make app-stop     - Stop the application inside container"
	@echo "  make app-install  - Install packages using pnpm"
	@echo "  make app-start    - Start the development server with pnpm dev"
	@echo "  make app-status   - Show processes running inside container"
	@echo ""
	@echo "Storybook Commands:"
	@echo "  make story        - Start Storybook in background"
	@echo "  make story-start  - Start Storybook in foreground"
	@echo "  make story-stop   - Stop Storybook"
	@echo "  make story-logs   - Show Storybook logs"
	@echo "  make story-clean  - Clean Storybook container"
	@echo ""
	@echo "Project Commands:"
	@echo "  make status       - Show status of Docker Compose containers"
	@echo "  make help         - Show this help message"

# Set default target
.DEFAULT_GOAL := help
