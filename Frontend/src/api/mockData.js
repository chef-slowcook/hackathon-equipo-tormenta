/**
 * Data layer for RainCaster Galapagos.
 * Fetches live station data from the Backend API.
 *
 * Station coordinates from the official RainCaster guidelines (WGS84).
 */

export const STATIONS = [
    {
        id: "mira",
        name: "El Mirador",
        lat: -0.886247558,
        lon: -89.53958685,
        altitude: 387,
        description: "Coastal/lowland station",
    },
    {
        id: "cer",
        name: "Cerro Alto",
        lat: -0.887048868,
        lon: -89.53098555,
        altitude: 517,
        description: "Highland station",
    },
    {
        id: "jun",
        name: "El Junco",
        lat: -0.896537076,
        lon: -89.48162446,
        altitude: 548,
        description: "Near the freshwater lake at the island's summit",
    },
    {
        id: "merc",
        name: "Merceditas",
        lat: -0.889712315,
        lon: -89.44202039,
        altitude: 100,
        description: "Mid-elevation agricultural zone",
    },
];

/**
 * Precipitation class thresholds from the RainCaster guidelines (Page 6).
 * Class 0: No rain (0 mm)
 * Class 1: Light rain (0 < sum <= threshold)
 * Class 2: Heavy rain (sum > threshold)
 */
export const PRECIP_THRESHOLDS = {
    "1h": { noRain: 0, lightMax: 0.254 },
    "3h": { noRain: 0, lightMax: 0.508 },
    "6h": { noRain: 0, lightMax: 0.762 },
};

/**
 * Fetches current station data from the backend API.
 * Returns an object keyed by station id.
 */
export async function fetchStationData() {
    const res = await fetch("/api/stations");
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return res.json();
}
