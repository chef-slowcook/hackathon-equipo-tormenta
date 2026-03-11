import { useState, useEffect, useCallback } from "react";
import { fetchStationData } from "../api/mockData";

const POLL_INTERVAL_MS = 3_000; // refresh every 3 s

export function useStationData() {
    const [stations, setStations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = useCallback(async () => {
        try {
            const data = await fetchStationData();
            setStations(data);
            setError(null);

            const ts = new Date().toLocaleTimeString();
            console.group(`%c[RainCaster] Station update @ ${ts}`, "color:#38bdf8;font-weight:bold");
            Object.values(data).forEach((s) => {
                const weather = s.current?.weather ?? "?";
                const precip  = s.current?.precipitation ?? 0;
                const temp    = s.current?.temperature ?? 0;
                const health  = s.health;
                const fc1h    = s.forecast?.["1h"]?.class ?? "-";
                const fc3h    = s.forecast?.["3h"]?.class ?? "-";
                const fc6h    = s.forecast?.["6h"]?.class ?? "-";
                const color   = health === "healthy" ? "#22c55e" : health === "offline" ? "#ef4444" : "#eab308";
                console.log(
                    `%c${s.name} (${s.id})%c  ${health}  |  ${weather}  ${precip}mm  ${temp}°C  |  forecast +1h:${fc1h} +3h:${fc3h} +6h:${fc6h}`,
                    `color:${color};font-weight:bold`,
                    "color:inherit"
                );
            });
            console.groupEnd();
        } catch (err) {
            console.error("[RainCaster] Fetch error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
        const id = setInterval(refresh, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, [refresh]);

    return { stations, loading, error, refresh };
}
