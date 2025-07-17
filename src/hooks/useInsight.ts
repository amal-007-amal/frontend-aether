import { useCallback, useState } from "react";
import { toast } from "sonner";
import { createInsights } from "../api/insight";

export function useInsight() {
    const [insights, setInsights] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    const generateInsights = useCallback(async (payload: any) => {
        setIsLoading(true);
        try {
            const data = await createInsights(payload);
            setInsights(data); 
            return data;
        } catch (err) {
            toast.error("Unable to connect with server!");
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        insights,
        generateInsights,
        isLoading,
    };
}
