import { useCallback, useEffect, useMemo, useState } from "react";
import { getCalls } from "../../api/call";
import { toast } from "sonner";
import { BookCopy, ChevronsLeft, ChevronsRight, Funnel, FunnelPlus } from "lucide-react";
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

const PAGE_SIZE = 10;

export default function CallDetailPage() {
    const [isPass, setIsPass] = useState(false)
    const [calllogs, setCalllogs] = useState<CallLogDetails[]>([])
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserIDs, setSelectedUserIDs] = useState<string[]>([]);
    const [selfilter, setSelFilter] = useState<string>("");
    const [range, setRange] = useState<DateRange | undefined>();
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
    const [inputPage, setInputPage] = useState("1");

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

    // Step 2: Pagination
    const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentPageData = filteredData.slice(startIndex, startIndex + PAGE_SIZE);

    // Step 3: Handlers
    const handlePageChange = () => {
        const page = parseInt(inputPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    return (
        <div>
            <div className="flex justify-between mb-2 p-3 items-center rounded-xl border border-gray-200">
                <h2 className="text-sm font-normal flex items-center"><BookCopy className="h-4" />Call Logs</h2>
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
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="p-2 rounded-xl border border-gray-200 my-4">
                <Table className="cursor-pointer">
                    <TableHeader>
                        <TableRow className="text-sm font-light">
                            <TableHead className="text-xs font-semibold">Sl No.</TableHead>
                            <TableHead className="text-xs font-semibold">
                                <div className="flex items-center justify-between gap-1">
                                    Username
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

                            <TableHead className="text-xs font-semibold"><span className="flex items-center justify-between">Device ID<Funnel className="h-3 w-4 text-gray-400" /></span></TableHead>
                            <TableHead className="text-xs font-semibold"><span className="flex items-center justify-between">Type<Funnel className="h-3 w-4 text-gray-400" /></span></TableHead>
                            <TableHead className="text-xs font-semibold"><span className="flex items-center justify-between">Duration<Funnel className="h-3 w-4 text-gray-400" /></span> </TableHead>
                            <TableHead className="text-xs font-semibold">Start Time</TableHead>
                            <TableHead className="text-xs font-semibold"><span className="flex items-center justify-between">Other Number<Funnel className="h-3 w-4 text-gray-400" /></span></TableHead>
                            <TableHead className="text-xs font-semibold"><span className="flex items-center justify-between">Other Name<Funnel className="h-3 w-4 text-gray-400" /></span></TableHead>
                            <TableHead className="text-xs font-semibold"><span className="flex items-center justify-between">Agent Number<Funnel className="h-3 w-4 text-gray-400" /></span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {currentPageData.length !== 0 && (
                            currentPageData.map((call, index) => (
                                <TableRow key={call.id} className="text-xs">
                                    <TableCell className="text-left">{index + 1}</TableCell>
                                    <TableCell className="text-left">{call.user_id}</TableCell>
                                    <TableCell className="text-left">{call.device_id}</TableCell>
                                    <TableCell className="text-left">{call.type}</TableCell>
                                    <TableCell className="text-left">{call.duration}</TableCell>
                                    <TableCell className="text-left">{aetherFormatDate(call.start_time)}</TableCell>
                                    <TableCell className="text-left">{call.other_number}</TableCell>
                                    <TableCell className="text-left">{call.other_name}</TableCell>
                                    <TableCell className="text-left">{call.agent_number}</TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-end mt-4 gap-4 text-sm">
                    <Button
                        className="bg-white shadow-none text-xs text-black hover:bg-white"
                        onClick={() => {
                            const newPage = Math.max(currentPage - 1, 1);
                            setCurrentPage(newPage);
                            setInputPage(newPage.toString());
                        }}
                        disabled={currentPage === 1}
                    >
                        <ChevronsLeft className="h-4 w-4" />Prev
                    </Button>

                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            className="w-16 text-center shadow-none rounded-xl border border-gray-200"
                            min={1}
                            max={totalPages}
                            value={inputPage}
                            onChange={(e) => setInputPage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                    handlePageChange();
                                }
                            }}
                        />
                        <span>of {totalPages}</span>
                        <Button className="bg-white text-xs shadow-none rounded-xl border border-gray-200 text-black hover:bg-white" onClick={handlePageChange}>Go</Button>
                    </div>

                    <Button
                        className="bg-white shadow-none text-black hover:bg-white text-xs"
                        onClick={() => {
                            const newPage = Math.min(currentPage + 1, totalPages);
                            setCurrentPage(newPage);
                            setInputPage(newPage.toString());
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