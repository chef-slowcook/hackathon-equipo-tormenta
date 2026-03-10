import React, { useMemo } from "react";
import WeatherIcon from "./WeatherIcon";

const CLASS_LABELS = ["Clear", "Light Rain", "Heavy Rain"];
const HORIZONS = ["1h", "3h", "6h"];

/**
 * Computes the dominant (worst-case) forecast class across all stations
 * for each horizon, plus the overall +1h class for full-map effects.
 */
function useAggregateForecast(stations) {
  return useMemo(() => {
    if (!stations) return { byHorizon: {}, dominant1h: 0 };

    const list = Object.values(stations);
    const byHorizon = {};

    for (const h of HORIZONS) {
      const maxClass = Math.max(...list.map((s) => s.forecast[h].class));
      const avgProb =
        list.reduce((sum, s) => sum + s.forecast[h].prob, 0) / list.length;
      byHorizon[h] = { class: maxClass, prob: +avgProb.toFixed(2) };
    }

    return { byHorizon, dominant1h: byHorizon["1h"].class };
  }, [stations]);
}

export default function MapWeatherOverlay({ stations }) {
  const { byHorizon, dominant1h } = useAggregateForecast(stations);

  if (!stations) return null;

  return (
    <>
      {/* ---- Full-screen weather effects layer ---- */}
      <div
        className={`map-fx map-fx--${dominant1h}`}
        aria-hidden="true"
      >
        {dominant1h === 0 && <SunOverlay />}
        {dominant1h === 1 && <RainOverlay heavy={false} />}
        {dominant1h === 2 && <StormOverlay />}
      </div>

      {/* ---- Forecast HUD ---- */}
      <div className="forecast-hud">
        <span className="forecast-hud__label">Island Forecast</span>
        <div className="forecast-hud__cards">
          {HORIZONS.map((h) => {
            const fc = byHorizon[h];
            if (!fc) return null;
            return (
              <div key={h} className={`forecast-hud__card forecast-hud__card--${fc.class}`}>
                <WeatherIcon weatherClass={fc.class} size={36} />
                <div className="forecast-hud__meta">
                  <span className="forecast-hud__horizon">+{h}</span>
                  <span className="forecast-hud__class">{CLASS_LABELS[fc.class]}</span>
                  <span className="forecast-hud__prob">{Math.round(fc.prob * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

/* ---- Sun glow overlay ---- */
function SunOverlay() {
  return (
    <div className="map-fx__sun">
      <div className="map-fx__sun-core" />
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <div
          key={deg}
          className="map-fx__sun-ray"
          style={{ transform: `rotate(${deg}deg)` }}
        />
      ))}
    </div>
  );
}

/* ---- Rain overlay ---- */
function RainOverlay({ heavy }) {
  const drops = useMemo(() => {
    const count = heavy ? 70 : 35;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${(Math.random() * 1.2).toFixed(2)}s`,
      duration: `${(0.5 + Math.random() * 0.5).toFixed(2)}s`,
      height: `${12 + Math.random() * 14}px`,
    }));
  }, [heavy]);

  return (
    <div className="map-fx__rain">
      {drops.map((d) => (
        <div
          key={d.id}
          className={`map-fx__drop ${heavy ? "map-fx__drop--heavy" : ""}`}
          style={{
            left: d.left,
            animationDelay: d.delay,
            animationDuration: d.duration,
            height: d.height,
          }}
        />
      ))}
    </div>
  );
}

/* ---- Storm overlay ---- */
function StormOverlay() {
  return (
    <>
      <RainOverlay heavy />
      <div className="map-fx__lightning" />
    </>
  );
}
