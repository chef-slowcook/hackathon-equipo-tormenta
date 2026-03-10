import React from "react";
import WeatherIcon from "./WeatherIcon";

const CLASS_LABELS = ["No rain", "Light rain", "Heavy rain"];
const CLASS_COLORS = ["var(--color-healthy)", "var(--color-degraded)", "var(--color-heavy-rain)"];

export default function StationOverview({ stations, onSelectStation }) {
  if (!stations) return null;

  const stationList = Object.values(stations);
  const anyAlert = stationList.some((s) =>
    ["1h", "3h", "6h"].some((h) => s.forecast[h].class === 2)
  );

  return (
    <div className="overview-panel">
      <div className="overview__header">
        <span className="overview__title">Station Network</span>
        <span className="overview__count">{stationList.length} stations</span>
      </div>

      {anyAlert && (
        <div className="alert-banner alert-banner--overview">
          <span className="alert-banner__icon">⚠</span>
          <span>Heavy rain alerts active</span>
        </div>
      )}

      <div className="overview__list">
        {stationList.map((station) => {
          const hasAlert = ["1h", "3h", "6h"].some(
            (h) => station.forecast[h].class === 2
          );
          return (
            <button
              key={station.id}
              className={`overview-card ${hasAlert ? "overview-card--alert" : ""}`}
              onClick={() => onSelectStation(station.id)}
            >
              <div className="overview-card__top">
                <span
                  className="overview-card__dot"
                  style={{
                    background:
                      station.health === "healthy"
                        ? "var(--color-healthy)"
                        : "var(--color-degraded)",
                  }}
                />
                <span className="overview-card__name">{station.name}</span>
                <span className="overview-card__id">{station.id}</span>
              </div>
              <div className="overview-card__stats">
                <span>{station.current.temperature}°C</span>
                <span>{station.current.precipitation} mm</span>
                <span>{station.current.humidity}%</span>
              </div>
              <div className="overview-card__forecast">
                {["1h", "3h", "6h"].map((h) => (
                  <span key={h} className="overview-card__fc">
                    <WeatherIcon weatherClass={station.forecast[h].class} size={16} />
                    +{h}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
