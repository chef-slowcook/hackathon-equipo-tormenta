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

| Method | Path            | Description                                              |
|--------|-----------------|----------------------------------------------------------|
| GET    | `/`             | Health check / welcome message                           |
| GET    | `/api/stations` | All stations with current readings + rain forecast (frontend) |
| POST   | `/sensor-data`  | Receive a sensor reading (JSON body with `station` id)   |
| GET    | `/data`         | Raw sensor readings per station                          |
| GET    | `/summary`      | Aggregated precipitation statistics across all stations  |
| GET    | `/predict`      | Raw ML pipeline output for a single station (`?station=mira`) |

### GET `/api/stations` response

Returns all 4 stations in the shape the frontend expects:

```json
{
  "mira": {
    "id": "mira",
    "name": "El Mirador",
    "lat": -0.886,
    "lon": -89.539,
    "altitude": 387,
    "health": "healthy",
    "lastUpdate": "2026-03-10T14:30:00+00:00",
    "current": {
      "weather": "clear",
      "temperature": 25.1,
      "humidity": 72,
      "windSpeed": 4.2,
      "precipitation": 0.0,
      "solarRadiation": 0.85,
      "soilMoisture": 0.32,
      "netRadiation": 220
    },
    "forecast": {
      "1h": { "class": 0, "prob": 0.85 },
      "3h": { "class": 1, "prob": 0.62 },
      "6h": { "class": 0, "prob": 0.45 }
    }
  }
}
```

Forecast class values: `0` = no rain, `1` = light rain, `2` = heavy rain.

## Streaming simulator

The simulator script generates fake sensor data and POSTs it to the running API.

Start the server first, then in a second terminal:

```bash
uv run python simulator.py
```

It pre-seeds all 4 station buffers with 24 rows each, then sends a new reading per station every 5 seconds.

Options:

```bash
uv run python simulator.py --interval 2       # send every 2 seconds
uv run python simulator.py --no-seed           # skip pre-seeding
```

## Interactive docs

FastAPI provides auto-generated docs out of the box:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Docker Compose (full stack)

From the **project root**, start all services (backend + simulator + frontend):

```bash
docker compose up --build
```

This starts:
- **Backend** at `http://localhost:8000`
- **Simulator** (auto-seeds data and streams every 5s)
- **Frontend** at `http://localhost:3000`

Stop everything:

```bash
docker compose down
```

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
