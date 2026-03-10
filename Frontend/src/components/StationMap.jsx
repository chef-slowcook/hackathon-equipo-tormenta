import React from "react";
import { MapContainer, TileLayer, Marker, Tooltip } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// San Cristóbal center & bounds
const MAP_CENTER = [-0.89, -89.49];
const MAP_ZOOM = 12;

const CLASS_LABELS = ["No rain", "Light rain", "Heavy rain"];

// Label placement offsets to avoid overlap (El Mirador & Cerro Alto are very close)
const LABEL_OFFSETS = {
  mira: { anchor: [-30, 8], dir: "left" },    // label to the left
  cer:  { anchor: [-30, -20], dir: "right" },  // label to the right, higher
  jun:  { anchor: [0, -16], dir: "top" },       // label above
  merc: { anchor: [0, -16], dir: "top" },       // label above
};

function createStationIcon(health, hasHeavyAlert) {
  const color = health === "healthy" ? "#22c55e" : "#eab308";
  const ring = hasHeavyAlert
    ? "box-shadow:0 0 0 4px rgba(99,102,241,0.6), 0 0 12px rgba(99,102,241,0.4);"
    : "box-shadow:0 0 8px rgba(0,0,0,0.5);";
  const pulse = health === "degraded" || hasHeavyAlert
    ? "animation:marker-pulse 2s infinite;"
    : "";

  return L.divIcon({
    className: "",
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    html: `<div style="
      width:18px;height:18px;border-radius:50%;
      background:${color};border:3px solid #fff;
      ${ring}cursor:pointer;${pulse}
    "></div>`,
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
          const hasHeavyAlert = ["1h", "3h", "6h"].some(
            (h) => station.forecast[h].class === 2
          );
          return (
            <React.Fragment key={station.id}>
              <Marker
                position={[station.lat, station.lon]}
                icon={createStationIcon(station.health, hasHeavyAlert)}
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
                  {station.health === "healthy" ? "Online" : "Degraded"} · {station.altitude} m
                  <br />
                  +1h: {CLASS_LABELS[station.forecast["1h"].class]} · +3h:{" "}
                  {CLASS_LABELS[station.forecast["3h"].class]} · +6h:{" "}
                  {CLASS_LABELS[station.forecast["6h"].class]}
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
