import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Brain, Loader } from "lucide-react";
import { useInsight } from "../../hooks/useInsight";

export default function InsightPage() {

    const [insighttext, setInsightText] = useState<string>("")
    const { insights, generateInsights, isLoading } = useInsight();
    const handleInsight = async () => {
        let payload = {
            "model": "2.5_flash",
            "question": insighttext
        }
        await generateInsights(payload)

    }

    return (
        <div>
            <div className="p-2 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex gap-10 mb-2 items-center px-1 py-1">
                    <h2 className="text-sm font-medium flex items-center gap-2"><Brain className="h-4 text-fuchsia-500" />Insights</h2>
                    <h2 className="text-sm text-red-500">*Experimental Feature*: *This page is under development*.</h2>
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
                {insights && (
                    <div className="mt-4 space-y-4 p-4 border rounded-md bg-white">
                        <p className="text-sm text-left">Generated sql query:&nbsp;{insighttext}</p>
                        <p className="text-sm text-left">Sql query:&nbsp;{insights.sql_query}</p>
                        <p className="text-sm text-left">Generated insights:&nbsp;{insights.nl_answer}</p>
                        <h4 className="text-md text-left">Results:</h4>
                        <div className="space-y-2 text-sm">
                            {insights.results.map((row: Record<string, any>, index: number) => (
                                <div
                                    key={index}
                                    className="border rounded p-2 flex flex-col sm:flex-row sm:justify-between"
                                >
                                    {Object.entries(row).map(([key, value]) => (
                                        <div key={key} className="flex gap-2">
                                            <span className="font-medium capitalize">{key.replace(/_/g, " ")}:</span>
                                            <span>{String(value)}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}