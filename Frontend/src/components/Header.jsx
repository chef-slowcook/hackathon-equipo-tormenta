import React from "react";
import WeatherIcon from "./WeatherIcon";
import { CLASS_LABELS, WEATHER_TO_CLASS } from "../constants";

export default function Header({ stations }) {
    const stationList = stations ? Object.values(stations) : [];
    const offlineCount = stationList.filter((s) => s.health === "offline").length;
    const degradedCount = stationList.filter((s) => s.health === "degraded").length;
    const allHealthy = offlineCount === 0 && degradedCount === 0;

    const dotClass = offlineCount > 0
        ? "header__dot--offline"
        : degradedCount > 0
        ? "header__dot--degraded"
        : "";

    const statusText = allHealthy
        ? "All stations online"
        : offlineCount > 0
        ? `${offlineCount} station${offlineCount > 1 ? "s" : ""} offline`
        : `${degradedCount}/${stationList.length} stations degraded`;

    const onlineStations = stationList.filter((s) => s.health !== "offline");

    const nowClass = onlineStations.length > 0
        ? Math.max(...onlineStations.map((s) => WEATHER_TO_CLASS[s.current?.weather] ?? 0))
        : 0;

    const forecast1hClass = stationList.length > 0
        ? Math.max(...stationList.map((s) => s.forecast?.["1h"]?.class ?? 0))
        : 0;

    return (
        <header className="header">
            <span className="header__logo">RainCaster</span>
            <span className="header__subtitle">Galápagos Early Warning System</span>
            <div className="header__spacer" />
            {stationList.length > 0 && (
                <>
                    <div className={`header__weather-pill header__weather-pill--${nowClass}`}>
                        <WeatherIcon weatherClass={nowClass} size={16} />
                        <span className="header__weather-label">Now</span>
                        <span className="header__weather-class">{CLASS_LABELS[nowClass]}</span>
                    </div>
                    <div className={`header__weather-pill header__weather-pill--${forecast1hClass}`}>
                        <WeatherIcon weatherClass={forecast1hClass} size={16} />
                        <span className="header__weather-label">+1h</span>
                        <span className="header__weather-class">{CLASS_LABELS[forecast1hClass]}</span>
                    </div>
                    <div className="header__status">
                        <span className={`header__dot ${dotClass}`} />
                        {statusText}
                    </div>
                </>
            )}
        </header>
    );
}
