import { useCallback, useState } from "react";
import type { User } from "../types/login";
import { getUsers } from "../api/login";
import { toast } from "sonner";

export function useUsers() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);

        try {
            const data = await getUsers();
            setUsers([...data]);
        } catch (err) {
            toast.error("Unable to connect with server!");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        users,
        fetchUsers,
        isLoading,
    };
}
