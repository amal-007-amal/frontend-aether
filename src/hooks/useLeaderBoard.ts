import { useState, useCallback, useEffect } from "react";
import { getDashboard } from "../api/dashboard";
import type { Callactivity, LeaderBoard } from "../types/dashboard";

interface FilterParams {
    time_filter?: string;
    start_date?: string;
    end_date?: string;
    user_ids?: string[];
    [key: string]: any;
}

export function useLeaderBoard(initialFilters: FilterParams) {
const [activity, setActivity] = useState<Callactivity | null>(null);
    const [lead, setLead] = useState<LeaderBoard[]>([])
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchLeaderBoard = useCallback(async (params?: FilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDashboard(params);
            setLead(response.leaderboard)
            setActivity(response.call_activity);
        } catch (err) {
            console.error("Failed to fetch leaderboard:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (initialFilters) {
            fetchLeaderBoard(initialFilters);
        }
    }, []);

    return {
        lead,
        activity,
        loading,
        error,
        fetchLeaderBoard
    };
}
