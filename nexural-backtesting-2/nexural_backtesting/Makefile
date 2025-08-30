.PHONY: help install install-dev test test-coverage lint format type-check security-check clean build docker-build docker-run docs

# Default target
help:
	@echo "Available commands:"
	@echo "  install        - Install production dependencies"
	@echo "  install-dev    - Install development dependencies"
	@echo "  test           - Run tests"
	@echo "  test-coverage  - Run tests with coverage"
	@echo "  lint           - Run linting checks"
	@echo "  format         - Format code with black and isort"
	@echo "  type-check     - Run type checking with mypy"
	@echo "  security-check - Run security checks"
	@echo "  clean          - Clean up cache and build files"
	@echo "  build          - Build the package"
	@echo "  docker-build   - Build Docker image"
	@echo "  docker-run     - Run Docker container"
	@echo "  docs           - Build documentation"

# Installation
install:
	pip install -e .

install-dev:
	pip install -e ".[dev,test,docs]"
	pre-commit install

# Testing
test:
	pytest tests/ -v

test-coverage:
	pytest tests/ -v --cov=. --cov-report=html --cov-report=term-missing

# Code Quality
lint:
	flake8 . --count --select=E9,F63,F7,F82 --show-source --statistics
	flake8 . --count --exit-zero --max-complexity=10 --max-line-length=88 --statistics

format:
	black .
	isort .

type-check:
	mypy . --ignore-missing-imports

security-check:
	bandit -r . -f json -o bandit-report.json
	safety check

# Cleanup
clean:
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	rm -rf build/
	rm -rf dist/
	rm -rf .pytest_cache/
	rm -rf .mypy_cache/
	rm -rf htmlcov/
	rm -f .coverage
	rm -f bandit-report.json
	rm -f safety-report.json

# Build
build:
	python -m build

# Docker
docker-build:
	docker build -f deployment/Dockerfile -t nexural-backtesting .

docker-run:
	docker run -p 8000:8000 nexural-backtesting

# Documentation
docs:
	cd docs && make html

# Development workflow
dev-setup: install-dev
	pre-commit install

ci-check: lint type-check security-check test

# Quick development commands
quick-test:
	pytest tests/ -v -x --tb=short

quick-lint:
	black --check .
	isort --check-only .

# Performance testing
perf-test:
	pytest tests/ -m performance -v

# Integration testing
integration-test:
	pytest tests/ -m integration -v

# Unit testing
unit-test:
	pytest tests/ -m unit -v

