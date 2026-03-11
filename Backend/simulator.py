"""
Streaming simulator — generates fake sensor readings for all 4 stations
and POSTs them to the FastAPI backend every INTERVAL seconds.

Usage:
    uv run python simulator.py                  # default: 5s interval
    uv run python simulator.py --interval 2     # custom interval
"""

import argparse
import os
import random
import time

import httpx

API_URL = os.environ.get("API_URL", "http://localhost:8000/sensor-data")

STATION_IDS = ["mira", "cer", "jun", "merc"]

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


def generate_reading(station: str) -> dict:
    reading = {"station": station}
    for field, (lo, hi) in SENSOR_RANGES.items():
        reading[field] = round(random.uniform(lo, hi), 3)
    return reading


def seed_buffers(client: httpx.Client, n: int = 24):
    """Pre-seed all station buffers so lag features are immediately available."""
    total = n * len(STATION_IDS)
    print(f"Seeding {len(STATION_IDS)} stations with {n} rows each ({total} total)...")
    for station in STATION_IDS:
        for _ in range(n):
            reading = generate_reading(station)
            resp = client.post(API_URL, json=reading)
            resp.raise_for_status()
    print("All buffers seeded. Predictions are now available.\n")


def main():
    parser = argparse.ArgumentParser(description="Sensor data streaming simulator")
    parser.add_argument("--interval", type=float, default=5.0, help="Seconds between ticks")
    parser.add_argument("--no-seed", action="store_true", help="Skip pre-seeding the buffers")
    args = parser.parse_args()

    with httpx.Client(timeout=10) as client:
        if not args.no_seed:
            seed_buffers(client)

        tick = 1
        while True:
            for station in STATION_IDS:
                reading = generate_reading(station)
                resp = client.post(API_URL, json=reading)
                resp.raise_for_status()
                info = resp.json()
                print(f"[{tick}] {station} | buf={info['buffer_size']} | rain={reading['Rain_mm_Tot']:.1f}mm")
            tick += 1
            time.sleep(args.interval)


if __name__ == "__main__":
    main()
