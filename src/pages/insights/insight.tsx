import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Brain, Loader } from "lucide-react";

export default function InsightPage() {

    const [insighttext, setInsightText] = useState<string>("")
    const [insightCheck,setInsightCheck] =  useState<boolean>(false)
    const handleInsight = () => {
        setInsightCheck(true)
    }

    return (
        <div>
            <div className="p-2 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex justify-between mb-2 items-center px-1 pt-1">
                    <h2 className="text-sm font-medium flex items-center gap-2"><Brain className="h-4 text-fuchsia-500" />Insights</h2>
                </div>
            </div>
            <div className="p-3 flex flex-col gap-4 mt-4 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <Textarea
                    value={insighttext}
                    onChange={(e) => setInsightText(e.target.value)}
                    placeholder="Enter your insights here..."
                    className="min-h-[160px]"
                />
                <Button className="bg-fuchsia-500 w-24 p-2 hover:bg-fuchsia-300 rounded-full" onClick={handleInsight}>
                    {insightCheck?<Loader className="animate-spin text-white"/>:'Save Insight'}
                </Button>
            </div>
        </div>
    )
}