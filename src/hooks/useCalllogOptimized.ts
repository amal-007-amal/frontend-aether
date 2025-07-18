import { useState, useCallback } from "react";
import { getCallsOptimized, getCallsOptimizedFile } from "../api/call";
import { getUsers } from "../api/login";
import { toast } from "sonner";
import type { CallLogDetails } from "../types/call";

export function useCallLogOptimized() {
  const [calllogs, setCalllogs] = useState<CallLogDetails[]>([]);
  const [abandoned, setAbandoned] = useState<[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const exportCallLogsFile = async (params: any, type: "csv" | "pdf",collist:string[]) => {
    try {
      console.log(collist)
      const queryString = buildQueryParams({
        ...params,
        limit: -1,
        offset: 0,
        requested_columns:collist,
        response_format: type,
      });
      const blob = await getCallsOptimizedFile(queryString);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `call-logs-export.${type}`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download export file");
      console.error(err);
    }
  };
  const buildQueryParams = (params: Record<string, any>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== undefined && v !== null && v !== "") {
            searchParams.append(key, v.toString());
          }
        });
      } else if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString());
      }
    });
    return searchParams.toString();
  };

  const fetchCallLogs = useCallback(async (params: any) => {
    setIsLoading(true);
    try {
      const queryString = buildQueryParams(params);
      const users = await getUsers();
      const userMap = Object.fromEntries(users.map(u => [String(u.id), u.name]));

      const data = await getCallsOptimized(queryString);

      setAbandoned(data.abandoned_other_numbers || []);
      setOffset(data.offset || 0);
      setTotal(data.total || 0);

      const enrichedCalls = data.calls.map((call: CallLogDetails) => ({
        ...call,
        user_id: userMap[String(call.user_id)] || "Unknown"
      }));

      setCalllogs(enrichedCalls);

    } catch (error) {
      toast.error("Unable to connect with server!");
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    calllogs,
    abandoned,
    total,
    offset,
    isLoading,
    fetchCallLogs,
    setCalllogs,
    exportCallLogsFile
  };
}
