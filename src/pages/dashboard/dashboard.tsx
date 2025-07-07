import { FunnelPlus, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { AetherDateRangePicker } from "../../components/aetherdaterangepicker"
import { useEffect, useState } from "react"
import type { DateRange } from "react-day-picker"
import { ScrollArea } from "../../components/ui/scroll-area"
import { useLeaderBoard } from "../../hooks/useLeaderBoard"
import { AetherMultiSelect } from "../../components/aethermultiselect"
import { useUsers } from "../../hooks/useUsers"
import { Button } from "../../components/ui/button"
import { CircleProgress } from "../../components/aethercircleorogress"
import { startOfToday, startOfWeek } from "date-fns"

export const AetherDashboard = () => {
    const [selfilter, setSelFilter] = useState<string>("");
    const [range, setRange] = useState<DateRange | undefined>();
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);

    const [timesave, setTimeSave] = useState<{
        filterMinStart: string | null;
        filterMaxStart: string | null;
        userIDs?: string[];
    }>({
        filterMinStart: startOfToday().toISOString(),
        filterMaxStart: null,
        userIDs: []
    });

    const { users } = useUsers();
    const { lead, activity, fetchLeaderBoard } = useLeaderBoard();

    const handleDateFilterChange = (value: "today" | "week" | "custom") => {
        setSelFilter(value);
        if (value === "today") {
            const from = startOfToday().toISOString();
            setTimeSave((prev) => ({
                ...prev,
                filterMinStart: from,
                filterMaxStart: null
            }));
        }
        else if (value === "week") {
            const from = startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString();
            setTimeSave((prev) => ({
                ...prev,
                filterMinStart: from,
                filterMaxStart: null
            }));
        }
    };

    useEffect(() => {
        if (selfilter === "custom" && range?.from && range?.to) {
            const startOfDay = new Date(range.from);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(range.to);
            endOfDay.setHours(23, 59, 59, 999);

            setTimeSave({
                filterMinStart: startOfDay.toISOString(),
                filterMaxStart: endOfDay.toISOString()
            });
        }
    }, [range, selfilter]);

    const handleFilterApply = () => {
        const filters = {
            time_filter: selfilter,
            start_date: timesave.filterMinStart ?? undefined,
            end_date: timesave.filterMaxStart ?? undefined,
            user_ids: selectedUserIDs,
        };

        fetchLeaderBoard(filters);
    };

    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-normal flex items-center">Dashboard</h2>
                    <div className="flex items-center gap-5">
                        <RefreshCcw className={`h-4 w-4 cursor-pointer`} />
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <FunnelPlus className="h-4 w-4" />
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
                                    <Button className="bg-white text-black text-xs rounded-xl hover:bg-gray-500">Reset</Button>
                                    <Button onClick={handleFilterApply} className="bg-black text-white text-xs rounded-xl">Apply</Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4 my-4">
                <div className="col-span-12 lg:col-span-5 border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left">Call Activity</h2>
                    {activity && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 my-4">
                            <CircleProgress value={activity.total_calls} max={100} label="Total Calls" color="#3b82f6" />
                            <CircleProgress value={activity.incoming_calls} max={100} label="Incoming Calls" color="#22c55e" />
                            <CircleProgress value={activity.outgoing_calls} max={100} label="Outgoing Calls" color="#8b5cf6" />
                            <CircleProgress value={activity.missed_calls} max={100} label="Missed Calls" color="#ef4444" />
                            <CircleProgress value={activity.not_connected_calls} max={100} label="Not Connected" color="#f97316" />
                            <CircleProgress value={activity.abandoned_numbers} max={100} label="Abandoned Numbers" color="#6b7280" />
                        </div>
                    )}

                </div>
                <div className="col-span-12 lg:col-span-7 border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left">Leaderboard</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="rounded-xl p-4 flex flex-col items-start my-4">
                            <h6 className="text-sm">All calls</h6>
                            <ScrollArea className="max-h-56">
                                {[...(lead || [])]
                                    .sort((a, b) => b.all_calls - a.all_calls)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex justify-between items-center gap-5 py-2"
                                        >
                                            <div className="w-9 h-9 bg-fuchsia-100 border border-fuchsia-500 rounded-full flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-xs flex-1">{item.user_name}</h6>
                                            <h6 className="text-xs font-semibold">{item.all_calls}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col items-start my-4">
                            <h6 className="text-sm">Connected calls</h6>
                            <ScrollArea className="max-h-56">
                                {[...(lead || [])]
                                    .sort((a, b) => b.connected_calls - a.connected_calls)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex justify-between items-center gap-5 py-2"
                                        >
                                            <div className="w-9 h-9 bg-fuchsia-100 border border-fuchsia-500 rounded-full flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-xs flex-1">{item.user_name}</h6>
                                            <h6 className="text-xs font-semibold">{item.connected_calls}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                        <div className="rounded-xl p-4 flex flex-col items-start my-4">
                            <h6 className="text-sm">Call Duration</h6>
                            <ScrollArea className="max-h-56">
                                {[...(lead || [])]
                                    .sort((a, b) => b.total_call_duration - a.total_call_duration)
                                    .map((item, index) => (
                                        <div
                                            key={item.user_id}
                                            className="flex justify-between items-center gap-5 py-2"
                                        >
                                            <div className="w-9 h-9 bg-fuchsia-100 border border-fuchsia-500 rounded-full flex items-center justify-center text-sm text-fuchsia-600">
                                                {index + 1}
                                            </div>
                                            <h6 className="text-xs flex-1">{item.user_name}</h6>
                                            <h6 className="text-xs font-semibold">{item.total_call_duration}</h6>
                                        </div>
                                    ))}

                            </ScrollArea>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}