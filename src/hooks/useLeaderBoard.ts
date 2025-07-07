import { useState, useCallback } from "react";
import { getDashboard } from "../api/dashboard";
import type { ActiveHour, Callactivity, LeaderBoard } from "../types/dashboard";

interface FilterParams {
    time_filter?: string;
    start_date?: string;
    end_date?: string;
    user_ids?: string[];
    [key: string]: any;
}

export function useLeaderBoard() {
    const [activity, setActivity] = useState<Callactivity | null>(null);
    const [lead, setLead] = useState<LeaderBoard[]>([]);
    const [activeHours, setActiveHours] = useState<any>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const fetchLeaderBoard = useCallback(async (params?: FilterParams) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDashboard(params);
            setLead(response.leaderboard);
            setActivity(response.call_activity);
            const raw = response.active_hours || [];

            const chartDataset = {
                labels: raw.map((h: ActiveHour) => h.hour_range),
                datasets: [
                    {
                        label: "Incoming Connected",
                        data: raw.map((h: ActiveHour) => h.incoming_connected),
                        backgroundColor: "#c2b0f7",
                        stack: "incoming",
                    },
                    {
                        label: "Incoming Not Connected",
                        data: raw.map((h: ActiveHour) => h.incoming_not_connected),
                        backgroundColor: "#a182f2",
                        stack: "incoming",
                    },
                    {
                        label: "Outgoing Connected",
                        data: raw.map((h: ActiveHour) => h.outgoing_connected),
                        backgroundColor: "#f7b0d5",
                        stack: "outgoing",
                    },
                    {
                        label: "Outgoing Not Connected",
                        data: raw.map((h: ActiveHour) => h.outgoing_not_connected),
                        backgroundColor: "#eb8fcb",
                        stack: "outgoing",
                    },
                ],
            };

            setActiveHours(chartDataset);
        } catch (err) {
            console.error("Failed to fetch leaderboard:", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        lead,
        activity,
        activeHours,
        loading,
        error,
        fetchLeaderBoard,
    };
}
