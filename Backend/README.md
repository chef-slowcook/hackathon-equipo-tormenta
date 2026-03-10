# Backend – Rain Precipitation API

FastAPI backend for the Galapagos Islands rain precipitation data, managed with [uv](https://docs.astral.sh/uv/).

## Requirements

- [uv](https://docs.astral.sh/uv/getting-started/installation/) >= 0.9

## Setup

Install dependencies and create the virtual environment:

```bash
uv sync
```

## Running the server

```bash
uv run uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Endpoints

| Method | Path       | Description                          |
|--------|------------|--------------------------------------|
| GET    | `/`        | Health check / welcome message       |
| GET    | `/data`    | Raw precipitation records            |
| GET    | `/summary` | Aggregated precipitation statistics  |

## Interactive docs

FastAPI provides auto-generated docs out of the box:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Docker

Build and run in one command:

```bash
docker build -t backend . && docker run -p 8000:8000 backend
```

Or step by step:

```bash
# Build the image
docker build -t backend .

# Run the container
docker run -p 8000:8000 backend
```

The API will be available at `http://localhost:8000`.

## Managing dependencies

Add a new package:

```bash
uv add <package>
```

Remove a package:

```bash
uv remove <package>
```

Upgrade all packages:

```bash
uv sync --upgrade
```
