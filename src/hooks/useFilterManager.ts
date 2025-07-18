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
  requested_columns: string[]
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
    requested_columns: [],
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

    const { start: customStart, end: customEnd } = getDateRangeForType(filterType as AetherFilterApiVal, rangepick);

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

        const createdNow = new Date().toISOString();

        parsed.created_till = createdNow;
        parsed.filter_max_start_datetime = createdNow;

        const relativeFilters: AetherFilterApiVal[] = [
          "today",
          "past_24_hours",
          "yesterday",
          "this_week",
          "past_7_days",
          "this_month",
          "last_30_days",
        ];

        if (relativeFilters.includes(parsed.filterType)) {
          handleFilterChange(parsed.filterType);
          setTimeout(() => {
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
          }, 0);
        } else {
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
        }
      } catch (err) {
        console.error("Invalid aether_common_filter in localStorage", err);
      }
    }
  };
  const handleFilterChange = (value: AetherFilterApiVal) => {
    const { start, end } = getDateRangeForType(value, rangepick);
    setDraftFilterParams((prev) => ({
      ...prev,
      filter_min_start_datetime: start ?? "",
      filter_max_start_datetime: end,
      filterType: value,
    }));
  };

  const getDateRangeForType = (type: AetherFilterApiVal, rangepick?: DateRange) => {
    const now = new Date();
    let start: string = "";
    let end: string = now.toISOString();

    switch (type) {
      case "today":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        break;
      case "past_24_hours":
        start = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        break;
      case "yesterday": {
        const startY = new Date(now);
        startY.setDate(now.getDate() - 1);
        startY.setHours(0, 0, 0, 0);
        const endY = new Date(startY);
        endY.setHours(23, 59, 59, 999);
        return { start: startY.toISOString(), end: endY.toISOString() };
      }
      case "this_week": {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        start = startOfWeek.toISOString();
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
        start = rangepick?.from?.toISOString() || "";
        end = rangepick?.to?.toISOString() || "";
        break;
    }

    return { start, end };
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
      const saved = localStorage.getItem("aether_common_filter");

      if (saved) {
        try {
          const parsed = JSON.parse(saved);

          const createdNow = new Date().toISOString();
          parsed.created_till = createdNow;

          const { start, end } = getDateRangeForType(parsed.filterType, rangepick);
          parsed.filter_min_start_datetime = start;
          parsed.filter_max_start_datetime = end;

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

          setHasInitialApplied(true);
        } catch (err) {
          console.error("Invalid aether_common_filter in localStorage", err);
        }
      }
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
