import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCalls } from "../../api/call";
import { toast } from "sonner";
import { ChevronDown, ChevronsLeft, ChevronsRight, ChevronUp, FolderOpen, Funnel, FunnelPlus, RefreshCcw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { CallLogDetails, FilterState } from "../../types/call";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import AetherLoader from "../../shared/AetherLoader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getUsers } from "../../api/login";
import type { User } from "../../types/login";
import { aetherFormatDate } from "../../hooks/useFormattedDate";
import { AetherMultiSelect } from "../../components/aethermultiselect";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import type { DateRange } from "react-day-picker";
import { AetherDateRangePicker } from "../../components/aetherdaterangepicker";
import { useFormattedDuration } from "../../hooks/useDurationFormat";
import { Checkbox } from "../../components/ui/checkbox";
import { AetherNameMultiSelect } from "../../components/aethernamesselector";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";

export default function CallDetailPage() {
    const filterRefs = {
        funnelRef: useRef(null),
        otherNameRef: useRef(null),
        otherNumberRef: useRef(null),
        agentNumberRef: useRef(null),
        directionRef: useRef(null),
        statusRef: useRef(null)
    };
    const [isPass, setIsPass] = useState(false)
    const [calllogs, setCalllogs] = useState<CallLogDetails[]>([])
    const [openFilter, setOpenFilter] = useState({
        usernameOpen: false,
        otherNameOpen: false,
        otherNumberOpen: false,
        agentNumberOpen: false,
        directionOpen: false,
        statusOpen: false,
        timeFillOpen: false
    });
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [selectedTempUserIDs, setSelectedTempUserIDs] = useState<string[]>([]);
    const [selectedFilters, setSelectedFilters] = useState({
        otherNames: [] as string[],
        otherNumbers: [] as string[],
        agentNumbers: [] as string[],
        direction: [] as string[],
        callstatus: [] as string[]
    });
    const [tableFiller, setTableFiller] = useState<FilterState>({
        otherName: [],
        otherNumber: [],
        agentNumber: [],
        direction: [],
        callstatus: []
    });
    const [timesave, setTimeSave] = useState({
        startHour: 0,
        endHour: 24
    });
    const [draft, setDraft] = useState({
        startHour: 0,
        endHour: 24
    });
    const [selfilter, setSelFilter] = useState<string>("");
    const [range, setRange] = useState<DateRange | undefined>();
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string>('start_time');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filters, setFilters] = useState({
        user_id: "",
        device_id: "",
        direction: "",
        status: "",
        duration: "",
        start_time: "",
        other_number: "",
        other_name: "",
        agent_number: ""
    });
    console.log(setFilters)
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
    const fetchCallLogs = useCallback(async () => {
        setIsPass(true);
        try {
            const data = await getCalls();
            setCalllogs([...data]);
            const otNameSet = new Set<string>();
            const otNumberSet = new Set<string>();
            const agNumberSet = new Set<string>();
            const directionSet = new Set<string>();
            const callstatusSet = new Set<string>();

            data.forEach(item => {
                if (item.other_name) otNameSet.add(item.other_name);
                if (item.other_number) otNumberSet.add(item.other_number);
                if (item.agent_number) agNumberSet.add(item.agent_number);
                if (item.direction) directionSet.add(item.direction);
                if (item.status) callstatusSet.add(item.status)
            });
            setSelectedFilters({
                otherNames: [...otNameSet],
                otherNumbers: [...otNumberSet],
                agentNumbers: [...agNumberSet],
                direction: [...directionSet],
                callstatus: [...callstatusSet]
            });
        } catch (err) {
            toast.error("Failed to fetch call logs");
        } finally {
            setIsPass(false);
        }
    }, []);

    const fetchUsers = useCallback(async () => {
        setIsPass(true);
        try {
            const data = await getUsers();
            setUsers([...data]);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setIsPass(false);
        }
    }, []);

    useEffect(() => {
        fetchCallLogs();
        fetchUsers();
    }, [fetchCallLogs, fetchUsers]);

    const [currentPage, setCurrentPage] = useState(1);

    console.log("Call logs:", selectedUserIDs.length);

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


            const callHour = parseInt(call.start_time?.slice(0, 2) || "0", 10);
            const timeFilterPass =
                callHour >= timesave.startHour && callHour <= timesave.endHour;

            return (
                userFilterPass &&
                otherNumberFilterPass &&
                otherNameFilterPass &&
                agentNumberFilterPass &&
                directionFilterPass &&
                statusFilterPass &&
                timeFilterPass &&
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

    // Step 2: Pagination
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

    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-normal flex items-center">Call Logs</h2>

                    <div className="flex items-center gap-5">
                        <RefreshCcw onClick={fetchCallLogs} className={`h-4 w-4 cursor-pointer ${isPass ? 'animate-spin' : ''}`} />
                        <DropdownMenu>
                            <DropdownMenuTrigger>
                                <FunnelPlus className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <div onClick={(e) => e.stopPropagation()}>
                                    <Select onValueChange={(value) => setSelFilter(value)}>
                                        <SelectTrigger className="w-full">
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
                                    {allColumns.map((col) => (
                                        <div key={col.key} className="flex items-center gap-2 text-sm">
                                            <Checkbox
                                                id={`col-${col.key}`}
                                                checked={visibleColumns.includes(col.key)}
                                                onCheckedChange={() => toggleColumn(col.key)}
                                            />
                                            <label htmlFor={`col-${col.key}`} className="cursor-pointer">
                                                {col.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    </div>
                </div>
                <Table className="cursor-pointer max-h-64 overflow-y-auto border-t">
                    <TableHeader>
                        <TableRow className="text-sm font-light">
                            <TableHead className="text-xs font-semibold">Sl No.</TableHead>
                            {visibleColumns.includes("user_id") && (
                                <TableHead className="text-xs font-semibold">
                                    <div className="flex items-center justify-between gap-1 relative">
                                        <span>Username</span>
                                        <Funnel
                                            ref={filterRefs.funnelRef}
                                            onClick={() => setOpenFilter(prev => ({
                                                ...prev, usernameOpen: true
                                            }))}
                                            className={`h-3 w-4 ${selectedTempUserIDs.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                        />
                                        {selectedTempUserIDs.length !== 0 && (
                                            <span className="absolute -top-[0.1rem] right-5 h-2 w-2 rounded-full bg-fuchsia-500" />
                                        )}
                                        <AetherNameMultiSelect
                                            data={users.map((user) => ({ label: user.name, value: user.id }))}
                                            selected={selectedTempUserIDs}
                                            onChange={setSelectedTempUserIDs}
                                            open={openFilter.usernameOpen}
                                            setOpen={(open) => { setOpenFilter(prev => ({ ...prev, usernameOpen: open })) }}
                                            referenceRef={filterRefs.funnelRef}
                                        />
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.includes("device_id") && (
                                <TableHead
                                    className="text-xs font-semibold cursor-pointer"
                                > Device ID
                                </TableHead>
                            )}
                            {visibleColumns.includes("direction") && (
                                <TableHead
                                    className="text-xs font-semibold cursor-pointer"
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
                                        {tableFiller.direction.length !== 0 && (
                                            <span className="absolute -top-[0.1rem] right-3 h-2 w-2 rounded-full bg-fuchsia-500" />
                                        )}
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
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.includes("status") && (
                                <TableHead
                                    className="text-xs font-semibold cursor-pointer"
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
                                            {tableFiller.callstatus.length !== 0 && (
                                                <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-500" />
                                            )}
                                        </div>
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
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.includes("duration") && (
                                <TableHead
                                    className="text-xs font-semibold cursor-pointer"
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
                                <TableHead className="text-xs font-semibold cursor-pointer">
                                    <span className="flex items-center justify-between gap-1">
                                        <span onClick={() => handleSort("start_time")} className="flex items-center gap-1">
                                            Start Time
                                            {sortKey === "start_time" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Popover
                                            open={openFilter.timeFillOpen}
                                            onOpenChange={(open) => {
                                                if (open) setDraft(timesave);
                                                setOpenFilter(prev => ({ ...prev, timeFillOpen: open }));
                                            }}
                                        >
                                            <PopoverTrigger asChild>
                                                <div className="relative">
                                                    <Funnel
                                                        onClick={() => {
                                                            setOpenFilter(prev => ({
                                                                ...prev,
                                                                timeFillOpen: true
                                                            }));
                                                        }}
                                                        className={`h-3 w-4 cursor-pointer ${timesave.startHour !== 0 || timesave.endHour !== 24
                                                                ? "text-blue-600"
                                                                : "text-gray-400"
                                                            }`}
                                                    />
                                                    {(timesave.startHour !== 0 || timesave.endHour !== 24) && (
                                                        <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-fuchsia-500" />
                                                    )}
                                                </div>
                                            </PopoverTrigger>

                                            <PopoverContent className="w-64 space-y-4">
                                                <div>
                                                    <label className="text-xs text-gray-500">
                                                        Start: {draft.startHour}:00
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="23"
                                                        value={draft.startHour}
                                                        onChange={(e) =>
                                                            setDraft((prev) => ({
                                                                ...prev,
                                                                startHour: Number(e.target.value)
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs text-gray-500">
                                                        End: {draft.endHour}:00
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min={draft.startHour}
                                                        max="24"
                                                        value={draft.endHour}
                                                        onChange={(e) =>
                                                            setDraft((prev) => ({
                                                                ...prev,
                                                                endHour: Number(e.target.value)
                                                            }))
                                                        }
                                                        className="w-full"
                                                    />
                                                </div>

                                                <div className="flex justify-between gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setDraft({ startHour: 0, endHour: 24 });
                                                            setTimeSave({ startHour: 0, endHour: 24 });
                                                            setOpenFilter((prev) => ({
                                                                ...prev,
                                                                timeFillOpen: false
                                                            }));
                                                        }}
                                                        className="text-xs text-gray-500 underline"
                                                    >
                                                        Reset
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            setTimeSave(draft);
                                                            setOpenFilter((prev) => ({
                                                                ...prev,
                                                                timeFillOpen: false
                                                            }));
                                                        }}
                                                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md"
                                                    >
                                                        Apply
                                                    </button>
                                                </div>
                                            </PopoverContent>
                                        </Popover>

                                    </span>
                                </TableHead>

                            )}
                            {visibleColumns.includes("other_number") && (
                                <TableHead
                                    className="text-xs font-semibold flex items-center justify-between relative"
                                >
                                    Other Number
                                    <Funnel
                                        ref={filterRefs.otherNumberRef}
                                        onClick={() => setOpenFilter(prev => ({
                                            ...prev, otherNumberOpen: true
                                        }))}
                                        className={`h-3 w-4 ${tableFiller.otherNumber.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                    />
                                    <div className="relative">
                                        <AetherNameMultiSelect
                                            data={selectedFilters.otherNumbers.map((name) => ({ label: name, value: name }))}
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
                                </TableHead>
                            )}
                            {visibleColumns.includes("other_name") && (
                                <TableHead className="text-xs font-semibold cursor-pointer">
                                    <span className="flex items-center justify-between gap-1">
                                        Other Name
                                        <Funnel
                                            ref={filterRefs.otherNameRef}
                                            onClick={() => setOpenFilter(prev => ({
                                                ...prev, otherNameOpen: true
                                            }))}
                                            className={`h-3 w-4 ${tableFiller.otherName.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                        />
                                        <div className="relative">
                                            <AetherNameMultiSelect
                                                data={selectedFilters.otherNames.map((name) => ({ label: name, value: name }))}
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
                                    </span>
                                </TableHead>
                            )}
                            {visibleColumns.includes("agent_number") && (
                                <TableHead className="text-xs font-semibold cursor-pointer">
                                    <span className="flex items-center justify-between gap-1">
                                        Agent Number
                                        <Funnel
                                            ref={filterRefs.agentNumberRef}
                                            onClick={() => setOpenFilter(prev => ({
                                                ...prev, agentNumberOpen: true
                                            }))}
                                            className={`h-3 w-4 ${tableFiller.agentNumber.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                        />
                                        <div className="relative">
                                            <AetherNameMultiSelect
                                                data={selectedFilters.agentNumbers.map((name) => ({ label: name, value: name }))}
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
                                    </span>
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
                                        <TableCell className="text-left">{call.agent_number}</TableCell>
                                    )}
                                </TableRow>
                            ))
                        )
                        }
                    </TableBody>
                </Table>
                {currentPageData.length === 0 && (
                    <div className="flex flex-col items-center mt-10">
                        <FolderOpen className="text-gray-500 w-10 h-10" />
                        <p className="text-center text-xs text-gray-500 py-2">No data available</p>
                    </div>
                )}

                <div className="flex items-center justify-end mt-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
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
            {isPass && (
                <AetherLoader />
            )}
        </div>
    )

}