/**
 * Mock data layer for RainCaster Galapagos.
 * Replace these functions with real API calls when the backend is ready.
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

function randomWeatherState() {
    const r = Math.random();
    if (r < 0.5) return "clear";
    if (r < 0.8) return "light_rain";
    return "heavy_rain";
}

function randomHealth() {
    return Math.random() < 0.85 ? "healthy" : "degraded";
}

function randomForecastClass() {
    const r = Math.random();
    if (r < 0.5) return 0;
    if (r < 0.8) return 1;
    return 2;
}

/**
 * Simulates fetching current station data.
 * Returns an object keyed by station id.
 *
 * When the backend is ready, replace this with:
 *   const res = await fetch(`${API_BASE}/stations`);
 *   return res.json();
 */
export async function fetchStationData() {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 300));

    const now = new Date();

    return Object.fromEntries(
        STATIONS.map((station) => {
            const weather = randomWeatherState();
            return [
                station.id,
                {
                    ...station,
                    health: randomHealth(),
                    lastUpdate: now.toISOString(),
                    current: {
                        weather,
                        temperature: +(20 + Math.random() * 8).toFixed(1),
                        humidity: +(60 + Math.random() * 35).toFixed(0),
                        windSpeed: +(1 + Math.random() * 8).toFixed(1),
                        windDir: Math.floor(Math.random() * 360),
                        precipitation: weather === "clear" ? 0 : +(Math.random() * 2).toFixed(2),
                        solarRadiation: +(0.1 + Math.random() * 0.9).toFixed(2),
                        soilMoisture: +(0.1 + Math.random() * 0.5).toFixed(2),
                        netRadiation: +(50 + Math.random() * 300).toFixed(0),
                    },
                    forecast: {
                        "1h": { class: randomForecastClass(), prob: +(0.5 + Math.random() * 0.5).toFixed(2) },
                        "3h": { class: randomForecastClass(), prob: +(0.4 + Math.random() * 0.5).toFixed(2) },
                        "6h": { class: randomForecastClass(), prob: +(0.3 + Math.random() * 0.5).toFixed(2) },
                    },
                },
            ];
        })
    );
}
