import React, { useMemo } from "react";

const RAIN_DROP_COUNT = { light_rain: 25, heavy_rain: 55 };
const RAY_COUNT = 8;

const LABELS = {
  clear: "Clear",
  light_rain: "Light Rain",
  heavy_rain: "Heavy Rain",
};

function RainDrops({ count }) {
  const drops = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        height: `${12 + Math.random() * 18}px`,
        duration: `${0.4 + Math.random() * 0.5}s`,
        delay: `${Math.random() * 1}s`,
      })),
    [count]
  );

  return drops.map((d, i) => (
    <div
      key={i}
      className="rain-drop"
      style={{
        left: d.left,
        height: d.height,
        animationDuration: d.duration,
        animationDelay: d.delay,
      }}
    />
  ));
}

function SunRays() {
  return (
    <>
      <div className="sun" />
      {Array.from({ length: RAY_COUNT }, (_, i) => {
        const angle = (360 / RAY_COUNT) * i;
        return (
          <div
            key={i}
            className="sun-ray"
            style={{
              transform: `translateX(-50%) rotate(${angle}deg) translateY(-38px)`,
              animationDelay: `${(i * 0.2).toFixed(1)}s`,
            }}
          />
        );
      })}
    </>
  );
}

function Clouds() {
  return (
    <>
      <div className="cloud cloud--1" />
      <div className="cloud cloud--2" />
    </>
  );
}

export default function WeatherAnimation({ weather = "clear" }) {
  const isRain = weather === "light_rain" || weather === "heavy_rain";

  return (
    <div className={`weather-animation weather-animation--${weather}`}>
      {isRain ? (
        <>
          <Clouds />
          <RainDrops count={RAIN_DROP_COUNT[weather]} />
        </>
      ) : (
        <SunRays />
      )}
      <div className="ground" />
      <span className="weather-animation__label">{LABELS[weather]}</span>
    </div>
  );
}
