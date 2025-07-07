import { useState, useCallback, useEffect } from "react";
import { getDashboard } from "../api/dashboard";

interface FilterParams {
  time_filter?: string;
  start_date?: string;
  end_date?: string;
  user_ids?: string[];
  [key: string]: any;
}

export function useLeaderBoard(initialFilters: FilterParams) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const fetchLeaderBoard = useCallback(async (params?: FilterParams) => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboard(params);
      setData(response);
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
    data,
    loading,
    error,
    fetchLeaderBoard
  };
}
