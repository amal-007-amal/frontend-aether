import { useState, useCallback } from "react";
import { getCalls } from "../api/call";
import type { CallLogDetails, FilterState } from "../types/call";
import { toast } from "sonner";
import { getUsers } from "../api/login";

export function useCallLogs() {
  const [calllogs, setCalllogs] = useState<CallLogDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    otherName: [],
    otherNumber: [],
    agentNumber: [],
    direction: [],
    callstatus: [],
    typecall: [],
    callTypes: []
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
        filters.userIDs.forEach(userID => { params.append("filter_user_ids", userID); });
      }

      const users = await getUsers();
      const userMap = Object.fromEntries(users.map(u => [String(u.id), u.name]));
      const data = await getCalls(params);
      const enrichedCalls = data.map(call => {
        let call_type = "Unknown";
        const direction = call.direction?.toLowerCase();
        const status = call.status?.toLowerCase();

        if (direction === "incoming") {
          call_type = status === "connected" ? "Incoming" : "Missed";
        } else if (direction === "outgoing") {
          call_type = status === "connected" ? "Outgoing" : "Not Connected";
        }

        return {
          ...call,
          user_id: userMap[String(call.user_id)] || "Unknown",
          call_type,
        };
      });

      setCalllogs(enrichedCalls);



      // Generate unique filter sets
      const otNameSet = new Set<string>();
      const otNumberSet = new Set<string>();
      const agNumberSet = new Set<string>();
      const directionSet = new Set<string>();
      const callstatusSet = new Set<string>();
      const typecallSet = new Set<string>();
      const callTypesSet = new Set<string>();

      enrichedCalls.forEach((item) => {
        if (item.other_name) otNameSet.add(item.other_name.trim() || "-");
        if (item.other_number) otNumberSet.add(item.other_number);
        if (item.agent_number) agNumberSet.add(item.agent_number?.trim() || "-");
        if (item.direction) directionSet.add(item.direction);
        if (item.status) callstatusSet.add(item.status);
        if (item.type) typecallSet.add(item.type)
        if (item.call_type) callTypesSet.add(item.call_type)
      });

      setSelectedFilters({
        otherName: [...otNameSet].sort((a, b) => a.localeCompare(b)),
        otherNumber: [...otNumberSet].sort((a, b) => a.localeCompare(b)),
        agentNumber: [...agNumberSet].sort((a, b) => a.localeCompare(b)),
        direction: [...directionSet].sort((a, b) => a.localeCompare(b)),
        callstatus: [...callstatusSet].sort((a, b) => a.localeCompare(b)),
        typecall: [...typecallSet].sort((a, b) => a.localeCompare(b)),
        callTypes: [...callTypesSet].sort((a, b) => a.localeCompare(b))
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
