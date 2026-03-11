import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { CLASS_LABELS, FORECAST_HORIZONS, WEATHER_TO_CLASS } from "../constants";

// San Cristóbal center & bounds
const MAP_CENTER = [-0.89, -89.49];
const MAP_ZOOM = 12;

// Label placement offsets to avoid overlap (El Mirador & Cerro Alto are very close)
const LABEL_OFFSETS = {
    mira: { anchor: [-30, 8], dir: "left" },
    cer: { anchor: [-30, -20], dir: "right" },
    jun: { anchor: [0, -16], dir: "top" },
    merc: { anchor: [0, -16], dir: "top" },
};

/** Inline SVG strings for each weather class — CSS animation classes from animations.css apply. */
function weatherIconSVG(weatherClass) {
    if (weatherClass === 0) {
        const rays = [0, 45, 90, 135, 180, 225, 270, 315]
            .map((a) => `<line class="sun-icon-ray" x1="16" y1="4" x2="16" y2="7" stroke="#fbbf24" stroke-width="2" stroke-linecap="round" transform="rotate(${a} 16 16)"/>`)
            .join("");
        return `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="filter:drop-shadow(0 1px 4px rgba(251,191,36,0.5))">${rays}<circle class="sun-icon-core" cx="16" cy="16" r="6" fill="#fbbf24"/></svg>`;
    }
    if (weatherClass === 1) {
        return `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="filter:drop-shadow(0 1px 4px rgba(56,189,248,0.4))">
            <path class="cloud-icon-body" d="M8 18a5 5 0 0 1 .5-9.9A7 7 0 0 1 22 10h1a4 4 0 0 1 0 8H8z" fill="#64748b"/>
            <line class="rain-icon-drop rain-icon-drop--1" x1="11" y1="21" x2="10" y2="26" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
            <line class="rain-icon-drop rain-icon-drop--2" x1="16" y1="21" x2="15" y2="26" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
            <line class="rain-icon-drop rain-icon-drop--3" x1="21" y1="21" x2="20" y2="26" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round"/>
        </svg>`;
    }
    // Heavy rain / storm
    return `<svg width="28" height="28" viewBox="0 0 32 32" fill="none" style="filter:drop-shadow(0 1px 6px rgba(99,102,241,0.6))">
        <path class="cloud-icon-body" d="M8 18a5 5 0 0 1 .5-9.9A7 7 0 0 1 22 10h1a4 4 0 0 1 0 8H8z" fill="#475569"/>
        <polygon class="storm-icon-bolt" points="17,14 14,20 16,20 14,27 20,18 17,18 19,14" fill="#fbbf24"/>
        <line class="rain-icon-drop rain-icon-drop--1" x1="9" y1="21" x2="8" y2="25" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/>
        <line class="rain-icon-drop rain-icon-drop--2" x1="23" y1="21" x2="22" y2="25" stroke="#6366f1" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`;
}

function createStationIcon(health, hasHeavyAlert, weatherClass) {
    const color =
        health === "healthy" ? "#22c55e" :
        health === "offline" ? "#ef4444" :
        "#eab308";
    const ring = hasHeavyAlert
        ? "box-shadow:0 0 0 4px rgba(99,102,241,0.6), 0 0 12px rgba(99,102,241,0.4);"
        : health === "offline"
        ? "box-shadow:0 0 0 3px rgba(239,68,68,0.4), 0 0 10px rgba(239,68,68,0.3);"
        : "box-shadow:0 0 8px rgba(0,0,0,0.5);";
    const pulse = health === "degraded" || health === "offline" || hasHeavyAlert
        ? "animation:marker-pulse 2s infinite;"
        : "";

    if (health === "offline") {
        // Offline: just the dot, no weather icon
        return L.divIcon({
            className: "",
            iconSize: [18, 18],
            iconAnchor: [9, 9],
            html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;${ring}cursor:pointer;${pulse}"></div>`,
        });
    }

    // Online/degraded: animated weather icon stacked above the dot
    // Layout: [28px SVG] [2px gap] [18px dot] = 48px total, anchor at dot centre (y=39)
    return L.divIcon({
        className: "",
        iconSize: [28, 48],
        iconAnchor: [14, 39],
        html: `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;">
            ${weatherIconSVG(weatherClass)}
            <div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #fff;${ring}cursor:pointer;${pulse}"></div>
        </div>`,
    });
}

function createLabelIcon(name, stationId) {
    const offset = LABEL_OFFSETS[stationId] || { anchor: [0, -16] };
    return L.divIcon({
        className: "station-label-icon",
        iconAnchor: offset.anchor,
        html: `<span class="station-label">${name}</span>`,
    });
}

export default function StationMap({ stations, onSelectStation, selectedId }) {
    if (!stations) return null;

    const stationList = Object.values(stations);

    return (
        <div className="map-container">
            <MapContainer
                center={MAP_CENTER}
                zoom={MAP_ZOOM}
                zoomControl={true}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />
                {stationList.map((station) => {
                    const hasHeavyAlert = FORECAST_HORIZONS.some(
                        (h) => station.forecast[h].class === 2
                    );
                    const weatherClass = WEATHER_TO_CLASS[station.current?.weather] ?? 0;
                    // Include forecast + weather state in key so Leaflet remounts
                    // the marker (and its animated icon) whenever predictions change.
                    const forecastKey = FORECAST_HORIZONS.map(
                        (h) => `${h}:${station.forecast[h].class}`
                    ).join(",");
                    return (
                        <React.Fragment key={station.id}>
                            <Marker
                                key={`${station.id}-${station.health}-${weatherClass}-${forecastKey}`}
                                position={[station.lat, station.lon]}
                                icon={createStationIcon(station.health, hasHeavyAlert, weatherClass)}
                                eventHandlers={{
                                    click: () => onSelectStation(station.id),
                                }}
                            >
                                <Tooltip
                                    direction="top"
                                    offset={[0, -14]}
                                    className="station-tooltip"
                                >
                                    <strong>{station.name}</strong> ({station.id})
                                    <br />
                                    {station.health === "healthy" ? "Online" : station.health === "offline" ? "Offline" : "Degraded"} · {station.altitude} m
                                    <br />
                                    {FORECAST_HORIZONS.map((h, i) => (
                                        <span key={h}>
                                            {i > 0 && " · "}+{h}: {CLASS_LABELS[station.forecast[h].class]}{" "}
                                            <span style={{ opacity: 0.7 }}>
                                                ({Math.round(station.forecast[h].prob * 100)}%)
                                            </span>
                                        </span>
                                    ))}
                                </Tooltip>
                            </Marker>
                            {/* Permanent station name label */}
                            <Marker
                                position={[station.lat, station.lon]}
                                icon={createLabelIcon(station.name, station.id)}
                                interactive={false}
                            />
                        </React.Fragment>
                    );
                })}
            </MapContainer>
        </div>
    );
}
