import { useCallback, useEffect, useState } from "react";
import { getCalls } from "../../api/call";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../components/ui/table";
import type { CallLogDetails } from "../../types/call";

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


    return (
        <div className="p-2">
            <div className="flex justify-between mb-4 shadow p-2 items-center border-l-2 border-l-black">
                <h2 className="text-sm font-normal">Call Logs</h2>
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
                        {calllogs.length !== 0 && (
                            calllogs.map((call, index) => (
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
            </div>
            {isPass && (
                <div className="fixed inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center z-50">
                    <Loader className="animate-spin w-6 h-6 text-purple-500" />
                </div>
            )}
        </div>
    )

}