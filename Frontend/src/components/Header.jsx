import React from "react";

export default function Header({ stations }) {
  const stationList = stations ? Object.values(stations) : [];
  const allHealthy = stationList.every((s) => s.health === "healthy");
  const degradedCount = stationList.filter((s) => s.health === "degraded").length;

  return (
    <header className="header">
      <span className="header__logo">RainCaster</span>
      <span className="header__subtitle">Galápagos Early Warning System</span>
      <div className="header__spacer" />
      {stationList.length > 0 && (
        <div className="header__status">
          <span
            className={`header__dot ${allHealthy ? "" : "header__dot--degraded"}`}
          />
          {allHealthy
            ? "All stations online"
            : `${degradedCount}/${stationList.length} stations degraded`}
        </div>
      )}
    </header>
  );
}
