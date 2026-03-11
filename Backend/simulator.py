"""
Streaming simulator — generates fake sensor readings for all 4 stations
and POSTs them to the FastAPI backend every INTERVAL seconds.

Generates weather states (clear / light_rain / heavy_rain) that persist
long enough for lag features to reflect the current condition.

Usage:
    uv run python simulator.py                  # default: 1.5s interval
    uv run python simulator.py --interval 2     # custom interval
"""

import argparse
import os
import random
import time

import httpx

API_URL = os.environ.get("API_URL", "http://localhost:8000/sensor-data")

STATION_IDS = ["mira", "cer", "jun", "merc"]

# How long a station stays offline (in ticks) once it fails.
# At 1.5 s/tick this is roughly 6–15 seconds.
OFFLINE_DURATION = (4, 10)

# Shared set — tracks which stations are currently offline.
# At most 2 stations may be offline simultaneously.
_offline_stations: set[str] = set()

# Sensor value ranges per weather state.
# Key insight: Rain_mm_Tot lags, VW_3_Avg lags, LWmV_Avg, and AirTC_Avg
# are the most important features — make them coherent per state.
WEATHER_STATES = {
    "clear": {
        "AirTC_Avg":   (26.0, 32.0),
        "WS_ms_Avg":   (0.5,  6.0),
        "SlrMJ_Tot":   (1.5,  3.5),
        "NR_Wm2_Avg":  (150.0, 400.0),
        "CNR_Wm2_Avg": (120.0, 350.0),
        "VW_Avg":      (0.05, 0.20),
        "VW_2_Avg":    (0.05, 0.20),
        "VW_3_Avg":    (0.05, 0.18),
        "LWmV_Avg":    (380.0, 450.0),   # high mV = dry leaf
        "LWMWet_Tot":  (0.0,  5.0),
        "Rain_mm_Tot": (0.0,  0.05),
    },
    "light_rain": {
        "AirTC_Avg":   (20.0, 25.0),
        "WS_ms_Avg":   (3.0,  9.0),
        "SlrMJ_Tot":   (0.1,  1.0),
        "NR_Wm2_Avg":  (-20.0, 100.0),
        "CNR_Wm2_Avg": (-15.0, 80.0),
        "VW_Avg":      (0.30, 0.45),
        "VW_2_Avg":    (0.30, 0.45),
        "VW_3_Avg":    (0.32, 0.48),
        "LWmV_Avg":    (270.0, 330.0),   # low mV = wet leaf
        "LWMWet_Tot":  (20.0, 50.0),
        "Rain_mm_Tot": (0.1,  1.5),
    },
    "heavy_rain": {
        "AirTC_Avg":   (18.0, 22.0),
        "WS_ms_Avg":   (6.0,  12.0),
        "SlrMJ_Tot":   (0.0,  0.2),
        "NR_Wm2_Avg":  (-50.0, 20.0),
        "CNR_Wm2_Avg": (-30.0, 10.0),
        "VW_Avg":      (0.42, 0.55),
        "VW_2_Avg":    (0.42, 0.55),
        "VW_3_Avg":    (0.45, 0.55),
        "LWmV_Avg":    (250.0, 280.0),   # very low mV = saturated leaf
        "LWMWet_Tot":  (45.0, 60.0),
        "Rain_mm_Tot": (2.0,  5.0),
    },
}

# How long each state lasts (in ticks) before possibly transitioning.
# Needs to be > 21 ticks so lag features reflect the state.
STATE_DURATION = {
    "clear":      (30, 50),
    "light_rain": (22, 30),
    "heavy_rain": (18, 26),
}

# Transition probabilities: given current state, probability of each next state.
# Rule: rain must wind down gradually — heavy_rain NEVER jumps directly to clear;
# it must pass through light_rain first. This prevents a "no rain" gap mid-event.
STATE_TRANSITIONS = {
    "clear":      {"clear": 0.25, "light_rain": 0.55, "heavy_rain": 0.20},
    "light_rain": {"clear": 0.20, "light_rain": 0.40, "heavy_rain": 0.40},
    "heavy_rain": {"clear": 0.00, "light_rain": 0.65, "heavy_rain": 0.35},
}


class StationSimulator:
    def __init__(self, station_id: str):
        self.station_id = station_id
        self.state = random.choice(list(WEATHER_STATES.keys()))
        self.ticks_remaining = random.randint(*STATE_DURATION[self.state])
        self.offline_ticks = 0

    def is_offline(self) -> bool:
        return self.offline_ticks > 0

    def _maybe_transition(self):
        self.ticks_remaining -= 1
        if self.ticks_remaining <= 0:
            transitions = STATE_TRANSITIONS[self.state]
            self.state = random.choices(
                list(transitions.keys()),
                weights=list(transitions.values()),
            )[0]
            self.ticks_remaining = random.randint(*STATE_DURATION[self.state])
            print(f"  [{self.station_id}] → {self.state} for {self.ticks_remaining} ticks")

    def _maybe_go_offline(self):
        # At most 2 stations offline at once; 4% chance per tick otherwise.
        if len(_offline_stations) >= 2:
            return
        if random.random() < 0.04:
            self.offline_ticks = random.randint(*OFFLINE_DURATION)
            _offline_stations.add(self.station_id)
            print(f"  [{self.station_id}] → OFFLINE for {self.offline_ticks} ticks")

    def generate_reading(self) -> dict | None:
        """Returns None when the station is offline (sensor failure)."""
        if self.offline_ticks > 0:
            self.offline_ticks -= 1
            if self.offline_ticks == 0:
                _offline_stations.discard(self.station_id)
                print(f"  [{self.station_id}] → RECOVERED")
            return None
        self._maybe_transition()
        self._maybe_go_offline()
        ranges = WEATHER_STATES[self.state]
        reading = {"station": self.station_id}
        for field, (lo, hi) in ranges.items():
            reading[field] = round(random.uniform(lo, hi), 3)
        return reading


def _make_reading(station_id: str, state: str) -> dict:
    """Generate a single raw sensor reading for a given weather state."""
    reading = {"station": station_id}
    for field, (lo, hi) in WEATHER_STATES[state].items():
        reading[field] = round(random.uniform(lo, hi), 3)
    return reading


def seed_buffers(client: httpx.Client, simulators: dict[str, StationSimulator], n_per_state: int = 8):
    """Pre-seed buffers cycling through all weather states (clear → light_rain → heavy_rain).

    This ensures the lag features the ML model sees on the very first request
    reflect a real weather progression rather than a single monotone state,
    which would always produce a 'no_rain' prediction.
    """
    states = ["clear", "light_rain", "heavy_rain"]
    total = n_per_state * len(states) * len(STATION_IDS)
    print(f"Seeding {len(STATION_IDS)} stations × {len(states)} states × {n_per_state} rows ({total} total)...")
    for station_id in STATION_IDS:
        for state in states:
            for _ in range(n_per_state):
                reading = _make_reading(station_id, state)
                resp = client.post(API_URL, json=reading)
                resp.raise_for_status()
    print("All buffers seeded. Predictions are now available.\n")


def main():
    parser = argparse.ArgumentParser(description="Sensor data streaming simulator")
    parser.add_argument("--interval", type=float, default=1.5, help="Seconds between ticks")
    parser.add_argument("--no-seed", action="store_true", help="Skip pre-seeding the buffers")
    args = parser.parse_args()

    simulators = {sid: StationSimulator(sid) for sid in STATION_IDS}

    with httpx.Client(timeout=10) as client:
        if not args.no_seed:
            seed_buffers(client, simulators)

        tick = 1
        while True:
            for station_id, sim in simulators.items():
                reading = sim.generate_reading()
                if reading is None:
                    print(f"[{tick}] {station_id} (OFFLINE)")
                    continue
                resp = client.post(API_URL, json=reading)
                resp.raise_for_status()
                info = resp.json()
                print(f"[{tick}] {station_id} ({sim.state:11s}) | buf={info['buffer_size']} | rain={reading['Rain_mm_Tot']:.2f}mm")
            tick += 1
            time.sleep(args.interval)


if __name__ == "__main__":
    main()
