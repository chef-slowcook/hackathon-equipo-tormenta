import React, { useState } from "react";
import Header from "./components/Header";
import StationMap from "./components/StationMap";
import StationPanel from "./components/StationPanel";
import StationOverview from "./components/StationOverview";
import MapWeatherOverlay from "./components/MapWeatherOverlay";
import { useStationData } from "./hooks/useStationData";

export default function App() {
  const { stations, loading } = useStationData();
  const [selectedId, setSelectedId] = useState(null);

  const selectedStation = selectedId && stations ? stations[selectedId] : null;

  if (loading) {
    return (
      <div className="app">
        <Header stations={null} />
        <div className="loading-screen">
          <div className="spinner" />
          Loading station data…
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <Header stations={stations} />
      <div className="app__body">
        <StationMap
          stations={stations}
          onSelectStation={setSelectedId}
          selectedId={selectedId}
        />
        <MapWeatherOverlay stations={stations} />
        {selectedStation ? (
          <StationPanel
            station={selectedStation}
            onClose={() => setSelectedId(null)}
          />
        ) : (
          <StationOverview
            stations={stations}
            onSelectStation={setSelectedId}
          />
        )}
      </div>
    </div>
  );
}
