import { useCallback, useEffect, useMemo, useState } from "react";
import { getCalls } from "../../api/call";
import { toast } from "sonner";
import { BookCopy, ChevronsLeft, ChevronsRight, FunnelPlus } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { CallLogDetails } from "../../types/call";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Accordion } from "@radix-ui/react-accordion";
import { AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import AetherLoader from "../../shared/AetherLoader";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { getUsers } from "../../api/login";
import type { User } from "../../types/login";
import { aetherFormatDate } from "../../hooks/useFormattedDate";

const PAGE_SIZE = 10;

export default function CallDetailPage() {
    const [isPass, setIsPass] = useState(false)
    const [calllogs, setCalllogs] = useState<CallLogDetails[]>([])
    const [users, setUsers] = useState<User[]>([]);
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

    // Step 1: Filter before paginating
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

    const handleFilterChange = (field: string, value: string) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };



    return (
        <div className="p-2">
            <div className="flex justify-between mb-2 shadow p-2 items-center border-l-2 border-l-purple-500">
                <h2 className="text-sm font-normal flex items-center"><BookCopy className="h-4" />Call Logs</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-xs"><div className="flex"><FunnelPlus className="h-4 w-4" />Add Filter</div></AccordionTrigger>
                    <AccordionContent>
                        <div
                            className={`grid grid-cols-6 gap-4 transition-all duration-300 ease-in-out overflow-hidden py-3 px-2`}
                        >
                            <div className="relative w-full">
                                <Input
                                    id="skip"
                                    type="number"
                                    placeholder=" "
                                    className="peer w-full rounded-sm placeholder:text-xs outline-none border border-gray-300 bg-transparent text-sm text-black placeholder:text-transparent focus:ring-0 focus:border-0"
                                />
                                <Label
                                    htmlFor="skip"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs transition-all
                            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-xs
                            peer-placeholder-shown:text-muted-foreground
                            peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary"
                                >
                                    Skip
                                </Label>
                            </div>
                            <div className="relative w-full">
                                <Input
                                    id="limit"
                                    type="number"
                                    placeholder=" "
                                    className="peer w-full rounded-sm placeholder:text-xs outline-none border border-gray-300 bg-transparent text-sm text-black placeholder:text-transparent focus:ring-0 focus:border-0"
                                />
                                <Label
                                    htmlFor="limit"
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs transition-all
                            peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-xs
                            peer-placeholder-shown:text-muted-foreground
                            peer-focus:top-1 peer-focus:text-xs peer-focus:text-primary"
                                >
                                    Limit
                                </Label>
                            </div>
                            <div>
                                <Select>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="Select a filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="apple">Today</SelectItem>
                                        <SelectItem value="banana">This Week</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Button className="bg-white text-purple-500 hover:bg-purple-100">Submit</Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>



            <div className="shadow-md p-2">
                <Table >
                    <TableHeader>
                        <TableRow className="text-sm font-light">
                            <TableHead className="text-xs font-semibold">Sl No.</TableHead>
                            <TableHead className="text-xs font-semibold">User Nmae</TableHead>
                            <TableHead className="text-xs font-semibold">Device id</TableHead>
                            <TableHead className="text-xs font-semibold">Type</TableHead>
                            <TableHead className="text-xs font-semibold">Duration</TableHead>
                            <TableHead className="text-xs font-semibold">Start Time</TableHead>
                            <TableHead className="text-xs font-semibold">Other Number</TableHead>
                            <TableHead className="text-xs font-semibold">Other Name</TableHead>
                            <TableHead className="text-xs font-semibold">Agent Number</TableHead>
                        </TableRow>
                        <TableRow>
                            <TableHead />
                            <TableHead>
                                <Input placeholder="Search name" className="placeholder:text-xs h-6"
                                    value={filters.user_id}
                                    onChange={e => handleFilterChange("user_id", e.target.value)}
                                />
                            </TableHead>
                            <TableHead>
                                <Input placeholder="Search device" className="placeholder:text-xs h-6"
                                    value={filters.device_id}
                                    onChange={e => handleFilterChange("device_id", e.target.value)}
                                />
                            </TableHead>
                            <TableHead>
                                <Input placeholder="Search type" className="placeholder:text-xs h-6"
                                    value={filters.type}
                                    onChange={e => handleFilterChange("type", e.target.value)}
                                />
                            </TableHead>
                            <TableHead>
                                <Input placeholder="Search duration" className="placeholder:text-xs h-6"
                                    value={filters.duration}
                                    onChange={e => handleFilterChange("duration", e.target.value)}
                                />
                            </TableHead>
                            <TableHead>
                                <Input placeholder="Search time" className="placeholder:text-xs h-6"
                                    value={filters.start_time}
                                    onChange={e => handleFilterChange("start_time", e.target.value)}
                                />
                            </TableHead>
                            <TableHead>
                                <Input placeholder="Search number" className="placeholder:text-xs h-6"
                                    value={filters.other_number}
                                    onChange={e => handleFilterChange("other_number", e.target.value)}
                                />
                            </TableHead>
                            <TableHead>
                                <Input placeholder="Search name" className="placeholder:text-xs h-6"
                                    value={filters.other_name}
                                    onChange={e => handleFilterChange("other_name", e.target.value)}
                                />
                            </TableHead>
                            <TableHead>
                                <Input placeholder="Search agent" className="placeholder:text-xs h-6"
                                    value={filters.agent_number}
                                    onChange={e => handleFilterChange("agent_number", e.target.value)}
                                />
                            </TableHead>
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
                            className="w-16 text-center"
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
                        <Button className="bg-white text-xs text-black hover:bg-white" onClick={handlePageChange}>Go</Button>
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