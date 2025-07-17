import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Brain, Loader } from "lucide-react";
import { useInsight } from "../../hooks/useInsight";
import { InsightCard } from "./components/insightcard";
import { toast } from "sonner";

type InsightItem = {
    input_query: string;
    insights: {
        nl_answer: string;
        sql_query: string;
        results: Record<string, any>[];
    };
};

export default function InsightPage() {
    const [insighttext, setInsightText] = useState<string>("")
    const [insightList, setInsightList] = useState<InsightItem[]>([]);
    const { generateInsights, isLoading } = useInsight();

    const handleInsight = async () => {
        if (!insighttext.trim()){
            toast.warning("Please enter a valid query.");
            return
        }

        const payload = {
            model: "2.5_flash",
            question: insighttext,
        };

        const result = await generateInsights(payload); // now this returns data

        if (result) {
            const newInsight: InsightItem = {
                input_query: insighttext,
                insights: result,
            };
            setInsightList((prev) => [newInsight, ...prev]);
            setInsightText("");
        }
    };

    return (
        <div>
            <div className="p-2 bg-white h-14 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex gap-10 mb-2 items-center px-1 py-2">
                    <h2 className="text-sm font-medium flex items-center gap-2"><Brain className="h-4 text-fuchsia-500" />Insights</h2>
                    <h2 className="text-xs px-3 bg-red-50 shadow text-red-500 border border-red-500 rounded-xl">*Experimental Feature*: *This page is under development*.</h2>
                </div>
            </div>
            <div className="p-3 flex flex-col gap-4 mt-4 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <Textarea
                    value={insighttext}
                    onChange={(e) => setInsightText(e.target.value)}
                    placeholder="Enter your query..."
                    className="min-h-[50px]"
                />
                <Button className="bg-fuchsia-500 w-36 p-2 hover:bg-fuchsia-300 rounded-full" onClick={handleInsight}>
                    {isLoading ? <Loader className="animate-spin text-white" /> : 'Generate insights'}
                </Button>
            </div>
            <div>
                {insightList.map((item, index) => (
                    <InsightCard
                        key={index}
                        insighttext={item.input_query}
                        insights={item.insights}
                    />
                ))}
            </div>
        </div>
    )
}