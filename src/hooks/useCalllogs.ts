import { useState, useCallback } from "react";
import { getCalls } from "../api/call";
import type { CallLogDetails, FilterState } from "../types/call";
import { toast } from "sonner";

export function useCallLogs() {
  const [calllogs, setCalllogs] = useState<CallLogDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    otherName: [],
    otherNumber: [],
    agentNumber: [],
    direction: [],
    callstatus: [],
  });

  const [timeFilters, setTimeFilters] = useState<{
    filterMinStart: string | null;
    filterMaxStart: string | null;
    userIDs: string[];
  }>({
    filterMinStart: null,
    filterMaxStart: null,
    userIDs: []
  });

  const fetchCallLogsWith = useCallback(async (filters: {
    filterMinStart: string | null;
    filterMaxStart: string | null;
    userIDs: string[];
  }) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();

      if (filters.filterMinStart) {
        params.append("filter_min_start_time", filters.filterMinStart);
      }
      if (filters.filterMaxStart) {
        params.append("filter_max_start_time", filters.filterMaxStart);
      }
      if (filters.userIDs.length > 0) {
        params.append("filter_user_ids", filters.userIDs.join(","));
      }

      const data = await getCalls(params);
      setCalllogs(data);

      // Generate unique filter sets
      const otNameSet = new Set<string>();
      const otNumberSet = new Set<string>();
      const agNumberSet = new Set<string>();
      const directionSet = new Set<string>();
      const callstatusSet = new Set<string>();

      data.forEach((item) => {
        if (item.other_name) otNameSet.add(item.other_name);
        if (item.other_number) otNumberSet.add(item.other_number);
        if (item.agent_number) agNumberSet.add(item.agent_number);
        if (item.direction) directionSet.add(item.direction);
        if (item.status) callstatusSet.add(item.status);
      });

      setSelectedFilters({
        otherName: [...otNameSet],
        otherNumber: [...otNumberSet],
        agentNumber: [...agNumberSet],
        direction: [...directionSet],
        callstatus: [...callstatusSet],
      });
    } catch (error) {
      toast.error("Unable to connect with server!");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    calllogs,
    setCalllogs,
    selectedFilters,
    setSelectedFilters,
    timeFilters,
    setTimeFilters,
    fetchCallLogsWith,
    isLoading
  };
}
