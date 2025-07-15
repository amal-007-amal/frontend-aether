import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";

export type AetherFilterApiVal =
  | "today"
  | "past_24_hours"
  | "yesterday"
  | "this_week"
  | "past_7_days"
  | "this_month"
  | "last_30_days"
  | "custom";

type TimeObj = {
  h: string;
  m: string;
  s: string;
};

type FilterParams = {
  created_till: string;
  filter_user_ids: string[];
  filter_other_numbers: string[];
  filter_min_start_datetime: string;
  filter_max_start_datetime: string;
  only_new: boolean;
  only_abandoned: boolean;
  filter_min_start_time: string;
  filter_max_start_time: string;
  filter_frontend_call_types: string[];
  filter_min_duration: number;
  filter_max_duration: number | null;
  only_last: boolean;
  response_format: string;
  offset: number;
  limit: number;
  filterType: string;
  min?: number | string;
  max?: number | string;
  minTime?: TimeObj;
  maxTime?: TimeObj;
};

export function useCallFilterManager({ rangepick }: { rangepick?: DateRange }) {
  const [currentOffset, setCurrentOffset] = useState(1);
  const [limit, setLimit] = useState(10);

  const baseDraft: FilterParams = {
    created_till: new Date().toISOString(),
    filter_user_ids: [],
    filter_other_numbers: [],
    filter_min_start_datetime: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
    filter_max_start_datetime: new Date(new Date().setHours(23, 59, 59, 999)).toISOString(),
    only_new: false,
    only_abandoned: false,
    filter_min_start_time: "00:00:00+05:30",
    filter_max_start_time: "23:59:59.999999+05:30",
    filter_frontend_call_types: [],
    filter_min_duration: 0,
    filter_max_duration: null,
    only_last: false,
    response_format: "default",
    offset: 0,
    limit: 10,
    filterType: "today",
    min: "",
    max: "",
    minTime: { h: "00", m: "00", s: "00" },
    maxTime: { h: "23", m: "59", s: "59" },
  };

  const getInitialFilters = (): FilterParams => {
    const saved = localStorage.getItem("aether_common_filter");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to parse saved filter:", err);
      }
    }
    return baseDraft;
  };

  const initialFilter = getInitialFilters();
  const { offset: _offset, limit: _limit, ...initialDraft } = initialFilter;

  const [draftFilterParams, setDraftFilterParams] = useState<Omit<FilterParams, "offset" | "limit">>(initialDraft);
  const [filterParams, setFilterParams] = useState<FilterParams>(initialFilter);
  const [hasInitialApplied, setHasInitialApplied] = useState(false);

  const formatTimeWithOffset = ({ h, m, s }: TimeObj) => `${h}:${m}:${s}+05:30`;

  const handleFilterApply = ({
    selectedUserIDs,
    phoneNumbers,
    selectedTypeVal,
    onlylast,
    onlyaban,
    onlynew,
    min,
    max,
    minTime,
    maxTime,
    filterType,
  }: {
    selectedUserIDs: string[];
    phoneNumbers: string[];
    selectedTypeVal: string[];
    onlylast: boolean;
    onlyaban: boolean;
    onlynew: boolean;
    min: number | string;
    max: number | string;
    minTime: TimeObj;
    maxTime: TimeObj;
    filterType: string;
  }) => {
    setCurrentOffset(1);

    const isCustom =
      draftFilterParams.filter_min_start_datetime === "" &&
      draftFilterParams.filter_max_start_datetime === "" &&
      rangepick?.from &&
      rangepick?.to;

    const customStart = isCustom ? rangepick?.from?.toISOString() : draftFilterParams.filter_min_start_datetime;
    const customEnd = isCustom ? rangepick?.to?.toISOString() : draftFilterParams.filter_max_start_datetime;

    const minDuration = min !== "" ? Number(min) * 60 : 0;
    const maxDuration = max !== "" && Number(max) <= 59 ? Number(max) * 60 : null;

    const newParams: FilterParams = {
      ...draftFilterParams,
      created_till: new Date().toISOString(),
      filter_user_ids: selectedUserIDs,
      filter_other_numbers: phoneNumbers,
      filter_frontend_call_types: selectedTypeVal,
      filter_min_duration: minDuration,
      filter_max_duration: maxDuration,
      only_last: onlylast,
      only_abandoned: onlyaban,
      only_new: onlynew,
      filter_min_start_time: formatTimeWithOffset(minTime),
      filter_max_start_time: formatTimeWithOffset(maxTime),
      filter_min_start_datetime: customStart ?? "",
      filter_max_start_datetime: customEnd ?? "",
      offset: 0,
      limit,
      response_format: "default",
      filterType,
      min,
      max,
      minTime,
      maxTime,
    };

    setFilterParams(newParams);
    setDraftFilterParams({ ...newParams });
    localStorage.setItem("aether_common_filter", JSON.stringify(newParams));
    setHasInitialApplied(true);
  };

  const handleRefresh = () => {
  setCurrentOffset(1);
  const saved = localStorage.getItem("aether_common_filter");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      handleFilterApply({
        selectedUserIDs: parsed.filter_user_ids || [],
        phoneNumbers: parsed.filter_other_numbers || [],
        selectedTypeVal: parsed.filter_frontend_call_types || [],
        min: parsed.min ?? "",
        max: parsed.max ?? "",
        minTime: parsed.minTime || { h: "00", m: "00", s: "00" },
        maxTime: parsed.maxTime || { h: "23", m: "59", s: "59" },
        onlylast: parsed.only_last || false,
        onlyaban: parsed.only_abandoned || false,
        onlynew: parsed.only_new || false,
        filterType: parsed.filterType,
      });
    } catch (err) {
      console.error("Invalid aether_common_filter in localStorage", err);
    }
  }
};

  const handleFilterChange = (value: AetherFilterApiVal) => {
    const now = new Date();
    const end = now.toISOString();
    let start: string | null = null;

    switch (value) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0)).toISOString();
        break;
      case "past_24_hours":
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case "yesterday": {
        const startOfYesterday = new Date();
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        startOfYesterday.setHours(0, 0, 0, 0);
        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
        setDraftFilterParams((prev) => ({
          ...prev,
          filter_min_start_datetime: startOfYesterday.toISOString(),
          filter_max_start_datetime: endOfYesterday.toISOString(),
          filterType: value,
        }));
        return;
      }
      case "this_week": {
        const today = new Date();
        const sunday = new Date(today.setDate(today.getDate() - today.getDay()));
        sunday.setHours(0, 0, 0, 0);
        start = sunday.toISOString();
        break;
      }
      case "past_7_days":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "this_month":
        start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        break;
      case "last_30_days":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
        break;
      case "custom":
        setDraftFilterParams((prev) => ({
          ...prev,
          filter_min_start_datetime: rangepick?.from?.toISOString() || "",
          filter_max_start_datetime: rangepick?.to?.toISOString() || "",
          filterType: value,
        }));
        return;
    }

    setDraftFilterParams((prev) => ({
      ...prev,
      filter_min_start_datetime: start ?? "",
      filter_max_start_datetime: end,
      filterType: value,
    }));
  };

  useEffect(() => {
    setFilterParams((prev) => ({
      ...prev,
      offset: (currentOffset - 1) * limit,
      limit,
    }));
  }, [currentOffset, limit]);

  useEffect(() => {
    if (!hasInitialApplied) {
      const type = initialFilter?.filterType as AetherFilterApiVal;
      if (type && type !== "custom") {
        handleFilterChange(type);
      }

      setTimeout(() => {
        const saved = localStorage.getItem("aether_common_filter");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            handleFilterApply({
              selectedUserIDs: parsed.filter_user_ids || [],
              phoneNumbers: parsed.filter_other_numbers || [],
              selectedTypeVal: parsed.filter_frontend_call_types || [],
              min: parsed.min ?? "",
              max: parsed.max ?? "",
              minTime: parsed.minTime || { h: "00", m: "00", s: "00" },
              maxTime: parsed.maxTime || { h: "23", m: "59", s: "59" },
              onlylast: parsed.only_last || false,
              onlyaban: parsed.only_abandoned || false,
              onlynew: parsed.only_new || false,
              filterType: parsed.filterType,
            });
          } catch (err) {
            console.error("Invalid aether_common_filter in localStorage", err);
          }
        }
      }, 0);

      setHasInitialApplied(true);
    }
  }, []);

  return {
    filterParams,
    draftFilterParams,
    setDraftFilterParams,
    currentOffset,
    setCurrentOffset,
    limit,
    setLimit,
    handleRefresh,
    handleFilterApply,
    handleFilterChange,
  };
}
