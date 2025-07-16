import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { Brain, Loader } from "lucide-react";
import { useInsight } from "../../hooks/useInsight";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";

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
                    <div className="mt-4 space-y-4 p-4 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                        <div className="text-sm flex items-center border-b py-2 gap-3">
                            <p className="font-medium whitespace-nowrap">Input Query:</p>
                            <p className="text-muted-foreground">{insighttext}</p>
                        </div>
                        <div className="text-sm flex items-center gap-3 border-b py-2">
                            <p className="font-medium whitespace-nowrap">Generated SQL Query:</p>
                            <p className="text-muted-foreground break-all">{insights.sql_query}</p>
                        </div>
                        <div className="text-sm flex items-center gap-3 border-b py-2">
                            <p className="font-medium whitespace-nowrap">SQL Output</p>
                            <p className="text-muted-foreground break-all">{insights.sql_query}</p>
                        </div>
                        <div className="space-y-2 px-9 text-sm">
                            {insights.results.length > 0 && (
                                <div className="mt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                {Object.keys(insights.results[0]).map((key) => (
                                                    <TableHead key={key} className="capitalize">
                                                        {key.replace(/_/g, " ")}
                                                    </TableHead>
                                                ))}
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {insights.results.map((row: any, rowIndex: any) => (
                                                <TableRow key={rowIndex}>
                                                    {Object.values(row).map((value, colIndex) => (
                                                        <TableCell className="text-left" key={colIndex}>{String(value)}</TableCell>
                                                    ))}
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                        <div className="text-sm flex items-center gap-3 border-b py-2">
                            <p className="font-medium whitespace-nowrap">Generated insight:</p>
                            <p className="text-muted-foreground break-all">{insights.nl_answer}</p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}