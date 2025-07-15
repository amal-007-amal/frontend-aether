import { CirclePlay, Columns3, FunnelPlus, LoaderCircle, RefreshCcw } from "lucide-react";
import { AetherTooltip } from "../../components/aethertooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AetherMultiSelect } from "../../components/aethermultiselect";
import { useUsers } from "../../hooks/useUsers";
import { useEffect, useRef, useState } from "react";
import { AethercallFillTypes, type AetherFilterApiVal } from "../../types/common";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { useCallLogOptimized } from "../../hooks/useCalllogOptimized";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import { aetherFormatDate } from "../../hooks/useFormattedDate";
import { useFormattedDuration } from "../../hooks/useDurationFormat";
import { Calendar } from "../../components/ui/calendar";
import type { DateRange } from "react-day-picker";
import { AetherPagination } from "../../components/aetherpagination";
import { typeCompressMap } from "../../types/callnamemap";
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "../../components/ui/dialog";
import { useRecording } from "../../hooks/useRecording";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { AetherAdderMultiSelect } from "../../components/aetheraddermultiselect";
import { AccordionContent, AccordionItem, AccordionTrigger, Accordion } from "../../components/ui/accordion";
import { AetherTimePicker } from "../../components/aethertimepicker";
import { useCallFilterManager } from "../../hooks/useFilterManager";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf,faFileCsv } from "@fortawesome/free-solid-svg-icons";

export default function CallDetailTestPage() {
    const isInitialOffsetSet = useRef(false);
    const [isFilterOpen, setISDilterOpen] = useState(false);
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [min, setMin] = useState<number | ''>(0);
    const [max, setMax] = useState<number | ''>('');
    const [minTime, setMinTime] = useState({ h: "00", m: "00", s: "00" });
    const [maxTime, setMaxTime] = useState({ h: "23", m: "59", s: "59" });
    const [onlylast, setOnlyLast] = useState(false);
    const [onlynew, setOnlyNew] = useState(false);
    const [onlyaban, setOnlyAbandon] = useState(false);
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [selectedTypeVal, setSelecteTypeVal] = useState<string[]>([]);
    const [filterType, setfilterType] = useState<string>("today");
    const [activeRecordingIds, setActiveRecordingIds] = useState<string[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [rangepick, setRangePick] = useState<DateRange | undefined>(undefined);

    const {
        filterParams,
        currentOffset,
        setCurrentOffset,
        limit,
        setLimit,
        handleFilterApply,
        handleFilterChange,
    } = useCallFilterManager({ rangepick });

    const { users, fetchUsers } = useUsers();
    const {
        calllogs,
        fetchCallLogs,
        total,
        offset,
        exportCallLogsFile,
        isLoading,
    } = useCallLogOptimized();
    const { fetchRecording, recordingMap, loadingMap, resetRecording } = useRecording();

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        fetchCallLogs(filterParams);
    }, [filterParams]);

    useEffect(() => {
        if (!isInitialOffsetSet.current && offset >= 0) {
            const newPage = Math.floor(offset / limit) + 1;
            setCurrentOffset(newPage);
            isInitialOffsetSet.current = true;
        }
    }, [offset, limit]);

    useEffect(() => {
        const saved = localStorage.getItem("aether_common_filter");
        if (saved) {
            try {
                const parsed = JSON.parse(saved);

                // Restore individual states
                setPhoneNumbers(parsed.filter_other_numbers || []);
                setMin(parsed.min ?? "");
                setMax(parsed.max ?? "");
                setMinTime(parsed.minTime || { h: "00", m: "00", s: "00" });
                setMaxTime(parsed.maxTime || { h: "23", m: "59", s: "59" });
                setSelectedUserIDs(parsed.filter_user_ids || []);
                setSelecteTypeVal(parsed.filter_frontend_call_types || []);
                setOnlyNew(parsed.only_new || false);
                setOnlyAbandon(parsed.only_abandoned || false);
                setOnlyLast(parsed.only_last || false);
                setfilterType(parsed.filterType || "today");

                if (parsed.filterType === "custom" && parsed.rangepick) {
                    setRangePick(parsed.rangepick);
                }

                // Apply restored filters
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
                    filterType: parsed.filterType || "today",
                });
            } catch (err) {
                console.error("Invalid aether_common_filter in localStorage", err);
            }
        }
    }, []);


    const [allColumns, setAllColumns] = useState([
        { key: "other_number", label: "Caller ID", active: true },
        { key: "other_name", label: "Caller Name", active: true },
        { key: "type", label: "Call Type", active: true },
        { key: "start_time", label: "Timestamp", active: true },
        { key: "duration", label: "Duration", active: true },
        { key: "user_id", label: "Agent Name", active: true },
        { key: "agent_number", label: "Agent Number", active: true },
        { key: "recording_ids", label: "Recordings", active: true },
    ]);

    const getColHeaderLabel = (key: string) => {
        return allColumns.find((item) => item.key === key);
    };

    const [visibleColumns, setVisibleColumns] = useState<string[]>(
        allColumns.filter((col) => col.active).map((col) => col.key)
    );

    const toggleColumn = (key: string) => {
        setVisibleColumns((prev) =>
            prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
        );
        setAllColumns((prev) =>
            prev.map((col) =>
                col.key === key ? { ...col, active: !col.active } : col
            )
        );
    };

    const handleResetTime = () => {
        setMinTime({ h: "00", m: "00", s: "00" });
        setMaxTime({ h: "23", m: "59", s: "59" });
    }

    const handleResetDuration = () => {
        setMin(0);
        setMax('');
    }

    const handleCallType = () => {
        setSelecteTypeVal([])
    }
    const handleCallerID = () => {
        setPhoneNumbers([])
        setOnlyNew(false)
        setOnlyAbandon(false)
    }
    const handleAgents = () => {
        setSelectedUserIDs([])
    }

    const handleGroupRows = () => {
        setOnlyLast(false)
    }

    const handlCommonReset = () => {
        setfilterType('today')
        handleFilterChange('today')
        handleAgents()
        handleCallType()
        handleCallerID()
        handleGroupRows()
        handleResetDuration()
        handleResetTime()
    }

    const handleNextRecording = (newId: string) => {
        fetchRecording(newId);
    };

    const handleExportClick = (type: "pdf" | "csv") => {
        exportCallLogsFile(filterParams, type);
        toast.info('The request file will be downloaded shortly')
    };

    return (
        <div>
            <div className="p-2 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-medium flex items-center">Call Logs</h2>
                    <div className="flex items-center gap-5">
                        <AetherTooltip label="Refresh">
                            <RefreshCcw className={`h-4 w-4 cursor-pointer`} />
                        </AetherTooltip>
                        <DropdownMenu open={isFilterOpen} onOpenChange={setISDilterOpen}>
                            <DropdownMenuTrigger>
                                <AetherTooltip label="Call Filter">
                                    <FunnelPlus className={`h-4 w-4 text-fuchsia-500`} />
                                </AetherTooltip>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="space-y-2 p-3 me-10">
                                <Accordion type="multiple" className="w-[300px]">
                                    <AccordionItem value="date-filter">
                                        <AccordionTrigger className="text-xs flex">
                                            <span className={`${filterType ? 'text-fuchsia-500' : ''} `}>
                                                Date Range
                                            </span>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-1">
                                            <div onClick={(e) => e.stopPropagation()} className="pt-1">
                                                <Select value={filterType} onValueChange={(val: AetherFilterApiVal) => {
                                                    setfilterType(val);
                                                    handleFilterChange(val);
                                                }}>
                                                    <SelectTrigger className="w-full text-xs shadow-none">
                                                        <SelectValue placeholder="Select a filter" />
                                                    </SelectTrigger>
                                                    <SelectContent className="text-xs">
                                                        <SelectItem className="text-xs" value="today">Today</SelectItem>
                                                        <SelectItem className="text-xs" value="past_24_hours">Past 24 hrs</SelectItem>
                                                        <SelectItem className="text-xs" value="yesterday">Yesterday</SelectItem>
                                                        <SelectItem className="text-xs" value="this_week">This Week</SelectItem>
                                                        <SelectItem className="text-xs" value="past_7_days">Past 7 days</SelectItem>
                                                        <SelectItem className="text-xs" value="this_month">This Month</SelectItem>
                                                        <SelectItem className="text-xs" value="last_30_days">Last 30 days</SelectItem>
                                                        <SelectItem className="text-xs" value="custom">Custom</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                {filterType === "custom" && (
                                                    <div className="flex items-center justify-center my-3 w-full">
                                                        <Calendar
                                                            mode="range"
                                                            selected={rangepick}
                                                            onSelect={(range) => setRangePick(range)}
                                                            numberOfMonths={1}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="user-filter">
                                        <AccordionTrigger className="text-xs">
                                            <span className={`${selectedUserIDs.length > 0 ? 'text-fuchsia-500' : ''} `}>Agent</span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div onClick={(e) => e.stopPropagation()} className="w-full">
                                                <AetherMultiSelect
                                                    placeholder="Filter by agents"
                                                    data={users.map((user) => ({ label: user.name, value: user.id }))}
                                                    selected={selectedUserIDs}
                                                    onChange={setSelectedUserIDs}
                                                />
                                            </div>
                                            <span onClick={handleAgents} className="cursor-pointer underline px-3 text-xs flex items-end justify-end pt-2">Reset</span>

                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="numbers">
                                        <AccordionTrigger className="text-xs">
                                            <span className={`${phoneNumbers.length > 0 ? 'text-fuchsia-500' : ''} `}>Caller ID</span>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div>
                                                <AetherAdderMultiSelect placeholder="Filter by caller IDs" selected={phoneNumbers} onChange={setPhoneNumbers} />
                                                <div className="flex gap-5 px-1 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="check1"
                                                            checked={onlynew}
                                                            onCheckedChange={(val) => {
                                                                if (typeof val === "boolean") setOnlyNew(val);
                                                            }}
                                                        />
                                                        <label htmlFor="check1" className="text-xs">
                                                            Only New
                                                        </label>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox
                                                            id="check2"
                                                            checked={onlyaban}
                                                            onCheckedChange={(val) => {
                                                                if (typeof val === "boolean") setOnlyAbandon(val);
                                                            }}
                                                        />
                                                        <label htmlFor="check2" className="text-xs">
                                                            Only Abandoned
                                                        </label>
                                                    </div>
                                                </div>
                                                <span onClick={handleCallerID} className="cursor-pointer underline px-3 text-xs flex items-end justify-end pt-2">Reset</span>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="call-type">
                                        <AccordionTrigger className="text-xs">Call Type</AccordionTrigger>
                                        <AccordionContent>
                                            <div onClick={(e) => e.stopPropagation()} className="w-full">
                                                <AetherMultiSelect
                                                    placeholder="Filter by call types"
                                                    data={AethercallFillTypes.map((type) => ({ label: type, value: type }))}
                                                    selected={selectedTypeVal}
                                                    onChange={setSelecteTypeVal}
                                                />
                                            </div>
                                            <span onClick={handleCallType} className="cursor-pointer underline px-3 text-xs flex items-end justify-end pt-2">Reset</span>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="durations">
                                        <AccordionTrigger className="text-xs">Duration</AccordionTrigger>
                                        <AccordionContent className="px-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <Label className="block text-xs mb-1 font-normal">Minimum (minutes)</Label>
                                                    <Input
                                                        type="number"
                                                        value={min}
                                                        onChange={(e) => setMin(e.target.value === '' ? '' : Number(e.target.value))}
                                                        className="w-full h-8 px-2 py-1 border rounded text-xs placeholder:text-xs"
                                                        placeholder="Min"
                                                    />
                                                </div>
                                                <div>
                                                    <Label className="block text-xs mb-1 font-normal">Maximum (minutes)</Label>
                                                    <Input
                                                        type="number"
                                                        value={max}
                                                        onChange={(e) => setMax(e.target.value === '' ? '' : Number(e.target.value))}
                                                        className="w-full  h-8 px-2 py-1 border rounded text-xs placeholder:text-xs"
                                                        placeholder="Max"
                                                    />
                                                </div>
                                            </div>
                                            <span onClick={handleResetDuration} className="cursor-pointer underline px-3 text-xs flex items-end justify-end pt-2">Reset</span>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="time-picker">
                                        <AccordionTrigger className="text-xs">Time Range</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex flex-col px-2 gap-2">
                                                <AetherTimePicker label="From Time" value={minTime} onChange={setMinTime} />
                                                <AetherTimePicker label="Till Time" value={maxTime} onChange={setMaxTime} />
                                            </div>
                                            <span onClick={handleResetTime} className="cursor-pointer underline px-3 text-xs flex items-end justify-end pt-2">Reset</span>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="group-row">
                                        <AccordionTrigger className="text-xs">Group Rows</AccordionTrigger>
                                        <AccordionContent>
                                            <div className="flex items-center gap-2">
                                                <Checkbox
                                                    id="check3"
                                                    checked={onlylast}
                                                    onCheckedChange={(val) => {
                                                        if (typeof val === "boolean") setOnlyLast(val);
                                                    }}
                                                />
                                                <label htmlFor="check3" className="text-xs">
                                                    By Caller ID (last call only)
                                                </label>
                                            </div>
                                            <span onClick={handleGroupRows} className="cursor-pointer underline px-3 text-xs flex items-end justify-end pt-2">Reset</span>
                                        </AccordionContent>
                                    </AccordionItem>
                                    <div className="flex justify-between gap-4 mt-3">
                                        <div>
                                            <Button
                                                className="bg-white text-black text-xs rounded-xl hover:bg-gray-500"
                                                onClick={() => { setISDilterOpen(false) }}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                        <div className="flex gap-3">
                                            <Button
                                                className="bg-white text-black text-xs rounded-xl hover:bg-gray-500"
                                                onClick={handlCommonReset}
                                            >
                                                Reset
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    handleFilterApply({
                                                        selectedUserIDs,
                                                        phoneNumbers,
                                                        selectedTypeVal,
                                                        min,
                                                        max,
                                                        onlylast,
                                                        onlyaban,
                                                        onlynew,
                                                        minTime,
                                                        maxTime,
                                                        filterType
                                                    });
                                                    setISDilterOpen(false);
                                                }
                                                }
                                                className="bg-fuchsia-500 text-white text-xs rounded-xl hover:bg-fuchsia-300"
                                            >
                                                Apply
                                            </Button>
                                        </div>
                                    </div>
                                </Accordion>
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
                        <div className="flex">
                               <AetherTooltip label="Export PDF">
                            <span className="flex items-center cursor-pointer" onClick={() => handleExportClick('pdf')}>
                                <Button variant="ghost" size="icon" className="p-0 m-0">
                                    <FontAwesomeIcon icon={faFilePdf} />
                                </Button>
                            </span>
                        </AetherTooltip>
                        <AetherTooltip label="Export CSV">
                            <span className="flex items-center cursor-pointer" onClick={() => handleExportClick('csv')}>
                                <Button variant="ghost" size="icon" className="p-0 m-0">
                                    <FontAwesomeIcon icon={faFileCsv} />
                                </Button>
                            </span>
                        </AetherTooltip>
                        </div>
                    </div>
                </div>
                <div>
                    {isLoading && (
                        <div className="flex inset-0 dark:bg-transparent bg-gray-100 bg-opacity-10 items-center justify-center text-xs absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                            Loading...
                            <LoaderCircle className="animate-spin w-5 h-5 text-purple-500 ml-2" />
                        </div>
                    )}
                    <Table className="w-full table-fixed border-collapse">
                        <TableHeader className="sticky top-0 z-10">
                            <TableRow className="text-sm font-light">
                                <TableHead className="text-xs font-semibold w-14">Sl No.</TableHead>
                                {visibleColumns.includes("other_number") && (
                                    <TableHead
                                        className="text-xs font-semibold"
                                    >
                                        {getColHeaderLabel('other_number')?.label}
                                    </TableHead>
                                )}
                                {visibleColumns.includes("other_name") && (
                                    <TableHead className="text-xs font-semibold cursor-pointer">
                                        {getColHeaderLabel('other_name')?.label}
                                    </TableHead>
                                )}
                                {visibleColumns.includes("type") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer"
                                    >
                                        {getColHeaderLabel('type')?.label}
                                    </TableHead>
                                )}
                                {visibleColumns.includes("start_time") && (
                                    <TableHead className="text-xs font-semibold cursor-pointer">
                                        {getColHeaderLabel('start_time')?.label}
                                    </TableHead>
                                )}
                                {visibleColumns.includes("duration") && (
                                    <TableHead
                                        className="text-xs font-semibold cursor-pointer"
                                    >
                                        {getColHeaderLabel('duration')?.label}
                                    </TableHead>
                                )}
                                {visibleColumns.includes("user_id") && (
                                    <TableHead className="text-xs font-semibold">
                                        <div className="flex items-center  gap-1 relative">
                                            {getColHeaderLabel('user_id')?.label}
                                        </div>
                                    </TableHead>
                                )}
                                {visibleColumns.includes("agent_number") && (
                                    <TableHead className="text-xs font-semibold cursor-pointer">
                                        <span className="flex items-center  gap-1">
                                            {getColHeaderLabel('agent_number')?.label}
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
                    <ScrollArea className="h-[370px]">
                        <Table className="w-full table-fixed border-collapse">
                            <TableBody className="text-xs">
                                {calllogs.length !== 0 && (
                                    calllogs.map((call, index) => (
                                        <TableRow key={call.id}>
                                            <TableCell className="text-left w-14">{(index + 1) + offset}</TableCell>
                                            {visibleColumns.includes("other_number") && (
                                                <TableCell className="text-left">{call.other_number}</TableCell>
                                            )}
                                            {visibleColumns.includes("other_name") && (
                                                <TableCell className="text-left">{call.other_name === "null" ? '-' : call.other_name}</TableCell>
                                            )}
                                            {visibleColumns.includes("type") && (
                                                <TableCell className="text-left">{typeCompressMap[call.type] || call.type}</TableCell>
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
                                                    {Array.isArray(call.recording_ids) &&
                                                        call.recording_ids.length > 0 &&
                                                        call.recording_ids.slice(0, 1).map((item) => (
                                                            <Popover key={item}>
                                                                <PopoverTrigger asChild>
                                                                    <Button
                                                                        onClick={() => { handleNextRecording(item) }}
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
                                                                                <source src={recordingMap[item]?.replace(/\.mp3$/, ".m4a")} type="audio/mp4" />
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
                                                    {Array.isArray(call.recording_ids) && call.recording_ids.length > 1 && (
                                                        <Dialog open={showDialog} onOpenChange={setShowDialog}>
                                                            <DialogTrigger asChild>
                                                                <span
                                                                    onClick={() => {
                                                                        setActiveRecordingIds(call.recording_ids);
                                                                        setShowDialog(true);
                                                                        resetRecording();
                                                                    }}
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
                                                                    {activeRecordingIds.map((item) => (
                                                                        <div key={item} className="flex gap-1 border-b pb-2 p-2">
                                                                            <Button
                                                                                onClick={() => { handleNextRecording(item) }}
                                                                                className="bg-gray-100 hover:bg-gray-200 w-8 h-8 p-0 rounded-full flex items-center justify-center"
                                                                            >
                                                                                <CirclePlay className="w-4 h-4 text-black" />
                                                                            </Button>
                                                                            {loadingMap[item] ? (
                                                                                <p className="text-xs text-gray-500">Loading...</p>
                                                                            ) : recordingMap[item] ? (
                                                                                <>
                                                                                    <audio controls className="w-full h-8">
                                                                                        <source src={recordingMap[item]?.replace(/\.mp3$/, ".m4a")} type="audio/mp4" />
                                                                                        <source src={recordingMap[item]} type="audio/mpeg" />
                                                                                        Your browser does not support the audio element.
                                                                                    </audio>
                                                                                </>
                                                                            ) : (
                                                                                <p className="text-xs text-gray-500"></p>
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
                <AetherPagination
                    currentOffset={currentOffset}
                    total={total}
                    limit={limit}
                    setLimit={setLimit}
                    setCurrentOffset={setCurrentOffset}
                />
            </div>
        </div>
    )
}