import { Funnel, RefreshCcw } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu"
import { AetherDateRangePicker } from "../../components/aetherdaterangepicker"
import { useState } from "react"
import type { DateRange } from "react-day-picker"
import { ScrollArea } from "../../components/ui/scroll-area"
import { useLeaderBoard } from "../../hooks/useLeaderBoard"

export const AetherDashboard = () => {
    const [selfilter, setSelFilter] = useState<string>("");
    const [range, setRange] = useState<DateRange | undefined>();
    const handleDateFilterChange = (value: "today" | "week" | "custom") => {
        setSelFilter(value);
    }
    const useFilters = {
        "time_filter": "today",
        "start_date": "2025-07-07T17:47:34.820Z",
        "end_date": "2025-07-07T17:47:34.820Z",
        "user_ids": []
    }

    const { data } = useLeaderBoard(useFilters);

    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-normal flex items-center">Dashboard</h2>
                    <div className="flex items-center gap-5">
                        <RefreshCcw className={`h-4 w-4 cursor-pointer`} />
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Funnel className="h-4 w-4 text-black" />
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
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-12 gap-4 my-4">
                <div className="col-span-12 lg:col-span-8 border border-gray-200 rounded-xl p-4">
                    <h2 className="text-sm font-normal text-left">Leaderboard</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="rounded-lg p-4 flex flex-col items-start">
                            <h6 className="text-sm">All calls</h6>
                            <ScrollArea className="max-h-56">
                                {[...(data?.leaderboard || [])]
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
                        <div className="rounded-lg p-4 flex flex-col items-start">
                            <h6 className="text-sm">Connected calls</h6>
                            <ScrollArea className="max-h-56">
                                {[...(data?.leaderboard || [])]
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
                        <div className="rounded-lg p-4 flex flex-col items-start">
                            <h6 className="text-sm">Call Duration</h6>
                            <ScrollArea className="max-h-56">
                                {[...(data?.leaderboard || [])]
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
                <div className="col-span-12 lg:col-span-4 border border-gray-200 rounded-xl p-4">

                </div>
            </div>

        </div>
    )
}