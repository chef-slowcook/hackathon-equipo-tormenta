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

| Method | Path            | Description                                         |
|--------|-----------------|-----------------------------------------------------|
| GET    | `/`             | Health check / welcome message                      |
| GET    | `/data`         | Raw sensor readings in the buffer                   |
| GET    | `/summary`      | Aggregated precipitation statistics                 |
| POST   | `/sensor-data`  | Receive a sensor reading (JSON body)                |
| GET    | `/predict`      | Run ML pipeline and return rain forecast (1-6 hrs)  |

### GET `/predict` response

Returns the predicted rain category for the next 1-6 hours once the buffer has >= 22 rows:

```json
{
  "station": "Santa Cruz",
  "ds": "2026-03-10T14:30:00+00:00",
  "label": "no_rain",
  "label_2h": "light_rain",
  "label_3h": "no_rain",
  "label_4h": "heavy_rain",
  "label_5h": "no_rain",
  "label_6h": "no_rain"
}
```

Label values: `no_rain` (0), `light_rain` (1), `heavy_rain` (2).

## Streaming simulator

The simulator script generates fake sensor data and POSTs it to the running API.

Start the server first, then in a second terminal:

```bash
uv run python simulator.py
```

It pre-seeds the buffer with 24 rows so `/predict` is immediately available, then sends a new reading every 5 seconds.

Options:

```bash
uv run python simulator.py --interval 2       # send every 2 seconds
uv run python simulator.py --station Isabela   # different station name
uv run python simulator.py --no-seed           # skip pre-seeding
```

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
