"""
Streaming simulator — generates fake sensor readings and POSTs them
to the FastAPI backend every INTERVAL seconds.

Usage:
    uv run python simulator.py                  # default: 5s interval
    uv run python simulator.py --interval 2     # custom interval
"""

import argparse
import random
import time

import httpx

API_URL = "http://localhost:8000/sensor-data"

SENSOR_RANGES = {
    "AirTC_Avg":   (18.0, 32.0),
    "WS_ms_Avg":   (0.0, 12.0),
    "SlrMJ_Tot":   (0.0, 3.5),
    "NR_Wm2_Avg":  (-50.0, 400.0),
    "CNR_Wm2_Avg": (-30.0, 350.0),
    "VW_Avg":      (0.05, 0.55),
    "VW_2_Avg":    (0.05, 0.55),
    "VW_3_Avg":    (0.05, 0.55),
    "LWmV_Avg":    (250.0, 450.0),
    "LWMWet_Tot":  (0.0, 60.0),
    "Rain_mm_Tot": (0.0, 5.0),
}


def generate_reading(station: str = "Santa Cruz") -> dict:
    reading = {"station": station}
    for field, (lo, hi) in SENSOR_RANGES.items():
        reading[field] = round(random.uniform(lo, hi), 3)
    return reading


def seed_buffer(client: httpx.Client, n: int = 24, station: str = "Santa Cruz"):
    """Pre-seed the API buffer with n historical rows so lag features are ready."""
    print(f"Seeding buffer with {n} rows...")
    for i in range(n):
        reading = generate_reading(station)
        resp = client.post(API_URL, json=reading)
        resp.raise_for_status()
    print(f"Buffer seeded ({n} rows). Predictions are now available.\n")


def main():
    parser = argparse.ArgumentParser(description="Sensor data streaming simulator")
    parser.add_argument("--interval", type=float, default=5.0, help="Seconds between readings")
    parser.add_argument("--station", default="Santa Cruz", help="Station name")
    parser.add_argument("--no-seed", action="store_true", help="Skip pre-seeding the buffer")
    args = parser.parse_args()

    with httpx.Client(timeout=10) as client:
        if not args.no_seed:
            seed_buffer(client, station=args.station)

        tick = 1
        while True:
            reading = generate_reading(args.station)
            resp = client.post(API_URL, json=reading)
            resp.raise_for_status()
            info = resp.json()
            print(f"[{tick}] Sent | buffer={info['buffer_size']} | {reading}")
            tick += 1
            time.sleep(args.interval)


if __name__ == "__main__":
    main()
