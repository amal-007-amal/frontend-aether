import { useCallback, useEffect, useState } from "react";
import { getCalls } from "../../api/call";
import { toast } from "sonner";
import { BookCopy, ChevronsLeft, ChevronsRight, Loader } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { CallLogDetails } from "../../types/call";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const PAGE_SIZE = 10;

export default function CallDetailPage() {
    const [isPass, setIsPass] = useState(false)
    const [calllogs, setCalllogs] = useState<CallLogDetails[]>([])

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

    useEffect(() => {
        fetchCallLogs();
    }, [fetchCallLogs]);

    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState("1");

    const totalPages = Math.max(1, Math.ceil(calllogs.length / PAGE_SIZE));
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    const currentData = calllogs.slice(startIndex, startIndex + PAGE_SIZE);

    const handlePageChange = () => {
        const page = parseInt(inputPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };


    return (
        <div className="p-2">
            <div className="flex justify-between mb-2 shadow p-2 items-center border-l-2 border-l-purple-500">
                <h2 className="text-sm font-normal flex items-center"><BookCopy className="h-4"/>Call Logs</h2>
            </div>
            <div className="shadow">
                <div className="flex items-center justify-between p-2">
                    <div className="grid grid-cols-3 gap-4">
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
                    </div>
                </div>
            </div>
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
                    </TableHeader>
                    <TableBody>
                        {currentData.length !== 0 && (
                            currentData.map((call, index) => (
                                <TableRow key={call.id} className="text-xs">
                                    <TableCell className="text-left">{index + 1}</TableCell>
                                    <TableCell className="text-left">{call.user_id}</TableCell>
                                    <TableCell className="text-left">{call.device_id}</TableCell>
                                    <TableCell className="text-left">{call.type}</TableCell>
                                    <TableCell className="text-left">{call.duration}</TableCell>
                                    <TableCell className="text-left">{call.start_time}</TableCell>
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
                <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
                    <Loader className="animate-spin w-6 h-6 text-purple-500" />
                </div>
            )}
        </div>
    )

}