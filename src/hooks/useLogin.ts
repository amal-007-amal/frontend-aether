import { useCallback, useState } from "react";
import { postLogin } from "../api/login";
import { toast } from "sonner";

export function useLogin() {
    const [isLoading, setIsLoading] = useState(false);
    const fetchLogin = useCallback(async (payload: any) => {
        setIsLoading(true);
        try {
            const data = await postLogin(payload);
            if (data) {
                localStorage.setItem('aether_access_token', data.access_token);
                localStorage.setItem('aether_refresh_token', data.refresh_token);
                return true
            } else {
                false
            }
        } catch (err) {
            toast.error("Unable to connect with server!");
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        fetchLogin,
        isLoading,
    };
}
