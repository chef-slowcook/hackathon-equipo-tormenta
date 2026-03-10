import React from "react";
import WeatherAnimation from "./WeatherAnimation";
import WeatherIcon from "./WeatherIcon";
import { PRECIP_THRESHOLDS } from "../api/mockData";

const CLASS_LABELS = ["No rain", "Light rain", "Heavy rain"];
const CLASS_COLORS = ["var(--color-healthy)", "var(--color-degraded)", "var(--color-heavy-rain)"];

function AlertBanner({ forecast }) {
  const hasHeavy = ["1h", "3h", "6h"].some((h) => forecast[h].class === 2);
  if (!hasHeavy) return null;

  const horizons = ["1h", "3h", "6h"].filter((h) => forecast[h].class === 2);
  return (
    <div className="alert-banner">
      <span className="alert-banner__icon">⚠</span>
      <span>
        Heavy rain predicted at{" "}
        {horizons.map((h) => `+${h}`).join(", ")}
      </span>
    </div>
  );
}

export default function StationPanel({ station, onClose }) {
  if (!station) return null;

  const { name, id, altitude, description, health, current, forecast, lastUpdate } =
    station;

  return (
    <div className="panel-overlay">
      <div className="panel__header">
        <span className="panel__title">{name}</span>
        <button className="panel__close" onClick={onClose} aria-label="Close panel">
          &times;
        </button>
      </div>

      <div className="panel__body">
        {/* Alert banner */}
        <AlertBanner forecast={forecast} />

        {/* Health & meta */}
        <div>
          <span className={`health-badge health-badge--${health}`}>
            {health === "healthy" ? "● Online" : "● Degraded"}
          </span>
          <p style={{ fontSize: "0.8rem", color: "var(--color-text-muted)", marginTop: 6 }}>
            ID: <strong>{id}</strong> · {altitude} m a.s.l. · {description}
          </p>
        </div>

        {/* Animation */}
        <div>
          <p className="panel__section-title">Current Conditions</p>
          <WeatherAnimation weather={current.weather} />
        </div>

        {/* Current stats */}
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-card__label">Temperature</div>
            <div className="stat-card__value">{current.temperature}°C</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Humidity</div>
            <div className="stat-card__value">{current.humidity}%</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Wind</div>
            <div className="stat-card__value">{current.windSpeed} m/s</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Precip.</div>
            <div className="stat-card__value">{current.precipitation} mm</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Solar Rad.</div>
            <div className="stat-card__value">{current.solarRadiation} kW</div>
          </div>
          <div className="stat-card">
            <div className="stat-card__label">Soil Moisture</div>
            <div className="stat-card__value">{current.soilMoisture}</div>
          </div>
        </div>

        {/* Forecast */}
        <div>
          <p className="panel__section-title">Precipitation Nowcast</p>
          <div className="forecast-list">
            {["1h", "3h", "6h"].map((horizon) => {
              const fc = forecast[horizon];
              const thresh = PRECIP_THRESHOLDS[horizon];
              return (
                <div
                  className={`forecast-row forecast-row--class-${fc.class}`}
                  key={horizon}
                >
                  <span className="forecast-row__horizon">+{horizon}</span>
                  <WeatherIcon weatherClass={fc.class} size={22} />
                  <span className="forecast-row__label">
                    {CLASS_LABELS[fc.class]}
                  </span>
                  <span className="forecast-row__thresh">
                    {fc.class === 0
                      ? "0 mm"
                      : fc.class === 1
                      ? `≤${thresh.lightMax} mm`
                      : `>${thresh.lightMax} mm`}
                  </span>
                  <span className="forecast-row__prob">
                    {(fc.prob * 100).toFixed(0)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Last update */}
        <p style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", marginTop: "auto" }}>
          Last update: {new Date(lastUpdate).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
