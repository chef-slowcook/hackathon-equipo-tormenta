import React from "react";
import WeatherAnimation from "./WeatherAnimation";
import WeatherIcon from "./WeatherIcon";
import { PRECIP_THRESHOLDS } from "../api/mockData";
import { CLASS_LABELS, CLASS_COLORS, FORECAST_HORIZONS, WEATHER_TO_CLASS } from "../constants";

function AlertBanner({ forecast }) {
    const hasHeavy = FORECAST_HORIZONS.some((h) => forecast[h].class === 2);
    if (!hasHeavy) return null;

    const horizons = FORECAST_HORIZONS.filter((h) => forecast[h].class === 2);
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
                        {health === "healthy" ? "● Online" : health === "offline" ? "● Offline" : "● Degraded"}
                    </span>
                    <p className="panel__meta">
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
                        {/* Live "Now" row derived from current sensor reading */}
                        {(() => {
                            const nowClass = WEATHER_TO_CLASS[current.weather] ?? 0;
                            return (
                                <div className={`forecast-row forecast-row--class-${nowClass} forecast-row--now`}>
                                    <span className="forecast-row__horizon forecast-row__horizon--now">Now</span>
                                    <WeatherIcon weatherClass={nowClass} size={22} />
                                    <span className="forecast-row__label">{CLASS_LABELS[nowClass]}</span>
                                    <span className="forecast-row__thresh">{current.precipitation} mm</span>
                                    <span className="forecast-row__prob">live</span>
                                </div>
                            );
                        })()}
                        {/* ML model forecast rows */}
                        {FORECAST_HORIZONS.map((horizon) => {
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
                <p className="panel__timestamp">
                    Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </p>
            </div>
        </div>
    );
}
