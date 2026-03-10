import React from "react";

/**
 * Animated weather icons for the 3 precipitation classes:
 *   0 = Sun (clear)
 *   1 = Rainy cloud (light rain)
 *   2 = Lightning rainy cloud (heavy rain)
 */
export default function WeatherIcon({ weatherClass = 0, size = 24 }) {
  if (weatherClass === 0) return <SunIcon size={size} />;
  if (weatherClass === 1) return <RainCloudIcon size={size} />;
  return <StormCloudIcon size={size} />;
}

function SunIcon({ size }) {
  return (
    <svg
      className="weather-icon weather-icon--sun"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      {/* Rays */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
        <line
          key={angle}
          className="sun-icon-ray"
          x1="16"
          y1="4"
          x2="16"
          y2="7"
          stroke="#fbbf24"
          strokeWidth="2"
          strokeLinecap="round"
          transform={`rotate(${angle} 16 16)`}
        />
      ))}
      {/* Core */}
      <circle className="sun-icon-core" cx="16" cy="16" r="6" fill="#fbbf24" />
    </svg>
  );
}

function RainCloudIcon({ size }) {
  return (
    <svg
      className="weather-icon weather-icon--rain"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      {/* Cloud */}
      <path
        d="M8 18a5 5 0 0 1 .5-9.9A7 7 0 0 1 22 10h1a4 4 0 0 1 0 8H8z"
        fill="#64748b"
        className="cloud-icon-body"
      />
      {/* Rain drops */}
      <line className="rain-icon-drop rain-icon-drop--1" x1="11" y1="21" x2="10" y2="26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <line className="rain-icon-drop rain-icon-drop--2" x1="16" y1="21" x2="15" y2="26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
      <line className="rain-icon-drop rain-icon-drop--3" x1="21" y1="21" x2="20" y2="26" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function StormCloudIcon({ size }) {
  return (
    <svg
      className="weather-icon weather-icon--storm"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
    >
      {/* Dark cloud */}
      <path
        d="M8 18a5 5 0 0 1 .5-9.9A7 7 0 0 1 22 10h1a4 4 0 0 1 0 8H8z"
        fill="#475569"
        className="cloud-icon-body"
      />
      {/* Lightning bolt */}
      <polygon
        className="storm-icon-bolt"
        points="17,14 14,20 16,20 14,27 20,18 17,18 19,14"
        fill="#fbbf24"
      />
      {/* Rain drops */}
      <line className="rain-icon-drop rain-icon-drop--1" x1="9" y1="21" x2="8" y2="25" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
      <line className="rain-icon-drop rain-icon-drop--2" x1="23" y1="21" x2="22" y2="25" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
