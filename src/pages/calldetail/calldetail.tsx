import { useCallback, useEffect, useMemo, useState } from "react";
import { getCalls } from "../../api/call";
import { toast } from "sonner";
import { ChevronDown, ChevronsLeft, ChevronsRight, ChevronUp, Funnel, FunnelPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { CallLogDetails } from "../../types/call";
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


export default function CallDetailPage() {
    const [isPass, setIsPass] = useState(false)
    const [calllogs, setCalllogs] = useState<CallLogDetails[]>([])
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [selfilter, setSelFilter] = useState<string>("");
    const [range, setRange] = useState<DateRange | undefined>();
    const [pageSize, setPageSize] = useState(10);
    const [sortKey, setSortKey] = useState<string>('start_time');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
    const [filters, setFilters] = useState({
        user_id: "",
        device_id: "",
        type: "",
        duration: "",
        start_time: "",
        other_number: "",
        other_name: "",
        agent_number: ""
    });
    const allColumns = [
        { key: "user_id", label: "Username" },
        { key: "device_id", label: "Device ID" },
        { key: "type", label: "Type" },
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
    console.log(setFilters);
    const fetchCallLogs = useCallback(async () => {
        setIsPass(true);
        try {
            const data = await getCalls();
            setCalllogs([...data]);
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
        return calllogs.filter(call => {
            return Object.entries(filters).every(([key, value]) => {
                if (!value) return true;
                const field = String((call as any)[key] ?? "").toLowerCase();
                return field.includes(value.toLowerCase());
            });
        });
    }, [filters, calllogs]);

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
                <Table className="cursor-pointer max-h-64 overflow-y-auto border-t">
                    <TableHeader>
                        <TableRow className="text-sm font-light">
                            <TableHead className="text-xs font-semibold">Sl No.</TableHead>
                            {visibleColumns.includes("user_id") && (
                                <TableHead onClick={() => handleSort("user_id")} className="text-xs font-semibold">
                                    <div className="flex items-center justify-between gap-1">
                                        <span className="flex items-center justify-between gap-1">
                                            <span className="flex items-center gap-1">
                                                Username
                                                {sortKey === "user_id" && (
                                                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                                )}
                                            </span>
                                        </span>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1 rounded hover:bg-gray-100">
                                                    <Funnel className="h-3 w-4 text-gray-400" />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent align="end" className="w-full">
                                                <div onClick={(e) => e.stopPropagation()}>
                                                    <AetherMultiSelect
                                                        data={users.map((user) => ({ label: user.name, value: user.id }))}
                                                        selected={selectedUserIDs}
                                                        onChange={setSelectedUserIDs}
                                                    />
                                                </div>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </TableHead>
                            )}
                            {visibleColumns.includes("device_id") && (
                                <TableHead
                                    onClick={() => handleSort("device_id")}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    <span className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            Device ID
                                            {sortKey === "device_id" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Funnel className="h-3 w-4 text-gray-400" />
                                    </span>
                                </TableHead>
                            )}
                            {visibleColumns.includes("type") && (
                                <TableHead
                                    onClick={() => handleSort("type")}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    <span className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            Type
                                            {sortKey === "type" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Funnel className="h-3 w-4 text-gray-400" />
                                    </span>
                                </TableHead>
                            )}
                            {visibleColumns.includes("duration") && (
                                <TableHead
                                    onClick={() => handleSort("duration")}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    <span className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            Duration
                                            {sortKey === "duration" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Funnel className="h-3 w-4 text-gray-400" />
                                    </span>
                                </TableHead>
                            )}
                            {visibleColumns.includes("start_time") && (
                                <TableHead
                                    onClick={() => handleSort("duration")}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    <span className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            Start Time
                                            {sortKey === "start_time" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Funnel className="h-3 w-4 text-gray-400" />
                                    </span>
                                </TableHead>
                            )}
                            {visibleColumns.includes("other_number") && (
                                <TableHead
                                    onClick={() => handleSort("other_number")}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    <span className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            Other Number
                                            {sortKey === "other_number" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Funnel className="h-3 w-4 text-gray-400" />
                                    </span>
                                </TableHead>
                            )}
                            {visibleColumns.includes("other_name") && (
                                <TableHead
                                    onClick={() => handleSort("other_name")}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    <span className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            Other Name
                                            {sortKey === "other_name" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Funnel className="h-3 w-4 text-gray-400" />
                                    </span>
                                </TableHead>
                            )}
                            {visibleColumns.includes("agent_number") && (
                                <TableHead
                                    onClick={() => handleSort("agent_number")}
                                    className="text-xs font-semibold cursor-pointer"
                                >
                                    <span className="flex items-center justify-between gap-1">
                                        <span className="flex items-center gap-1">
                                            Agent Number
                                            {sortKey === "agent_number" && (
                                                sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                                            )}
                                        </span>
                                        <Funnel className="h-3 w-4 text-gray-400" />
                                    </span>
                                </TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                        {currentPageData.length !== 0 &&
                            currentPageData.map((call, index) => (
                                <TableRow key={call.id}>
                                    <TableCell className="text-left">{index + 1}</TableCell>
                                    {visibleColumns.includes("user_id") && (
                                        <TableCell className="text-left">{call.user_id}</TableCell>
                                    )}
                                    {visibleColumns.includes("device_id") && (
                                        <TableCell className="text-left">{call.device_id}</TableCell>
                                    )}
                                    {visibleColumns.includes("type") && (
                                        <TableCell className="text-left">{call.type}</TableCell>
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
                                        <TableCell className="text-left">{call.other_name}</TableCell>
                                    )}
                                    {visibleColumns.includes("agent_number") && (
                                        <TableCell className="text-left">{call.agent_number}</TableCell>
                                    )}
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>

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
                                    setCurrentPage(1); // reset to first page when size changes
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