import { useState, useCallback } from "react";
import { getCalls } from "../api/call";
import type { CallLogDetails, FilterState } from "../types/call";

export function useCallLogs() {
  const [calllogs, setCalllogs] = useState<CallLogDetails[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    otherName: [],
    otherNumber: [],
    agentNumber: [],
    direction: [],
    callstatus: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchCallLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCalls();
      setCalllogs(data);
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
    console.log("Failed to fetch call logs");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    calllogs,
    setCalllogs,
    selectedFilters,
    setSelectedFilters,
    fetchCallLogs,
    isLoading,
  };
}
