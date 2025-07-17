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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../../components/ui/accordion"

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
    function cleanHtml(raw: string): string {
        if (!raw) return '';
        return raw
            .replace(/^```html\n?/, '') // optional code block start
            .replace(/```$/, '')        // optional code block end
            .replace(/^<html>|<\/html>$/gi, '') // strip <html> tags
            .trim();
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
                    <div className="w-full mt-4 rounded-xl border border-gray-200 bg-white dark:border-stone-700 dark:bg-transparent">
                        <div className="space-y-4 p-4">
                            {/* Always visible: Input Query */}
                            <div className="text-sm flex items-center gap-3">
                                <p className="font-medium whitespace-nowrap">Input Query:</p>
                                <p className="text-muted-foreground text-xs">{insighttext}</p>
                            </div>
                        </div>

                        {/* Accordion for SQL Query + Output */}
                        <Accordion type="single" collapsible>
                            <AccordionItem value="sql">
                                <AccordionTrigger className="px-4 text-left text-sm font-medium">
                                    View Intermediary Steps
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2 p-4">
                                    {/* Generated SQL Query */}
                                    <div className="text-sm flex items-center gap-3 border-b py-2">
                                        <p className="font-medium whitespace-nowrap">Generated SQL Query:</p>
                                        <p className="text-muted-foreground break-all text-xs">{insights.sql_query}</p>
                                    </div>

                                    {/* SQL Output */}
                                    <div className="text-sm flex items-center gap-3 border-b py-2">
                                        <p className="font-medium whitespace-nowrap">SQL Output:</p>
                                    </div>

                                    {/* Results Table */}
                                    {insights.results.length > 0 && (
                                        <div className="pt-2 text-sm">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {Object.keys(insights.results[0]).map((key) => (
                                                            <TableHead key={key} className="capitalize font-medium">
                                                                {key.replace(/_/g, " ")}
                                                            </TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {insights.results.map((row: any, rowIndex: number) => (
                                                        <TableRow key={rowIndex}>
                                                            {Object.values(row).map((value, colIndex: number) => (
                                                                <TableCell key={colIndex} className="text-left">
                                                                    {String(value)}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>

                        {/* Always visible: Generated Insight (at bottom) */}
                        <div className="space-y-4 p-4">
                            <div className="text-sm flex flex-col justify-start items-start gap-3">
                                <p className="font-medium whitespace-nowrap">Generated Insight:</p>
                                <div
                                    className="text-muted-foreground break-words text-xs text-left
    [&_p]:m-0 [&_ul]:m-0 [&_ol]:m-0 [&_li]:my-1
    [&_code]:bg-transparent [&_strong]:font-semibold
    [&_table]:table [&_table]:w-full [&_table]:border [&_table]:border-collapse
    [&_th]:border [&_td]:border [&_th]:px-2 [&_td]:px-2 [&_th]:py-1 [&_td]:py-1
    [&_thead]:bg-muted"
                                    dangerouslySetInnerHTML={{
                                        __html: cleanHtml(insights?.nl_answer || ''),
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}