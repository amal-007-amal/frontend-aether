import { useEffect, useMemo, useRef, useState } from "react";
import { ChartPie, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CirclePlay, Columns3, Download, FileDown, FolderOpen, Funnel, FunnelPlus, Menu, RefreshCcw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { filters, type FilterState } from "../../types/call";
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
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Range } from "react-range";
import { Calendar } from "../../components/ui/calendar";
import { cn } from "../../lib/utils";
import { useRecording } from "../../hooks/useRecording";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../../components/ui/dialog";
import { typeMap } from "../../types/callnamemap";
import { ScrollArea } from "../../components/ui/scroll-area";
import { AetherTooltip } from "../../components/aethertooltip";

export default function CallDetailPage() {
    const filterRefs = {
        funnelRef: useRef(null),
        otherNameRef: useRef(null),
        otherNumberRef: useRef(null),
        agentNumberRef: useRef(null),
        directionRef: useRef(null),
        statusRef: useRef(null),
        typeCallRef: useRef(null),
        callTypeRef: useRef(null)
    };
    const [openFilter, setOpenFilter] = useState({
        usernameOpen: false,
        otherNameOpen: false,
        otherNumberOpen: false,
        agentNumberOpen: false,
        directionOpen: false,
        statusOpen: false,
        timeFillOpen: false,
        durationRangeOpen: false,
        typeCallOpen: false,
        callTypeOpen: false,
        showAbandonedOnly: false
    });
    const [isFilterOpen, setISDilterOpen] = useState(false)
    const [filterStatus,setFilterStatus] =  useState(false)
    const [showDialog, setShowDialog] = useState(false);
    const timeOptions = Array.from({ length: 60 }, (_, i) => i);
    const [fromHour, setFromHour] = useState<number>(0);
    const [fromMinute, setFromMinute] = useState<number>(0);
    const [toHour, setToHour] = useState<number>(23);
    const [toMinute, setToMinute] = useState<number>(59);
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [selectedTempUserIDs, setSelectedTempUserIDs] = useState<string[]>([]);
    const [tableFiller, setTableFiller] = useState<FilterState>({
        otherName: [],
        otherNumber: [],
        agentNumber: [],
        direction: [],
        callstatus: [],
        typecall: [],
        callTypes: []
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
    const [starttimeFill, setStarttimeFill] = useState<{
        startFromTime: Date | undefined;
        startToTime: Date | undefined;
    }>({
        startFromTime: undefined,
        startToTime: undefined,
    });
    const [tempStarttimeFill, setTempStarttimeFill] = useState<{
        startFromTime: Date | undefined;
        startToTime: Date | undefined;
    }>({
        startFromTime: undefined,
        startToTime: undefined,
    });
    const [values, setValues] = useState([0, 240]);
    const [tempValues, setTempValues] = useState([0, 240])
    const [selfilter, setSelFilter] = useState<string>("");
    const [range, setRange] = useState<DateRange | undefined>();
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string>('start_time');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const Portal = ({ children }: { children: React.ReactNode }) => {
        if (typeof window === "undefined") return null;
        const portalRoot = document.getElementById("portal-root");
        return portalRoot ? createPortal(children, portalRoot) : null;
    };
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
    const getColHeaderLabel = (key: string) => {
        const getlabel = allColumns.find(item => item.key === key)
        if (getlabel !== undefined) {
            return getlabel
        }
    }
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
    const { users, fetchUsers, isLoading: isUserloading } = useUsers()
    const {
        calllogs,
        abandoned,
        selectedFilters,
        fetchCallLogsWith,
        timeFilters,
        setTimeFilters,
        isLoading } = useCallLogs()
    const { fetchRecording, recordingMap, loadingMap } = useRecording();
    useEffect(() => {
        const fetchInitialData = () => {
            const stored = localStorage.getItem("aether_call_filters");

            const defaultFilters = {
                filterMinStart: null,
                filterMaxStart: null,
                userIDs: [],
            };

            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    const {
                        filterMinStart = null,
                        filterMaxStart = null,
                        userIDs = [],
                        filterType,
                        filterStatus
                    } = parsed;

                    const filters = { filterMinStart, filterMaxStart, userIDs };

                    setTimeSave({ filterMinStart: startOfToday().toISOString(), filterMaxStart });
                    setSelFilter(filterType);
                    setSelectedUserIDs(userIDs);
                    setTimeFilters(filters);
                    fetchCallLogsWith(filters);
                    setFilterStatus(filterStatus)
                } catch (err) {
                    console.error("Invalid filters in localStorage", err);
                    setTimeFilters(defaultFilters);
                    fetchCallLogsWith(defaultFilters);
                }
            } else {
                setTimeFilters(defaultFilters);
                fetchCallLogsWith(defaultFilters);
            }

            fetchUsers();
        };

        fetchInitialData();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const filteredData = useMemo(() => {
        const [minMinutes, maxMinutes] = values;
        const minSeconds = minMinutes * 60;
        const maxSeconds = maxMinutes * 60;

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

            const typeCallFilterPass =
                tableFiller.typecall.length === 0 ||
                tableFiller.typecall.includes(String(call.type));

            const callTypesFilterPass =
                tableFiller.callTypes.length === 0 ||
                tableFiller.callTypes.includes(String(call.call_type));

            const durationFilterPass =
                (!minMinutes && !maxMinutes) || (
                    call.duration >= minSeconds &&
                    call.duration <= maxSeconds
                );

            const callStartTime = new Date(call.start_time).getTime();
            const filterMinTime = starttimeFill.startFromTime
                ? new Date(starttimeFill.startFromTime).getTime()
                : null;

            const filterMaxTime = starttimeFill.startToTime
                ? new Date(starttimeFill.startToTime).getTime()
                : null;

            const startTimeFilterPass =
                (!filterMinTime || callStartTime >= filterMinTime) &&
                (!filterMaxTime || callStartTime <= filterMaxTime);

            const abandonFilterPass =
                !openFilter.showAbandonedOnly || (abandoned as string[]).includes(call.other_number);

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
                durationFilterPass &&
                startTimeFilterPass &&
                typeCallFilterPass &&
                callTypesFilterPass &&
                abandonFilterPass &&
                otherFiltersPass
            );
        });
    }, [
        calllogs,
        filters,
        selectedTempUserIDs,
        tableFiller.otherNumber,
        tableFiller.otherName,
        tableFiller.agentNumber,
        tableFiller.direction,
        tableFiller.callstatus,
        tableFiller.callTypes,
        tableFiller.typecall,
        values,
        starttimeFill,
        openFilter.showAbandonedOnly
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
            filterMinStart: timesave.filterMinStart,
            filterMaxStart: timesave.filterMaxStart,
            userIDs: selectedUserIDs,
            filterType: selfilter,
            filterStatus:true
        };

        localStorage.setItem("aether_call_filters", JSON.stringify(filters));
        setFilterStatus(true)
        setTimeFilters(filters);
        fetchCallLogsWith(filters);
        setISDilterOpen(false)
    };


    const handleDurationApply = () => {
        setValues(tempValues);
        setOpenFilter(prev => ({ ...prev, durationRangeOpen: false }));
    };


    const handleResetFilters = () => {
        const defaultFilters = {
            filterType: "today",
            filterMinStart: startOfToday().toISOString(),
            filterMaxStart: null,
            userIDs: [],
            filterStatus:false
        };
        localStorage.setItem("aether_call_filters", JSON.stringify(defaultFilters));
        setRange({ from: undefined, to: undefined });
        setFilterStatus(false)
        setSelFilter("today");
        setSelectedUserIDs([]);
        setTimeSave({ filterMinStart: defaultFilters.filterMinStart, filterMaxStart: null });

        setTimeFilters(defaultFilters);
        fetchCallLogsWith(defaultFilters);
    };

    const handleStartTimeApply = () => {
        setStarttimeFill(tempStarttimeFill)
        setOpenFilter((prev) => ({ ...prev, timeFillOpen: false }))
    }

    const handleStartimeReset = () => {
        setOpenFilter(prev => ({ ...prev, timeFillOpen: false }))
        setTempStarttimeFill({
            startFromTime: undefined,
            startToTime: undefined,
        });

        setStarttimeFill({
            startFromTime: undefined,
            startToTime: undefined,
        });
    }

    const handleexportpdf = () => {
        const doc = new jsPDF();
        const columns = [
            { header: "User", dataKey: "user_id" },
            { header: "Device ID", dataKey: "device_id" },
            { header: "Duration (sec)", dataKey: "duration" },
            { header: "Timestamp", dataKey: "start_time" },
        ];

        const formattedCallLogs = filteredData.map((log) => ({
            user_id: log.user_id,
            device_id: log.device_id,
            duration: `${Math.floor(log.duration / 60)}m ${log.duration % 60}s`,
            start_time: new Date(log.start_time).toLocaleString(),
        }));
        autoTable(doc, {
            columns,
            body: formattedCallLogs,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [22, 160, 133] },
            margin: { top: 20 },
        });

        doc.save("call-logs.pdf");
    }


    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200 dark:border-stone-700">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-medium flex items-center">Call Logs</h2>
                    <div className="flex items-center gap-5">
                        <AetherTooltip label="Abandon Number">
                            <ChartPie className={`h-4 w-4 cursor-pointer ${openFilter.showAbandonedOnly ? 'text-fuchsia-500' : ''}`} onClick={() => {
                                setOpenFilter(prev => ({
                                    ...prev, showAbandonedOnly: !prev.showAbandonedOnly
                                }))
                            }} />
                        </AetherTooltip>
                        <AetherTooltip label="Refresh">
                            <RefreshCcw onClick={() => fetchCallLogsWith(timeFilters)} className={`h-4 w-4 cursor-pointer ${isLoading ? 'animate-spin' : ''}`} />
                        </AetherTooltip>
                        <DropdownMenu open={isFilterOpen} onOpenChange={setISDilterOpen}>
                            <DropdownMenuTrigger>
                                <AetherTooltip label="call Filter">
                                    <FunnelPlus className={`h-4 w-4 ${filterStatus?'text-fuchsia-500':''}`} />
                                </AetherTooltip>
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
                <div>
                    <Table className="w-full table-fixed border-collapse">
                        <TableHeader className="sticky top-0 bg-white z-10">
                            <TableRow className="text-sm font-light">
                                <TableHead className="text-xs font-semibold w-14">Sl No.</TableHead>
                                {visibleColumns.includes("other_number") && (
                                    <TableHead
                                        className="text-xs font-semibold flex items-center  relative shadow-none"
                                    >
                                        {getColHeaderLabel('other_number')?.label}
                                        <Funnel
                                            ref={filterRefs.otherNumberRef}
                                            onClick={() => setOpenFilter(prev => ({
                                                ...prev, otherNumberOpen: true
                                            }))}
                                            className={`h-3 w-4 cursor-pointer ${tableFiller.otherNumber.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
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
                                    <TableHead className="text-xs font-semibold cursor-pointer">
                                        <span className="flex items-center  gap-1">
                                            {getColHeaderLabel('other_name')?.label}
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
                                {visibleColumns.includes("call_type") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer"
                                    >
                                        <div className="flex items-center  relative">
                                            {getColHeaderLabel('call_type')?.label}
                                            <Funnel
                                                ref={filterRefs.callTypeRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, callTypeOpen: true
                                                }))}
                                                className={`h-3 w-4 ${tableFiller.callTypes.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                            />
                                            <Portal>
                                                <div className="relative">
                                                    <AetherNameMultiSelect
                                                        data={selectedFilters.callTypes.map((name) => ({ label: name, value: name }))}
                                                        selected={tableFiller.callTypes}
                                                        onChange={(selected) =>
                                                            setTableFiller((prev) => ({ ...prev, callTypes: selected }))
                                                        }
                                                        open={openFilter.callTypeOpen}
                                                        setOpen={(val) =>
                                                            setOpenFilter((prev) => ({ ...prev, callTypeOpen: val }))
                                                        }
                                                        referenceRef={filterRefs.callTypeRef}
                                                    />
                                                </div>
                                            </Portal>
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("type") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer"
                                    >
                                        <div className="flex items-center  relative">
                                            {getColHeaderLabel('type')?.label}
                                            <Funnel
                                                ref={filterRefs.typeCallRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, typeCallOpen: true
                                                }))}
                                                className={`h-3 w-4 ${tableFiller.typecall.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
                                            />
                                            <Portal>
                                                <div className="relative">
                                                    <AetherNameMultiSelect
                                                        data={selectedFilters.typecall.map((name) => ({ label: name, value: name }))}
                                                        selected={tableFiller.typecall}
                                                        onChange={(selected) =>
                                                            setTableFiller((prev) => ({ ...prev, typecall: selected }))
                                                        }
                                                        open={openFilter.typeCallOpen}
                                                        setOpen={(val) =>
                                                            setOpenFilter((prev) => ({ ...prev, typeCallOpen: val }))
                                                        }
                                                        referenceRef={filterRefs.typeCallRef}
                                                    />
                                                </div>
                                            </Portal>
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("start_time") && (
                                    <TableHead className="text-xs font-semibold cursor-pointer">
                                        <span className="flex items-center ">
                                            <span onClick={() => handleSort("start_time")} className="flex items-center gap-1">
                                                {getColHeaderLabel('start_time')?.label}
                                                {sortKey === "start_time" && (
                                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </span>
                                            <Popover
                                                open={openFilter.timeFillOpen}
                                                onOpenChange={(open) =>
                                                    setOpenFilter((prev) => ({ ...prev, timeFillOpen: open }))
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <div className="relative mx-5">
                                                        <Funnel
                                                            onClick={() =>
                                                                setOpenFilter((prev) => ({ ...prev, timeFillOpen: true }))
                                                            }
                                                            className={cn(
                                                                "h-3 w-3 cursor-pointer",
                                                                starttimeFill.startFromTime || starttimeFill.startToTime
                                                                    ? "text-fuchsia-500"
                                                                    : "text-gray-400"
                                                            )}
                                                        />
                                                    </div>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-fit flex flex-col items-end" align="end">
                                                    <div className="flex items-center">
                                                        <div className="flex flex-col items-center">
                                                            <label className="text-xs font-medium  block">Start Time From</label>
                                                            <Calendar
                                                                mode="single"
                                                                selected={tempStarttimeFill.startFromTime}
                                                                onSelect={(date) => setTempStarttimeFill((prev) => ({ ...prev, startFromTime: date }))}
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <select
                                                                    className="w-1/2 text-xs p-1 border rounded"
                                                                    value={fromHour}
                                                                    onChange={(e) => setFromHour(Number(e.target.value))}
                                                                >
                                                                    {timeOptions.slice(0, 24).map((h) => (
                                                                        <option key={h} value={h}>
                                                                            {h.toString().padStart(2, "0")} h
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    className="w-1/2 text-xs p-1 border rounded"
                                                                    value={fromMinute}
                                                                    onChange={(e) => setFromMinute(Number(e.target.value))}
                                                                >
                                                                    {timeOptions.map((m) => (
                                                                        <option key={m} value={m}>
                                                                            {m.toString().padStart(2, "0")} m
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>

                                                        {/* Start To */}
                                                        <div className="flex flex-col items-center">
                                                            <label className="text-xs font-medium block">Start Time To</label>
                                                            <Calendar
                                                                mode="single"
                                                                selected={tempStarttimeFill.startToTime}
                                                                onSelect={(date) => setTempStarttimeFill((prev) => ({ ...prev, startToTime: date }))}
                                                                autoFocus
                                                            />
                                                            <div className="flex gap-2 mt-2">
                                                                <select
                                                                    className="w-1/2 text-xs p-1 border rounded"
                                                                    value={toHour}
                                                                    onChange={(e) => setToHour(Number(e.target.value))}
                                                                >
                                                                    {timeOptions.slice(0, 24).map((h) => (
                                                                        <option key={h} value={h}>
                                                                            {h.toString().padStart(2, "0")} h
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                                <select
                                                                    className="w-1/2 text-xs p-1 border rounded"
                                                                    value={toMinute}
                                                                    onChange={(e) => setToMinute(Number(e.target.value))}
                                                                >
                                                                    {timeOptions.map((m) => (
                                                                        <option key={m} value={m}>
                                                                            {m.toString().padStart(2, "0")} m
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-2 flex-1 gap-3">
                                                        <Button size="sm"
                                                            onClick={handleStartimeReset}
                                                            className="text-xs text-black rounded-xl bg-white hover:bg-gray-200">
                                                            Cancel
                                                        </Button>
                                                        <Button onClick={handleStartTimeApply} size="sm" className="text-xs rounded-xl">
                                                            Apply
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                        </span>
                                    </TableHead>

                                )}
                                {visibleColumns.includes("duration") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer"
                                    >
                                        <span className="flex items-center  gap-1">
                                            <span onClick={() => handleSort("duration")} className="flex items-center gap-1">
                                                {getColHeaderLabel('duration')?.label}
                                                {sortKey === "duration" && (
                                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </span>

                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Funnel className="w-3 h-3 text-gray-400" />
                                                </PopoverTrigger>

                                                <PopoverContent className="w-[300px] p-4">
                                                    <div className="mb-3 text-sm text-gray-700">
                                                        <span className="text-xs">Selected: {tempValues[0]} - {tempValues[1]} minutes minutes</span>
                                                    </div>

                                                    <Range
                                                        step={1}
                                                        min={0}
                                                        max={240}
                                                        values={tempValues}
                                                        onChange={setTempValues}
                                                        renderTrack={({ props, children }) => (
                                                            <div
                                                                {...props}
                                                                className="h-2 bg-gray-200 rounded-full relative"
                                                                style={props.style}
                                                            >
                                                                <div
                                                                    className="h-2 bg-black rounded-full absolute"
                                                                    style={{
                                                                        left: `${(tempValues[0] / 240) * 100}%`,
                                                                        width: `${((tempValues[1] - tempValues[0]) / 240) * 100}%`,
                                                                    }}
                                                                />
                                                                {children}
                                                            </div>
                                                        )}
                                                        renderThumb={({ props }) => (
                                                            <div
                                                                {...props}
                                                                className="h-5 w-5 bg-black rounded-full border border-white shadow"
                                                            />
                                                        )}
                                                    />
                                                    <div className="flex items-end justify-end gap-3">
                                                        <Button
                                                            className="text-xs bg-white hover:bg-gray-200 text-black rounded-xl my-3 hover:underline cursor-pointer"
                                                            onClick={handleDurationApply}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            className="text-xs text-right rounded-xl my-3 hover:underline cursor-pointer"
                                                            onClick={handleDurationApply}
                                                        >
                                                            Apply
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>

                                        </span>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("user_id") && (
                                    <TableHead className="text-xs font-semibold">
                                        <div className="flex items-center  gap-1 relative">
                                            {getColHeaderLabel('user_id')?.label}
                                            <Funnel
                                                ref={filterRefs.funnelRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, usernameOpen: true
                                                }))}
                                                className={`h-3 w-4 cursor-pointer ${selectedTempUserIDs.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
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
                                {visibleColumns.includes("agent_number") && (
                                    <TableHead className="text-xs font-semibold cursor-pointer">
                                        <span className="flex items-center  gap-1">
                                            {getColHeaderLabel('agent_number')?.label}
                                            <Funnel
                                                ref={filterRefs.agentNumberRef}
                                                onClick={() => setOpenFilter(prev => ({
                                                    ...prev, agentNumberOpen: true
                                                }))}
                                                className={`h-3 w-4 cursor-pointer ${tableFiller.agentNumber.length > 0 ? 'text-fuchsia-500' : 'text-gray-400'}`}
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
                                {visibleColumns.includes("device_id") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer"
                                    >{getColHeaderLabel('device_id')?.label}
                                    </TableHead>
                                )}
                                {visibleColumns.includes("recording_ids") && (
                                    <TableHead className="text-xs font-semibold cursor-pointer">
                                        {getColHeaderLabel('recording_ids')?.label}
                                    </TableHead>
                                )}
                            </TableRow>
                        </TableHeader>
                    </Table>
                    {currentPageData.length === 0 && (
                        <div className="flex flex-col items-center justify-center pt-48">
                            <FolderOpen className="text-gray-500 w-10 h-10" />
                            <p className="text-center text-xs text-gray-500 py-2">No data available</p>
                        </div>
                    )}
                    <ScrollArea className="h-[370px]">
                        <Table className="w-full table-fixed border-collapse">
                            <TableBody className="text-xs">
                                {currentPageData.length !== 0 && (
                                    currentPageData.map((call, index) => (
                                        <TableRow key={call.id}>
                                            <TableCell className="text-left w-14">{index + 1}</TableCell>
                                            {visibleColumns.includes("other_number") && (
                                                <TableCell className="text-left">{call.other_number}</TableCell>
                                            )}
                                            {visibleColumns.includes("other_name") && (
                                                <TableCell className="text-left">{call.other_name === "null" ? '-' : call.other_name}</TableCell>
                                            )}
                                            {visibleColumns.includes("call_type") && (
                                                <TableCell className="text-left">{call.call_type}</TableCell>
                                            )}
                                            {visibleColumns.includes("type") && (
                                                <TableCell className="text-left">{typeMap[call.type] || call.type}</TableCell>
                                            )}
                                            {visibleColumns.includes("start_time") && (
                                                <TableCell className="text-left">{aetherFormatDate(call.start_time)}</TableCell>
                                            )}
                                            {visibleColumns.includes("duration") && (
                                                <TableCell className="text-left">{useFormattedDuration(call.duration)}</TableCell>
                                            )}
                                            {visibleColumns.includes("user_id") && (
                                                <TableCell className="text-left">{call.user_id}</TableCell>
                                            )}
                                            {visibleColumns.includes("agent_number") && (
                                                call.agent_number !== "" ? (
                                                    <TableCell className="text-left">{call.agent_number}</TableCell>
                                                ) : (
                                                    <TableCell className="text-left">{'-'}</TableCell>
                                                )
                                            )}
                                            {visibleColumns.includes("device_id") && (
                                                <TableCell className="text-left">{call.device_id}</TableCell>
                                            )}
                                            {visibleColumns.includes("recording_ids") && (
                                                <TableCell className="flex gap-1 flex-wrap items-center">
                                                    {/* Show only the first recording inline with Popover */}
                                                    {Array.isArray(call.recording_ids) &&
                                                        call.recording_ids.length > 0 &&
                                                        call.recording_ids.slice(0, 1).map((item) => (
                                                            <Popover key={item}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        onClick={() => fetchRecording(item)}
                                                                        className="bg-white hover:bg-gray-100 w-8 h-8 p-0 rounded-full flex items-center justify-center"
                                                                    >
                                                                        <CirclePlay className="w-4 h-4 text-black" />
                                                                    </Button>
                                                                </PopoverTrigger>
                                                                <PopoverContent className="w-80 mx-10">
                                                                    <div className="text-sm font-medium mb-2">Recording Info</div>
                                                                    {loadingMap[item] ? (
                                                                        <p className="text-xs text-gray-500">Loading...</p>
                                                                    ) : recordingMap[item] ? (
                                                                        <>
                                                                            <audio controls className="w-full mt-2 h-8">
                                                                                <source src={recordingMap[item]} type="audio/mpeg" />
                                                                                Your browser does not support the audio element.
                                                                            </audio>
                                                                        </>
                                                                    ) : (
                                                                        <p className="text-xs text-gray-500">No recording found.</p>
                                                                    )}
                                                                </PopoverContent>
                                                            </Popover>
                                                        ))}

                                                    {/* Dialog Trigger */}
                                                    {Array.isArray(call.recording_ids) && call.recording_ids.length > 1 && (
                                                        <Dialog open={showDialog} onOpenChange={setShowDialog}>
                                                            <DialogTrigger asChild>
                                                                <span
                                                                    onClick={() => setShowDialog(true)}
                                                                    className="text-xs flex items-center text-gray-600 cursor-pointer hover:underline"
                                                                >
                                                                    +{call.recording_ids.length - 1} more
                                                                </span>
                                                            </DialogTrigger>

                                                            <DialogContent className="max-w-md">
                                                                <DialogHeader className="text-base font-semibold mb-2">
                                                                    All Recordings
                                                                </DialogHeader>

                                                                <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
                                                                    {call.recording_ids.map((item) => (
                                                                        <div key={item} className="flex flex-col gap-1 border-b pb-2">
                                                                            <Button
                                                                                onClick={() => fetchRecording(item)}
                                                                                className="bg-gray-100 w-8 h-8 p-0 rounded-full flex items-center justify-center"
                                                                            >
                                                                                <CirclePlay className="w-4 h-4 text-black" />
                                                                            </Button>

                                                                            {loadingMap[item] ? (
                                                                                <p className="text-xs text-gray-500">Loading...</p>
                                                                            ) : recordingMap[item] ? (
                                                                                <>
                                                                                    <audio controls className="w-full h-8">
                                                                                        <source src={recordingMap[item]} type="audio/mpeg" />
                                                                                        Your browser does not support the audio element.
                                                                                    </audio>
                                                                                    <a
                                                                                        href={recordingMap[item]}
                                                                                        download={`recording-${item}.mp3`}
                                                                                        className="text-xs text-gray-800 hover:underline flex items-center gap-1"
                                                                                    >
                                                                                        Download Recording
                                                                                        <Download className="w-3 h-3" />
                                                                                    </a>
                                                                                </>
                                                                            ) : (
                                                                                <p className="text-xs text-gray-500">No recording found.</p>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </DialogContent>
                                                        </Dialog>
                                                    )}
                                                </TableCell>

                                            )}
                                        </TableRow>
                                    ))
                                )
                                }
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </div>

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
                            className="w-20 h-8 text-center shadow-none rounded-xl border border-gray-200 px-2 dark:bg-transparent"
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
                        className="shadow-none text-xs bg-white text-black hover:bg-gray-100  dark:bg-transparent dark:text-white"
                        onClick={() => {
                            const newPage = Math.max(currentPage - 1, 1);
                            setCurrentPage(newPage);
                        }}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        className="shadow-none bg-white text-black hover:bg-gray-100 text-xs dark:bg-transparent dark:text-white"
                        onClick={() => {
                            const newPage = Math.min(currentPage + 1, totalPages);
                            setCurrentPage(newPage);
                        }}
                        disabled={currentPage === totalPages}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>

            </div>
            {
                isLoading || isUserloading && (
                    <AetherLoader />
                )
            }
        </div>
    )

}