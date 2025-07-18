import { Activity, ChartLine, Dice5, FunnelPlus, RefreshCcw, TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { AetherDateRangePicker } from "../../components/aetherdaterangepicker";
import { useEffect, useState } from "react";
import type { DateRange } from "react-day-picker";
import { ScrollArea } from "../../components/ui/scroll-area";
import { useLeaderBoard } from "../../hooks/useLeaderBoard";
import { AetherMultiSelect } from "../../components/aethermultiselect";
import { useUsers } from "../../hooks/useUsers";
import { Button } from "../../components/ui/button";
import { CircleProgress } from "../../components/aethercircleorogress";
import { startOfToday } from "date-fns";
import AetherHorizontalStackedGroupChart from "../../components/aetherstackedbarchart";
import { useFormattedDuration } from "../../hooks/useDurationFormat";
import AetherLoader from "../../shared/AetherLoader";
import type { AetherFilterApiVal } from "../../types/common";

type LeaderboardFilter = {
    time_filter: AetherFilterApiVal;
    start_date: string;
    end_date: string;
    user_ids: string[];
    tempfillvalue?: AetherFilterApiVal;
    filterStatus?: boolean;
};

export const AetherDashboard = () => {
    const [selfilter, setSelFilter] = useState<AetherFilterApiVal>("today");
    const [range, setRange] = useState<DateRange | undefined>();
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filterStatus, setFilterStatus] = useState(false)
    const [timesave, setTimeSave] = useState<{
        filterMinStart: string | null;
        filterMaxStart: string | null;
        userIDs?: string[];
    }>({
        filterMinStart: startOfToday().toISOString(),
        filterMaxStart: null,
        userIDs: [],
    });
    console.log(timesave)
    const { users, isLoading, fetchUsers } = useUsers();
    const { lead, activity, activeHours, fetchLeaderBoard, loading } = useLeaderBoard();

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        const saved = localStorage.getItem("aether_leaderboard_filters");
        let filters;

        try {
            filters = saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Invalid filters in localStorage:", e);
            filters = null;
        }

        const tempType = filters?.tempfillvalue as AetherFilterApiVal ?? "today";

        const { start, end } = getDateRangeForType(tempType);

        const finalFilters = {
            time_filter: "custom",
            start_date: start,
            end_date: end,
            user_ids: filters?.user_ids ?? [],
            tempfillvalue: tempType,
            filterStatus: filters?.filterStatus ?? false,
        };

        localStorage.setItem("aether_leaderboard_filters", JSON.stringify(finalFilters));

        setSelFilter(tempType);
        setRange(undefined);
        setSelectedUserIDs(finalFilters.user_ids);
        setTimeSave({
            filterMinStart: start,
            filterMaxStart: end,
            userIDs: finalFilters.user_ids,
        });

        fetchLeaderBoard(finalFilters);
    }, []);

    useEffect(() => {
        if (selfilter === "custom" && range?.from && range?.to) {
            const start = new Date(range.from);
            start.setHours(0, 0, 0, 0);

            const end = new Date(range.to);
            end.setHours(23, 59, 59, 999);

            setTimeSave(prev => ({
                ...prev,
                filterMinStart: start.toISOString(),
                filterMaxStart: end.toISOString(),
            }));
        }
    }, [range, selfilter]);


    const handleDateFilterChange = (value: AetherFilterApiVal) => {
        setSelFilter(value);
        const { start, end } = getDateRangeForType(value, range);
        setTimeSave((prev) => ({
            ...prev,
            filterMinStart: start,
            filterMaxStart: end,
        }));
    };

    const handleFilterApply = () => {
        const { start, end } = getDateRangeForType(selfilter, range);

        const filters: LeaderboardFilter = {
            time_filter: 'custom',
            start_date: start,
            end_date: end || new Date().toISOString(),
            user_ids: selectedUserIDs,
            tempfillvalue: selfilter,
            filterStatus: true,
        };

        setFilterStatus(true);
        localStorage.setItem("aether_leaderboard_filters", JSON.stringify(filters));
        fetchLeaderBoard(filters);
        setIsDropdownOpen(false);
    };
    const handleRefresh = () => {
        const saved = localStorage.getItem("aether_leaderboard_filters");
        let filters: LeaderboardFilter | null = null;

        try {
            filters = saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Invalid filters in localStorage:", e);
        }
        const tempType = filters?.tempfillvalue as AetherFilterApiVal ?? "today";
        const { start, end } = getDateRangeForType(tempType, range);

        const finalFilters: LeaderboardFilter = {
            time_filter: "custom",
            start_date: start,
            end_date: end,
            user_ids: filters?.user_ids ?? [],
            tempfillvalue: tempType,
            filterStatus: filters?.filterStatus ?? false,
        };

        // Optional: Save refreshed filters back to localStorage
        localStorage.setItem("aether_leaderboard_filters", JSON.stringify(finalFilters));

        setSelFilter(tempType);
        setSelectedUserIDs(finalFilters.user_ids);
        setTimeSave({
            filterMinStart: start,
            filterMaxStart: end,
            userIDs: finalFilters.user_ids,
        });
        setFilterStatus(!!finalFilters.filterStatus);
        setRange(undefined);

        fetchLeaderBoard(finalFilters);
    };

    const handleReset = () => {
        const defaultFilters: LeaderboardFilter = {
            time_filter: "today",
            start_date: startOfToday().toISOString(),
            end_date: new Date().toISOString(),
            user_ids: [],
            filterStatus: false,
        };

        localStorage.setItem("aether_leaderboard_filters", JSON.stringify(defaultFilters));

        setFilterStatus(false);
        setSelFilter("today");
        setSelectedUserIDs([]);
        setRange(undefined);
        setTimeSave({
            filterMinStart: defaultFilters.start_date,
            filterMaxStart: defaultFilters.end_date,
            userIDs: [],
        });

        fetchLeaderBoard(defaultFilters);
        setIsDropdownOpen(false);
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
                return {
                    start: startY.toISOString(),
                    end: endY.toISOString(),
                };
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
                start = rangepick?.from instanceof Date ? rangepick.from.toISOString() : "";
                end = rangepick?.to instanceof Date ? rangepick.to.toISOString() : new Date().toISOString();
                break;
        }

        return { start, end };
    };

    return (
        <div>
            <div className="p-2 bg-white  h-14 rounded-xl border dark:border-stone-700 dark:bg-stone-900 ">
                <div className="flex justify-between items-center py-2 px-1">
                    <h2 className="text-sm font-medium flex items-center gap-2"><ChartLine className="h-4 text-fuchsia-500" /> Dashboard</h2>
                    <div className="flex items-center gap-5">
                        <RefreshCcw onClick={handleRefresh} className={`h-4 w-4 cursor-pointer ${loading ? 'animate-spin' : ''}`} />
                        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                            <DropdownMenuTrigger>
                                <FunnelPlus className={`h-4 w-4 cursor-pointer ${filterStatus ? 'text-fuchsia-600' : ''}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <div onClick={(e) => e.stopPropagation()} >
                                    <Select value={selfilter} onValueChange={handleDateFilterChange}>
                                        <SelectTrigger className="w-full text-xs shadow-none">
                                            <SelectValue placeholder="Select a filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem className="text-xs" value="today">Today</SelectItem>
                                            <SelectItem className="text-xs" value="past_24_hours">Past 24 hrs</SelectItem>
                                            <SelectItem className="text-xs" value="yesterday">Yesterday</SelectItem>
                                            <SelectItem className="text-xs" value="this_week">This Week</SelectItem>
                                            <SelectItem className="text-xs" value="past_7_days">Past 7 days</SelectItem>
                                            <SelectItem className="text-xs" value="this_month">This Month</SelectItem>
                                            <SelectItem className="text-xs" value="last_30_days">Last 30 days</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selfilter === "custom" && (
                                        <div className="w-full mt-2"><AetherDateRangePicker date={range} onChange={setRange} /></div>
                                    )}
                                </div>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <AetherMultiSelect
                                        placeholder="Filter by agents"
                                        data={users.map((user) => ({ label: user.name, value: user.id }))}
                                        selected={selectedUserIDs}
                                        onChange={setSelectedUserIDs}
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <Button onClick={handleReset} className="bg-white text-black text-xs rounded-xl hover:bg-gray-500">Reset</Button>
                                    <Button onClick={handleFilterApply} className="bg-fuchsia-500 text-white text-xs rounded-xl hover:bg-fuchsia-300">Apply</Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4 my-4">
                <div className="col-span-12 lg:col-span-5 bg-white border dark:border-stone-700 dark:bg-stone-900 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left flex gap-2"><Activity className="text-fuchsia-500 h-5" /> Call Activity</h2>
                    {activity && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-5">
                            <CircleProgress value={activity.total_calls} max={activity.total_calls} color={{
                                stroke: "#D946EF",
                                fill: "transparent",
                            }} label="Total Calls" />
                            <CircleProgress value={activity.incoming_calls} max={activity.total_calls} color={{
                                stroke: "#D946EF",
                                fill: "transparent",
                            }} label="Incoming Calls" />
                            <CircleProgress value={activity.outgoing_calls} max={activity.total_calls} color={{
                                stroke: "#D946EF",
                                fill: "transparent",
                            }} label="Outgoing Calls" />
                            <CircleProgress value={activity.missed_calls} max={activity.total_calls} color={{
                                stroke: "#D946EF",
                                fill: "transparent",
                            }} label="Missed Calls" />
                            <CircleProgress value={activity.not_connected_calls} max={activity.total_calls} color={{
                                stroke: "#D946EF",
                                fill: "transparent",
                            }} label="Not Connected" />
                            <CircleProgress value={activity.abandoned_numbers} max={activity.abandoned_numbers} color={{
                                stroke: "#F5D0FE",
                                fill: "#d396dc",
                            }} label="Abandoned Numbers" />
                        </div>
                    )}            
                </div>
                <div className="col-span-12 lg:col-span-7 bg-white border dark:border-stone-700 dark:bg-stone-900 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left flex gap-2"><Dice5 className="text-fuchsia-500 h-5" /> Leaderboard</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl p-4 flex flex-col items-start">
                            <h6 className="text-xs text-gray-500 dark:text-gray-200">All calls</h6>
                            <ScrollArea className="max-h-56 pr-4">
                                {[...(lead || [])]
                                    .sort((a, b) => b.all_calls - a.all_calls)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex items-center justify-between gap-5 py-2 border p-3 my-2 rounded-full border-fuchsia-200 dark:border-fuchsia-950 dark:bg-stone-900"
                                        >
                                            <div className="w-8 h-8 bg-fuchsia-50 border border-fuchsia-100 dark:border-stone-700 dark:bg-fuchsia-950 rounded-full font-semibold flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-[0.7rem]  flex-1 text-justify">{item.user_name}</h6>
                                            <h6 className="text-[0.8rem] font-noraml text-gray-600 dark:text-white">{item.all_calls}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col items-start">
                            <h6 className="text-xs text-gray-500 dark:text-gray-200">Connected calls</h6>
                            <ScrollArea className="max-h-56 pr-4">
                                {[...(lead || [])]
                                    .sort((a, b) => b.connected_calls - a.connected_calls)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex justify-between items-center gap-5 py-2  border p-3 my-2 rounded-full border-fuchsia-200 dark:border-fuchsia-950 dark:bg-stone-90"
                                        >
                                            <div className="w-8 h-8 bg-fuchsia-50 border border-fuchsia-100 dark:border-stone-700 dark:bg-fuchsia-950 rounded-full font-semibold flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-[0.7rem] text-justify flex-1">{item.user_name}</h6>
                                            <h6 className="text-[0.8rem] font-noraml text-gray-600 dark:text-white">{item.connected_calls}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col items-start">
                            <h6 className="text-xs text-gray-500 dark:text-gray-200">Call duration</h6>
                            <ScrollArea className="max-h-56 pr-4">
                                {[...(lead || [])]
                                    .sort((a, b) => b.total_call_duration - a.total_call_duration)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex justify-between items-center gap-5 py-2 p-3 my-2 rounded-full border border-fuchsia-200 dark:border-fuchsia-950 dark:bg-stone-90"
                                        >
                                            <div className="w-8 h-8 bg-fuchsia-50 border border-fuchsia-100 dark:border-stone-700 dark:bg-fuchsia-950 rounded-full font-semibold flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-[0.7rem] text-justify flex-1">{item.user_name}</h6>
                                            <h6 className="text-[0.8rem] font-noraml text-gray-600 dark:text-white">{useFormattedDuration(item.total_call_duration)}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
            {activeHours ? (
                <div className="col-span-12 lg:col-span-5 bg-white border dark:border-stone-700 dark:bg-stone-900 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left flex gap-3"><TrendingUp className="text-fuchsia-500" /> Active hours</h2>
                    <AetherHorizontalStackedGroupChart
                        labels={activeHours.labels}
                        datasets={activeHours.datasets}
                    />
                </div>
            ) : (
                <div className="col-span-12 lg:col-span-5 p-4 text-sm text-gray-400 italic">
                    Loading Active hours...
                </div>
            )}
            {isLoading || loading && (
                <AetherLoader />
            )}
        </div>
    )
}