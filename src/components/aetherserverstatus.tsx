import { useCallback, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { useServerSocket } from '../hooks/useServerStatus';

const AetherServerStats = ({ token }: any) => {
    const [cpu, setCpu] = useState<number | null>(null);
    const [memory, setMemory] = useState<number | null>(null);
    const [disk, setDisk] = useState<number | null>(null);

    const handleSocketData = useCallback((data: any) => {
        setCpu(data.cpu);
        setMemory(data.memory);
        setDisk(data.disk);
    }, []);

    useServerSocket(token, handleSocketData);

    return (
        <div className="p-4 border rounded-xl bg-muted/20 w-full max-w-md">
            <h2 className="text-sm font-normal flex items-center">Server Stats</h2>
            <Table>
                <TableHeader>
                    <TableRow className='text-sm font-light'>
                        <TableHead className="text-left text-xs font-semibold">Metric</TableHead>
                        <TableHead className="text-left text-xs font-semibold">Value</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow className='text-sm font-light'>
                        <TableCell className="text-left text-xs">Status</TableCell>
                        <TableCell className="text-left text-xs">{status}</TableCell>
                    </TableRow>
                    <TableRow className='text-sm font-light'>
                        <TableCell className="text-left text-xs">CPU</TableCell>
                        <TableCell className="text-left text-xs">{cpu ?? "--"}%</TableCell>
                    </TableRow>
                    <TableRow className='text-sm font-light'>
                        <TableCell className="text-left text-xs">Memory</TableCell>
                        <TableCell className="text-left text-xs">{memory ?? "--"}%</TableCell>
                    </TableRow>
                    <TableRow className='text-sm font-light'>
                        <TableCell className="text-left text-xs">Disk</TableCell>
                        <TableCell className="text-left text-xs">{disk ?? "--"}%</TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
};


export default AetherServerStats;