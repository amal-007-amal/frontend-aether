import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronsLeft, ChevronsRight, ChevronUp, FileDown, FolderOpen, Funnel, FunnelPlus, Menu, RefreshCcw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { FilterState } from "../../types/call";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AetherLoader from "../../shared/AetherLoader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { aetherFormatDate } from "../../hooks/useFormattedDate";
import { AetherMultiSelect } from "../../components/aethermultiselect";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { AetherDateRangePicker } from "../../components/aetherdaterangepicker";
import { useFormattedDuration } from "../../hooks/useDurationFormat";
import { Checkbox } from "../../components/ui/checkbox";
import { AetherNameMultiSelect } from "../../components/aethernamesselector";
import { useCallLogs } from "../../hooks/useCalllogs";
import type { DateRange } from "react-day-picker";
import { useUsers } from "../../hooks/useUsers";
import { createPortal } from "react-dom";
import { startOfToday, startOfWeek } from "date-fns";


export default function CallDetailPage() {
    const filterRefs = {
        funnelRef: useRef(null),
        otherNameRef: useRef(null),
        otherNumberRef: useRef(null),
        agentNumberRef: useRef(null),
        directionRef: useRef(null),
        statusRef: useRef(null)
    };
    const [openFilter, setOpenFilter] = useState({
        usernameOpen: false,
        otherNameOpen: false,
        otherNumberOpen: false,
        agentNumberOpen: false,
        directionOpen: false,
        statusOpen: false,
        timeFillOpen: false
    });
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [selectedTempUserIDs, setSelectedTempUserIDs] = useState<string[]>([]);
    const [tableFiller, setTableFiller] = useState<FilterState>({
        otherName: [],
        otherNumber: [],
        agentNumber: [],
        direction: [],
        callstatus: []
    });
    const [timesave, setTimeSave] = useState<{
        filterMinStart: string | null;
        filterMaxStart: string | null;
        userIDs?: string[];
    }>({
        filterMinStart: startOfToday().toISOString(),
        filterMaxStart: null,
        userIDs: []
    });
    const [selfilter, setSelFilter] = useState<string>("");
    const [range, setRange] = useState<DateRange | undefined>();
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string>('start_time');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const filters = {
        user_id: "",
        device_id: "",
        direction: "",
        status: "",
        duration: "",
        start_time: "",
        other_number: "",
        other_name: "",
        agent_number: ""
    };
    const Portal = ({ children }: { children: React.ReactNode }) => {
        if (typeof window === "undefined") return null;
        const portalRoot = document.getElementById("portal-root");
        return portalRoot ? createPortal(children, portalRoot) : null;
    };
    const allColumns = [
        { key: "user_id", label: "Username" },
        { key: "device_id", label: "Device ID" },
        { key: "direction", label: "Direction" },
        { key: "status", label: "Status" },
        { key: "duration", label: "Duration" },
        { key: "start_time", label: "Start Time" },
        { key: "other_number", label: "Other Number" },
        { key: "other_name", label: "Other Name" },
        { key: "agent_number", label: "Agent Number" },
        { key: "recording_ids", label: "Recordings" }
    ];
    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        allColumns.map((col) => col.key)
    );
    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) =>
            prev.includes(key)
                ? prev.filter((col) => col !== key)
                : [...prev, key]
        );
    };
    const { calllogs,
        selectedFilters,
        fetchCallLogsWith,
        timeFilters,
        setTimeFilters,
        isLoading } = useCallLogs()

    const { users, fetchUsers, isLoading: isUserloading } = useUsers()

    useEffect(() => {
        const stored = localStorage.getItem("call_filters");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                const { filterMinStart, filterMaxStart, userIDs } = parsed;

                setTimeSave({
                    filterMinStart: filterMinStart || null,
                    filterMaxStart: filterMaxStart || null,
                });

                setSelectedUserIDs(userIDs || []);
                setTimeFilters(parsed);
                fetchCallLogsWith(parsed);
            } catch (err) {
                console.error("Invalid filters in localStorage", err);
                const defaultFilters = {
                    filterMinStart: null,
                    filterMaxStart: null,
                    userIDs: []
                };
                setTimeFilters(defaultFilters);
                fetchCallLogsWith(defaultFilters);
            }
        } else {
            const defaultFilters = {
                filterMinStart: null,
                filterMaxStart: null,
                userIDs: []
            };
            setTimeFilters(defaultFilters);
            fetchCallLogsWith(defaultFilters);
        }

        fetchUsers();
    }, []);


    const [currentPage, setCurrentPage] = useState(1);
    const filteredData = useMemo(() => {
        return calllogs.filter((call) => {
            const userFilterPass =
                selectedTempUserIDs.length === 0 ||
                selectedTempUserIDs.includes(String(call.user_id));

            const otherNumberFilterPass =
                tableFiller.otherNumber.length === 0 ||
                tableFiller.otherNumber.includes(String(call.other_number));

            const otherNameFilterPass =
                tableFiller.otherName.length === 0 ||
                tableFiller.otherName.includes(String(call.other_name));

            const agentNumberFilterPass =
                tableFiller.agentNumber.length === 0 ||
                tableFiller.agentNumber.includes(String(call.agent_number));

            const directionFilterPass =
                tableFiller.direction.length === 0 ||
                tableFiller.direction.includes(String(call.direction));

            const statusFilterPass =
                tableFiller.callstatus.length === 0 ||
                tableFiller.callstatus.includes(String(call.status));

            const otherFiltersPass = Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const field = String((call as any)[key] ?? "").toLowerCase();
                return field.includes(value.toLowerCase());
            });


            return (
                userFilterPass &&
                otherNumberFilterPass &&
                otherNameFilterPass &&
                agentNumberFilterPass &&
                directionFilterPass &&
                statusFilterPass &&
                otherFiltersPass
            );
        });
    }, [calllogs,
        filters,
        selectedTempUserIDs,
        tableFiller.otherNumber,
        tableFiller.otherName,
        tableFiller.agentNumber,
        tableFiller.direction,
        tableFiller.callstatus,
        timesave
    ]);

    const sortedData = useMemo(() => {
        if (!sortKey) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = (a as any)[sortKey];
            const bVal = (b as any)[sortKey];

            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
            }

            return String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' }) * (sortOrder === 'asc' ? 1 : -1);
        });
    }, [filteredData, sortKey, sortOrder]);

    const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
    const startIndex = (currentPage - 1) * pageSize;
    const currentPageData = sortedData.slice(startIndex, startIndex + pageSize);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [pageSize, totalPages]);

    const handleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortOrder('asc');
        }
    };
    const handleDateFilterChange = (value: "today" | "week" | "custom") => {
        setSelFilter(value);
        if (value === "today") {
            const from = startOfToday().toISOString(); // Today 00:00:00.000Z
            setTimeSave((prev) => ({
                ...prev,
                filterMinStart: from,
                filterMaxStart: null
            }));
        }
        else if (value === "week") {
            const from = startOfWeek(new Date(), { weekStartsOn: 0 }).toISOString(); // Sunday 00:00

            setTimeSave((prev) => ({
                ...prev,
                filterMinStart: from,
                filterMaxStart: null
            }));
        }
        else {
            if (range?.from && range?.to) {
                setTimeSave((prev) => ({
                    ...prev,
                    filterMinStart: range.from instanceof Date ? range.from.toISOString() : new Date(range.from!).toISOString(),
                    filterMaxStart: range.to instanceof Date ? range.to.toISOString() : new Date(range.to!).toISOString(),
                }));
            } else {
                setTimeSave((prev) => ({
                    ...prev,
                    filterMinStart: null,
                    filterMaxStart: null,
                }));
            }
        }
    };

    useEffect(() => {
        if (selfilter === "custom" && range?.from && range?.to) {
            setTimeSave({
                filterMinStart: range.from.toISOString(),
                filterMaxStart: range.to.toISOString()
            });
        }
    }, [range, selfilter]);


    const handleFilterApply = () => {
        const filters = {
            filterMinStart: timesave.filterMinStart,
            filterMaxStart: timesave.filterMaxStart,
            userIDs: selectedUserIDs
        };

        localStorage.setItem("aether_call_filters", JSON.stringify(filters));

        setTimeFilters(filters);
        fetchCallLogsWith(filters);
    };


    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-normal flex items-center">Call Logs</h2>

                    <div className="flex items-center gap-5">
                        <RefreshCcw onClick={() => fetchCallLogsWith(timeFilters)} className={`h-4 w-4 cursor-pointer ${isLoading ? 'animate-spin' : ''}`} />
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <FunnelPlus className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <div onClick={(e) => e.stopPropagation()} >
                                    <Select onValueChange={handleDateFilterChange}>
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
                                <div onClick={(e) => e.stopPropagation()}>
                                    <p className="text-sm font-semibold mb-1">Columns</p>
                                    <div className="grid grid-cols-2 gap-x-6">
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
                                <div className="flex justify-end">
                                    <Button onClick={handleFilterApply} className="bg-black text-white text-xs rounded-xl">Apply</Button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <Menu className="h-4 w-4 text-black" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <span className="text-xs flex gap-3 cursor-pointer"><FileDown className="w-4 h-4" /> Export To Pdf</span>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <div className="max-h-[500px] overflow-y-auto">
                    <Table className="cursor-pointer">
                        <TableHeader>
                            <TableRow className="text-sm font-light">
                                <TableHead className="text-xs font-semibold">Sl No.</TableHead>
                                {visibleColumns.includes("user_id") && (
                                    <TableHead className="text-xs font-semibold text-center">
                                        <div className="flex items-center justify-between gap-1 relative">
                                            <span>Agent name</span>
                                            <Funnel
                                                ref={filterRefs.funnelRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, usernameOpen: true
                                                }))}
                                                className={`h-3 w-4 ${selectedTempUserIDs.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                            />
                                            <Portal>
                                                <div className="relative">
                                                    <AetherNameMultiSelect
                                                        data={users.map((user) => ({ label: user.name, value: user.id }))}
                                                        selected={selectedTempUserIDs}
                                                        onChange={setSelectedTempUserIDs}
                                                        open={openFilter.usernameOpen}
                                                        setOpen={(open) => { setOpenFilter(prev => ({ ...prev, usernameOpen: open })) }}
                                                        referenceRef={filterRefs.funnelRef}
                                                    />
                                                </div>
                                            </Portal>
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("device_id") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer text-center"
                                    > Device ID
                                    </TableHead>
                                )}
                                {visibleColumns.includes("direction") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer text-center"
                                    >
                                        <div className="flex items-center justify-between relative">
                                            <span>Direction</span>
                                            <Funnel
                                                ref={filterRefs.directionRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, directionOpen: true
                                                }))}
                                                className={`h-3 w-4 ${tableFiller.direction.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                            />
                                            <Portal>
                                                <div className="relative">
                                                    <AetherNameMultiSelect
                                                        data={selectedFilters.direction.map((name) => ({ label: name, value: name }))}
                                                        selected={tableFiller.direction}
                                                        onChange={(selected) =>
                                                            setTableFiller((prev) => ({ ...prev, direction: selected }))
                                                        }
                                                        open={openFilter.directionOpen}
                                                        setOpen={(val) =>
                                                            setOpenFilter((prev) => ({ ...prev, directionOpen: val }))
                                                        }
                                                        referenceRef={filterRefs.directionRef}
                                                    />
                                                </div>
                                            </Portal>
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("status") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer text-center"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span>Status</span>
                                            <div>
                                                <Funnel
                                                    ref={filterRefs.statusRef}
                                                    onClick={() => setOpenFilter(prev => ({
                                                        ...prev, statusOpen: true
                                                    }))}
                                                    className={`h-3 w-4 ${tableFiller.callstatus.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                                />
                                            </div>
                                            <Portal>
                                                <div className="relative">
                                                    <AetherNameMultiSelect
                                                        data={selectedFilters.callstatus.map((name) => ({ label: name, value: name }))}
                                                        selected={tableFiller.callstatus}
                                                        onChange={(selected) =>
                                                            setTableFiller((prev) => ({ ...prev, callstatus: selected }))
                                                        }
                                                        open={openFilter.statusOpen}
                                                        setOpen={(val) =>
                                                            setOpenFilter((prev) => ({ ...prev, statusOpen: val }))
                                                        }
                                                        referenceRef={filterRefs.statusRef}
                                                    />
                                                </div>
                                            </Portal>
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("duration") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer text-center"
                                    >
                                        <span className="flex items-center justify-between gap-1">
                                            <span onClick={() => handleSort("duration")} className="flex items-center gap-1">
                                                Duration
                                                {sortKey === "duration" && (
                                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </span>
                                        </span>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("start_time") && (
                                    <TableHead className="text-xs font-semibold cursor-pointer text-center">
                                        <span className="flex items-center justify-between">
                                            <span onClick={() => handleSort("start_time")} className="flex items-center gap-1">
                                                Start Time
                                                {sortKey === "start_time" && (
                                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </span>
                                            <div className="relative">
                                                <Funnel
                                                    onClick={() => {
                                                        setOpenFilter(prev => ({
                                                            ...prev,
                                                            timeFillOpen: true
                                                        }));
                                                    }}
                                                    className={`h-3 w-4 cursor-pointer text-gray-400`}
                                                />
                                            </div>
                                        </span>
                                    </TableHead>

                                )}
                                {visibleColumns.includes("other_number") && (
                                    <TableHead
                                        className="text-center text-xs font-semibold flex items-center justify-between relative shadow-none"
                                    >
                                        Caller ID
                                        <Funnel
                                            ref={filterRefs.otherNumberRef}
                                            onClick={() => setOpenFilter(prev => ({
                                                ...prev, otherNumberOpen: true
                                            }))}
                                            className={`h-3 w-4 ${tableFiller.otherNumber.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                        />
                                        <Portal>
                                            <div className="relative">
                                                <AetherNameMultiSelect
                                                    data={selectedFilters.otherNumber.map((name) => ({ label: name, value: name }))}
                                                    selected={tableFiller.otherNumber}
                                                    onChange={(selected) =>
                                                        setTableFiller((prev) => ({ ...prev, otherNumber: selected }))
                                                    }
                                                    open={openFilter.otherNumberOpen}
                                                    setOpen={(val) =>
                                                        setOpenFilter((prev) => ({ ...prev, otherNumberOpen: val }))
                                                    }
                                                    referenceRef={filterRefs.otherNumberRef}
                                                />
                                            </div>
                                        </Portal>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("other_name") && (
                                    <TableHead className="text-center text-xs font-semibold cursor-pointer">
                                        <span className="flex items-center justify-between gap-1">
                                            Caller Name
                                            <Funnel
                                                ref={filterRefs.otherNameRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, otherNameOpen: true
                                                }))}
                                                className={`h-3 w-4 ${tableFiller.otherName.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                            />
                                            <Portal>
                                                <div>
                                                    <AetherNameMultiSelect
                                                        data={selectedFilters.otherName.map((name) => ({ label: name, value: name }))}
                                                        selected={tableFiller.otherName}
                                                        onChange={(selected) =>
                                                            setTableFiller((prev) => ({ ...prev, otherName: selected }))
                                                        }
                                                        open={openFilter.otherNameOpen}
                                                        setOpen={(val) =>
                                                            setOpenFilter((prev) => ({ ...prev, otherNameOpen: val }))
                                                        }
                                                        referenceRef={filterRefs.otherNameRef}
                                                    />
                                                </div>
                                            </Portal>
                                        </span>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("agent_number") && (
                                    <TableHead className="text-center text-xs font-semibold cursor-pointer">
                                        <span className="flex items-center justify-between gap-1">
                                            Agent number
                                            <Funnel
                                                ref={filterRefs.agentNumberRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, agentNumberOpen: true
                                                }))}
                                                className={`h-3 w-4 ${tableFiller.agentNumber.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                            />
                                            <Portal>
                                                <div className="relative">
                                                    <AetherNameMultiSelect
                                                        data={selectedFilters.agentNumber.map((name) => ({ label: name, value: name }))}
                                                        selected={tableFiller.agentNumber}
                                                        onChange={(selected) =>
                                                            setTableFiller((prev) => ({ ...prev, agentNumber: selected }))
                                                        }
                                                        open={openFilter.agentNumberOpen}
                                                        setOpen={(val) =>
                                                            setOpenFilter((prev) => ({ ...prev, agentNumberOpen: val }))
                                                        }
                                                        referenceRef={filterRefs.agentNumberRef}
                                                    />
                                                </div>
                                            </Portal>
                                        </span>
                                    </TableHead>
                                )}

                                {visibleColumns.includes("agent_number") && (
                                    <TableHead className="text-center text-xs font-semibold cursor-pointer">
                                        Recordings
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                        <TableBody className="text-xs">
                            {currentPageData.length !== 0 && (
                                currentPageData.map((call, index) => (
                                    <TableRow key={call.id}>
                                        <TableCell className="text-left">{index + 1}</TableCell>
                                        {visibleColumns.includes("user_id") && (
                                            <TableCell className="text-left">{call.user_id}</TableCell>
                                        )}
                                        {visibleColumns.includes("device_id") && (
                                            <TableCell className="text-left">{call.device_id}</TableCell>
                                        )}
                                        {visibleColumns.includes("direction") && (
                                            <TableCell className="text-left">{call.direction}</TableCell>
                                        )}
                                        {visibleColumns.includes("status") && (
                                            <TableCell className="text-left">{call.status}</TableCell>
                                        )}
                                        {visibleColumns.includes("duration") && (
                                            <TableCell className="text-left">{useFormattedDuration(call.duration)}</TableCell>
                                        )}
                                        {visibleColumns.includes("start_time") && (
                                            <TableCell className="text-left">{aetherFormatDate(call.start_time)}</TableCell>
                                        )}
                                        {visibleColumns.includes("other_number") && (
                                            <TableCell className="text-left">{call.other_number}</TableCell>
                                        )}
                                        {visibleColumns.includes("other_name") && (
                                            <TableCell className="text-left">{call.other_name === "null" ? '-' : call.other_name}</TableCell>
                                        )}
                                        {visibleColumns.includes("agent_number") && (
                                            call.agent_number !== "" ? (
                                                <TableCell className="text-left">{call.agent_number}</TableCell>
                                            ) : (
                                                <TableCell className="text-left">{'-'}</TableCell>
                                            )
                                        )}
                                        {visibleColumns.includes("recording_ids") && (
                                            <TableCell>
                                                {call.recording_ids?.map((item, index) => (
                                                    <div key={index} className="my-1">
                                                        <audio
                                                            controls
                                                            className="w-28 h-7 text-xs rounded"
                                                        >
                                                            <source src={item} type="audio/mpeg" />
                                                            Your browser does not support the audio element.
                                                        </audio>
                                                    </div>
                                                ))}
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )
                            }
                        </TableBody>
                    </Table>
                </div>
                {currentPageData.length === 0 && (
                    <div className="flex flex-col items-center mt-10">
                        <FolderOpen className="text-gray-500 w-10 h-10" />
                        <p className="text-center text-xs text-gray-500 py-2">No data available</p>
                    </div>
                )}

                <div className="flex items-center justify-end mt-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-xs">Rows per Page</span>
                        <Input
                            type="number"
                            className="w-20 text-center shadow-none rounded-xl border border-gray-200"
                            min={1}
                            value={pageSize}
                            onChange={(e) => {
                                const value = parseInt(e.target.value);
                                if (!isNaN(value) && value > 0) {
                                    setPageSize(value);
                                    setCurrentPage(1);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const value = parseInt(e.currentTarget.value);
                                    if (!isNaN(value) && value > 0) {
                                        setPageSize(value);
                                        setCurrentPage(1);
                                    }
                                }
                            }}
                        />
                    </div>
                    <Button
                        className="bg-white shadow-none text-xs text-black hover:bg-gray-100"
                        onClick={() => {
                            const newPage = Math.max(currentPage - 1, 1);
                            setCurrentPage(newPage);
                        }}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />Prev
                    </Button>
                    <span>
                        <input
                            type="number"
                            min={1}
                            max={totalPages}
                            value={currentPage}
                            onChange={(e) => {
                                const page = parseInt(e.target.value);
                                if (!isNaN(page)) {
                                    setCurrentPage(Math.min(Math.max(1, page), totalPages)); // Clamp between 1 and totalPages
                                }
                            }}
                           className="w-20 h-8 text-center shadow-none rounded-xl border border-gray-200 px-2"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    const page = parseInt((e.target as HTMLInputElement).value);
                                    if (!isNaN(page)) {
                                        setCurrentPage(Math.min(Math.max(1, page), totalPages));
                                    }
                                }
                            }}
                        />&nbsp;&nbsp;&nbsp;of&nbsp;&nbsp;{totalPages}</span>
                    <Button
                        className="bg-white shadow-none text-black hover:bg-gray-100 text-xs"
                        onClick={() => {
                            const newPage = Math.min(currentPage + 1, totalPages);
                            setCurrentPage(newPage);
                        }}
                        disabled={currentPage === totalPages}
                    >
                        Next <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>

            </div>
            {isLoading || isUserloading && (
                <AetherLoader />
            )}
        </div>
    )

}