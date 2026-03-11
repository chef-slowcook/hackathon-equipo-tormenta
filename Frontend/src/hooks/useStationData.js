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
        } catch (err) {
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
