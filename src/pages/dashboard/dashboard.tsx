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
import { startOfToday, startOfWeek } from "date-fns";
import AetherHorizontalStackedGroupChart from "../../components/aetherstackedbarchart";
import { useFormattedDuration } from "../../hooks/useDurationFormat";
import AetherLoader from "../../shared/AetherLoader";

export const AetherDashboard = () => {
    const [selfilter, setSelFilter] = useState<"today" | "week" | "custom">("today");
    const [range, setRange] = useState<DateRange | undefined>();
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [filterStatus,setFilterStatus] = useState(false)
    const [timesave, setTimeSave] = useState<{
        filterMinStart: string | null;
        filterMaxStart: string | null;
        userIDs?: string[];
    }>({
        filterMinStart: startOfToday().toISOString(),
        filterMaxStart: null,
        userIDs: [],
    });

    const { users, isLoading, fetchUsers } = useUsers();
    const { lead, activity, activeHours, fetchLeaderBoard,loading } = useLeaderBoard();

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

        const defaultFilters = {
            time_filter: "custom",
            start_date: startOfToday().toISOString(),
            end_date: new Date().toISOString(),
            user_ids: [],
        };

        const finalFilters = (!filters || !filters.start_date || !filters.end_date)
            ? defaultFilters
            : filters;

        setSelFilter(filters?.tempfillvalue ?? "today");

        setRange(undefined);
        setSelectedUserIDs(finalFilters.user_ids ?? []);
        setTimeSave({
            filterMinStart: finalFilters.start_date,
            filterMaxStart: finalFilters.end_date,
            userIDs: finalFilters.user_ids ?? [],
        });

        fetchLeaderBoard(finalFilters);
    }, []);

    // Update timesave when date range changes for custom filter
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

    const handleDateFilterChange = (value: "today" | "week" | "custom") => {
        setSelFilter(value);

        if (value === "today") {
            setTimeSave(prev => ({
                ...prev,
                filterMinStart: startOfToday().toISOString(),
                filterMaxStart: null,
            }));
        } else if (value === "week") {
            const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString();
            setTimeSave(prev => ({
                ...prev,
                filterMinStart: weekStart,
                filterMaxStart: null,
            }));
        }
    };

    const handleFilterApply = () => {
        const filters = {
            time_filter: "custom",
            start_date: timesave.filterMinStart ?? undefined,
            end_date: timesave.filterMaxStart ?? new Date().toISOString(),
            user_ids: selectedUserIDs,
            tempfillvalue: selfilter,
            filterStatus:true
        };
        setFilterStatus(true)

        localStorage.setItem("aether_leaderboard_filters", JSON.stringify(filters));
        fetchLeaderBoard(filters);
        setIsDropdownOpen(false);
    };

    const handleRefresh = () => {
        const saved = localStorage.getItem("aether_leaderboard_filters");
        let filters;

        try {
            filters = saved ? JSON.parse(saved) : null;
        } catch (e) {
            console.error("Invalid filters in localStorage:", e);
            filters = null;
        }

        const fallback = {
            time_filter: "custom",
            start_date: startOfToday().toISOString(),
            end_date: new Date().toISOString(),
            user_ids: [],
        };

        const finalFilters = (!filters || !filters.start_date || !filters.end_date)
            ? fallback
            : filters;

        setSelFilter(filters?.tempfillvalue ?? "today");
        setRange(undefined);
        setSelectedUserIDs(finalFilters.user_ids ?? []);
        setTimeSave({
            filterMinStart: finalFilters.start_date,
            filterMaxStart: finalFilters.end_date,
            userIDs: finalFilters.user_ids ?? [],
        });
        setFilterStatus(filters.filterStatus)
        fetchLeaderBoard(finalFilters);
    };

    const handleReset = () => {
        const defaultFilters = {
            time_filter: "today",
            start_date: startOfToday().toISOString(),
            end_date: new Date().toISOString(),
            user_ids: [],
            filterStatus:false
        };

        localStorage.removeItem("aether_leaderboard_filters");

        setFilterStatus(false)
        setSelFilter("today");
        setRange(undefined);
        setSelectedUserIDs([]);
        setTimeSave({
            filterMinStart: defaultFilters.start_date,
            filterMaxStart: null,
            userIDs: [],
        });

        fetchLeaderBoard(defaultFilters);
        setIsDropdownOpen(false);
    };

    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-normal flex items-center gap-2"><ChartLine className="h-5 text-fuchsia-500" /> Dashboard</h2>
                    <div className="flex items-center gap-5">
                        <RefreshCcw onClick={handleRefresh} className={`h-4 w-4 cursor-pointer ${loading?'animate-spin':''}`} />
                        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
                            <DropdownMenuTrigger>
                                <FunnelPlus className={`h-4 w-4 cursor-pointer ${filterStatus?'text-fuchsia-600':''}`} />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <div onClick={(e) => e.stopPropagation()} >
                                    <Select value={selfilter} onValueChange={handleDateFilterChange}>
                                        <SelectTrigger className="w-full text-xs shadow-none">
                                            <SelectValue placeholder="Select a filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="week">This Week</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    {selfilter === "custom" && (
                                        <div className="w-full mt-2"><AetherDateRangePicker date={range} onChange={setRange} /></div>
                                    )}
                                </div>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <AetherMultiSelect
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
                <div className="col-span-12 lg:col-span-5 border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left flex gap-2 underline"><Activity className="text-fuchsia-500 h-5" /> Call Activity</h2>
                    {activity && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-5">
                            <CircleProgress value={activity.total_calls} max={activity.total_calls} label="Total Calls" />
                            <CircleProgress value={activity.incoming_calls} max={activity.total_calls} label="Incoming Calls" />
                            <CircleProgress value={activity.outgoing_calls} max={activity.total_calls} label="Outgoing Calls" />
                            <CircleProgress value={activity.missed_calls} max={activity.total_calls} label="Missed Calls" />
                            <CircleProgress value={activity.not_connected_calls} max={activity.total_calls} label="Not Connected" />
                            <CircleProgress value={activity.abandoned_numbers} max={activity.abandoned_numbers} label="Abandoned Numbers" />
                        </div>
                    )}

                </div>
                <div className="col-span-12 lg:col-span-7 border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left flex gap-2 underline"><Dice5 className="text-fuchsia-500 h-5" /> Leaderboard</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        <div className="rounded-xl p-4 flex flex-col items-start">
                            <h6 className="text-xs text-gray-500">All calls</h6>
                            <ScrollArea className="max-h-56 pr-4">
                                {[...(lead || [])]
                                    .sort((a, b) => b.all_calls - a.all_calls)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex items-center justify-between gap-5 py-2 border p-3 my-2 rounded-full border-fuchsia-200"
                                        >
                                            <div className="w-8 h-8 bg-fuchsia-50 border border-fuchsia-100 rounded-full font-semibold flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-[0.7rem]  flex-1 text-justify">{item.user_name}</h6>
                                            <h6 className="text-[0.8rem] font-noraml text-gray-600">{item.all_calls}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col items-start">
                            <h6 className="text-xs text-gray-500">Connected calls</h6>
                            <ScrollArea className="max-h-56 pr-4">
                                {[...(lead || [])]
                                    .sort((a, b) => b.connected_calls - a.connected_calls)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex justify-between items-center gap-5 py-2  border p-3 my-2 rounded-full border-fuchsia-200"
                                        >
                                            <div className="w-8 h-8 bg-fuchsia-50 border border-fuchsia-100 rounded-full font-semibold flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-[0.7rem] text-justify flex-1">{item.user_name}</h6>
                                            <h6 className="text-[0.8rem] font-noraml text-gray-600">{item.connected_calls}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col items-start">
                            <h6 className="text-xs text-gray-500">Call duration</h6>
                            <ScrollArea className="max-h-56 pr-4">
                                {[...(lead || [])]
                                    .sort((a, b) => b.total_call_duration - a.total_call_duration)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex justify-between items-center gap-5 py-2 p-3 my-2 rounded-full border border-fuchsia-200"
                                        >
                                            <div className="w-8 h-8 bg-fuchsia-50 border border-fuchsia-100 rounded-full font-semibold flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-[0.7rem] text-justify flex-1">{item.user_name}</h6>
                                            <h6 className="text-[0.8rem] font-noraml text-gray-600">{useFormattedDuration(item.total_call_duration)}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>
            {activeHours ? (
                <div className="col-span-12 lg:col-span-5 border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left flex gap-3 underline"><TrendingUp className="text-fuchsia-500"/> Active hours</h2>
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
                <AetherLoader/>
            )}
        </div>
    )
}