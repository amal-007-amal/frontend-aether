import { CirclePlay, Columns3, FileDown, FileText, FunnelPlus, RefreshCcw } from "lucide-react";
import { AetherTooltip } from "../../components/aethertooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { AetherMultiSelect } from "../../components/aethermultiselect";
import { useUsers } from "../../hooks/useUsers";
import { useEffect, useRef, useState } from "react";
import { AethercallFillTypes, type AetherFilterApiVal } from "../../types/common";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import AetherLoader from "../../shared/AetherLoader";
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


export default function CallDetailTestPage() {
    const isInitialOffsetSet = useRef(false);
    const [isFilterOpen, setISDilterOpen] = useState(false)
    const [phoneNumbers, setPhoneNumbers] = useState<string[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [activeRecordingIds, setActiveRecordingIds] = useState<string[]>([]);
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [selectedTypeVal, setSelecteTypeVal] = useState<string[]>([]);
    const [filter, setfilter] = useState<string>("today")
    const [currentOffset, setCurrentOffset] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10)
    const [rangepick, setRangePick] = useState<DateRange | undefined>(undefined);
    const [draftFilterParams, setDraftFilterParams] = useState({
        created_till: new Date().toISOString(),
        offset: 0,
        limit: 10,
        filter_user_ids: [] as string[],
        filter_min_start_datetime: "",
        filter_max_start_datetime: "",
        filter_other_numbers: [] as string[],
        only_new: false,
        only_abandoned: false,
        filter_min_start_time: "00:00:00+05:30",
        filter_max_start_time: "23:59:59.999999+05:30",
        filter_frontend_call_types: [] as string[],
        filter_min_duration: 0,
        filter_max_duration: "",
        only_last: false,
        response_format: "default",
    });
    const [filterParams, setFilterParams] = useState(draftFilterParams);
    const { users, fetchUsers, isLoading: isUserloading } = useUsers()
    const { calllogs, fetchCallLogs, total, offset, exportCallLogsFile } = useCallLogOptimized()
    const { fetchRecording, recordingMap, loadingMap, resetRecording } = useRecording();
    useEffect(() => {
        fetchUsers();
        fetchCallLogs({
            ...filterParams,
            offset: (currentOffset - 1) * limit,
            limit,
        });
    }, [filterParams, currentOffset, limit]);

    useEffect(() => {
        if (!isInitialOffsetSet.current && offset >= 0) {
            const newPage = Math.floor(offset / limit) + 1;
            setCurrentOffset(newPage);
            isInitialOffsetSet.current = true;
        }
    }, [offset, limit]);

    const [allColumns, setAllColumns] = useState([
        { key: "other_number", label: "Caller ID", active: true },
        { key: "other_name", label: "Caller Name", active: true },
        { key: "type", label: "Call Type", active: true },
        { key: "start_time", label: "Timestamp", active: true },
        { key: "duration", label: "Duration", active: true },
        { key: "user_id", label: "Agent Name", active: true },
        { key: "agent_number", label: "Agent Number", active: true },
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

    const handleNextRecording = (newId: string) => {
        fetchRecording(newId);
    };

    const handleFilterApply = () => {
        setISDilterOpen(false);
        setCurrentOffset(1);
        setFilterParams({
            ...draftFilterParams,
            created_till: new Date().toISOString(),
            filter_user_ids: selectedUserIDs,
            filter_other_numbers: phoneNumbers,
            filter_frontend_call_types: selectedTypeVal
        });
    };

    const handleResetFilters = () => {
        setfilter("today");
        setFilterParams((prev) => ({
            ...prev,
            created_till: new Date().toISOString(),
            filter_user_ids: [],
            filter_min_start_datetime: "",
            filter_max_start_datetime: "",
            only_abandoned: false,
            only_new: false,
        }));
        setCurrentOffset(1);
        fetchCallLogs({
            ...filterParams,
            created_till: new Date().toISOString(),
            filter_user_ids: [],
            filter_min_start_datetime: "",
            filter_max_start_datetime: "",
            only_abandoned: false,
            only_new: false,
            offset: 0,
            limit,
        });
    };

    const handleExportClick = (type: "pdf" | "csv") => {
        exportCallLogsFile(draftFilterParams, type);
    };


    const handleFilterChange = (value: AetherFilterApiVal) => {
        setfilter(value);
        const now = new Date();
        const end = now.toISOString();
        let start: string | null = null;

        switch (value) {
            case 'today': {
                const startOfToday = new Date(now);
                startOfToday.setHours(0, 0, 0, 0);
                start = startOfToday.toISOString();
                break;
            }
            case 'past_24_hours': {
                const past24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                start = past24.toISOString();
                break;
            }
            case 'yesterday': {
                const yesterdayStart = new Date(now);
                yesterdayStart.setDate(yesterdayStart.getDate() - 1);
                yesterdayStart.setHours(0, 0, 0, 0);
                const yesterdayEnd = new Date(yesterdayStart);
                yesterdayEnd.setHours(23, 59, 59, 999);
                setDraftFilterParams((prev) => ({
                    ...prev,
                    filter_min_start_datetime: yesterdayStart.toISOString(),
                    filter_max_start_datetime: yesterdayEnd.toISOString(),
                }));
                return;
            }
            case 'this_week': {
                const today = new Date();
                const day = today.getDay();
                const sunday = new Date(today);
                sunday.setDate(today.getDate() - day);
                sunday.setHours(0, 0, 0, 0);
                start = sunday.toISOString();
                break;
            }
            case 'past_7_days': {
                const past7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                start = past7.toISOString();
                break;
            }
            case 'this_month': {
                const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                start = monthStart.toISOString();
                break;
            }
            case 'last_30_days': {
                const past30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                start = past30.toISOString();
                break;
            }
            case 'custom': {
                setDraftFilterParams((prev) => ({
                    ...prev,
                    filter_min_start_datetime: rangepick?.from?.toISOString() || "",
                    filter_max_start_datetime: rangepick?.to?.toISOString() || "",
                }));
                return;
            }
        }

        setDraftFilterParams((prev) => ({
            ...prev,
            filter_min_start_datetime: start ?? "",
            filter_max_start_datetime: end,
        }));
    };


    return (
        <div>
            <div className="p-2 rounded-xl border border-gray-200 dark:border-stone-700">
                <div className="flex justify-between mb-2 items-center py-1 px-1">
                    <h2 className="text-sm font-medium flex items-center">Call Logs</h2>
                    <div className="flex items-center gap-5">
                        <AetherTooltip label="Refresh">
                            <RefreshCcw onClick={() => handleResetFilters()} className={`h-4 w-4 cursor-pointer`} />
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
                                    {filter === "custom" && (
                                        <div className="flex items-center justify-center my-3 w-full">
                                            <Calendar
                                                mode="range"
                                                selected={rangepick}
                                                onSelect={(range) => {
                                                    setRangePick(range);
                                                }}
                                                numberOfMonths={1}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div onClick={(e) => e.stopPropagation()} className="w-full">
                                    <AetherMultiSelect
                                        data={users.map((user) => ({ label: user.name, value: user.id }))}
                                        selected={selectedUserIDs}
                                        onChange={setSelectedUserIDs}
                                    />
                                </div>
                                <div onClick={(e) => e.stopPropagation()} className="w-full">
                                    <AetherMultiSelect
                                        placeholder="call type"
                                        data={AethercallFillTypes.map((type) => ({ label: type, value: type }))}
                                        selected={selectedTypeVal}
                                        onChange={setSelecteTypeVal}
                                    />
                                </div>
                                <div>
                                    <AetherAdderMultiSelect selected={phoneNumbers} onChange={setPhoneNumbers} />
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
                        <AetherTooltip label="Export as Pdf">
                            <FileDown onClick={() => { handleExportClick('pdf') }} className={`h-4 w-4 cursor-pointer`} />
                        </AetherTooltip>
                        <AetherTooltip label="Export as Csv">
                            <FileText onClick={() => { handleExportClick('csv') }} className={`h-4 w-4 cursor-pointer`} />
                        </AetherTooltip>
                    </div>
                </div>
                <div>
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
                                                                        <div key={item} className="flex flex gap-1 border-b pb-2 p-2">
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
            {isUserloading && (<AetherLoader />)}
        </div>
    )
}