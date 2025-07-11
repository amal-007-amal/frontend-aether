import { Columns3, FileDown, FunnelPlus, Menu, RefreshCcw } from "lucide-react";
import { AetherTooltip } from "../../components/aethertooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AetherMultiSelect } from "../../components/aethermultiselect";
import { useUsers } from "../../hooks/useUsers";
import { useEffect, useState } from "react";
import type { AetherFilterApiVal } from "../../types/common";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import AetherLoader from "../../shared/AetherLoader";

export default function CallDetailTestPage() {
    const [isFilterOpen, setISDilterOpen] = useState(false)
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [filter, setfilter] = useState<string>("today")
    const { users, fetchUsers, isLoading: isUserloading } = useUsers()
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    const [allColumns, setAllColumns] = useState([
        { key: "other_number", label: "Caller ID", active: true },
        { key: "other_name", label: "Caller Name", active: true },
        { key: "call_type", label: "Call Type", active: true },
        { key: "type", label: "Android Type", active: false },
        { key: "start_time", label: "Timestamp", active: true },
        { key: "duration", label: "Duration", active: true },
        { key: "user_id", label: "Agent Name", active: true },
        { key: "agent_number", label: "Agent Number", active: true },
        { key: "device_id", label: "Device ID", active: false },
        { key: "recording_ids", label: "Recordings", active: true }
    ]);
    // const getColHeaderLabel = (key: string) => {
    //     const getlabel = allColumns.find(item => item.key === key)
    //     if (getlabel !== undefined) {
    //         return getlabel
    //     }
    // }
    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        allColumns.filter((col) => col.active).map((col) => col.key)
    );
    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) =>
            prev.includes(key)
                ? prev.filter((col) => col !== key)
                : [...prev, key]
        );
        setAllColumns((prev) =>
            prev.map((col) =>
                col.key === key ? { ...col, active: !col.active } : col
            )
        );
    };
    const handleFilterApply = () => { }
    const handleResetFilters = () => { }
    const handleexportpdf = () => { }
    const handleFilterChange = (value: AetherFilterApiVal) => {
        setfilter(value)
    }
    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200 dark:border-stone-700">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-medium flex items-center">Call Logs</h2>
                    <div className="flex items-center gap-5">
                        <AetherTooltip label="Refresh">
                            <RefreshCcw className={`h-4 w-4 cursor-pointer`} />
                        </AetherTooltip>
                        <DropdownMenu open={isFilterOpen} onOpenChange={setISDilterOpen}>
                            <DropdownMenuTrigger>
                                <AetherTooltip label="call Filter">
                                    <FunnelPlus className={`h-4 w-4`} />
                                </AetherTooltip>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <div onClick={(e) => e.stopPropagation()} >
                                    <Select value={filter} onValueChange={handleFilterChange}>
                                        <SelectTrigger className="w-full text-xs shadow-none">
                                            <SelectValue placeholder="Select a filter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="today">Today</SelectItem>
                                            <SelectItem value="past_24_hours">Past 24 hrs</SelectItem>
                                            <SelectItem value="yesterday">Yesterday</SelectItem>
                                            <SelectItem value="this_week">This Week</SelectItem>
                                            <SelectItem value="past_7_days">Past 7 days</SelectItem>
                                            <SelectItem value="this_month">This Month</SelectItem>
                                            <SelectItem value="last_30_days">Last 30 days</SelectItem>
                                            <SelectItem value="custom">Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div onClick={(e) => e.stopPropagation()}>
                                    <AetherMultiSelect
                                        data={users.map((user) => ({ label: user.name, value: user.id }))}
                                        selected={selectedUserIDs}
                                        onChange={setSelectedUserIDs}
                                    />
                                </div>
                                <div className="flex justify-end gap-4">
                                    <Button className="bg-white text-black text-xs rounded-xl hover:bg-gray-500" onClick={handleResetFilters}>Reset</Button>
                                    <Button onClick={handleFilterApply} className="bg-fuchsia-500 text-white text-xs rounded-xl hover:bg-fuchsia-300">Apply</Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <AetherTooltip label="Columns">
                                    <Columns3 className="h-4 w-4" />
                                </AetherTooltip>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <p className="text-sm font-semibold mb-1">Columns</p>
                                    <div className="grid grid-cols-1 gap-x-6">
                                        {allColumns.map((col) => (
                                            <div key={col.key} className="flex items-center gap-2 text-sm">
                                                <Checkbox
                                                    id={`col-${col.key}`}
                                                    checked={visibleColumns.includes(col.key)}
                                                    onCheckedChange={() => toggleColumn(col.key)}
                                                />
                                                <label htmlFor={`col-${col.key}`} className="cursor-pointer text-xs py-1">
                                                    {col.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <AetherTooltip label="Export option">
                                    <Menu className="h-4 w-4" />
                                </AetherTooltip>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <span onClick={handleexportpdf} className="text-xs flex gap-3 cursor-pointer"><FileDown className="w-4 h-4" /> Export as Pdf</span>
                                <span onClick={handleexportpdf} className="text-xs flex gap-3 cursor-pointer"><FileDown className="w-4 h-4" /> Export as csv</span>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {isUserloading && (<AetherLoader />)}
        </div>
    )
}