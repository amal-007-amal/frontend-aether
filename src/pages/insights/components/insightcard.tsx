import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../../components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../../../components/ui/table";

interface InsightCardProps {
    insighttext: string;
    insights: {
        nl_answer: string;
        sql_query: string;
        results: Record<string, any>[];
    };
}

export function InsightCard({ insighttext, insights }: InsightCardProps) {
    function cleanHtml(raw: string): string {
        if (!raw) return '';
        return raw
            .replace(/^```html\n?/, '')
            .replace(/```$/, '')
            .replace(/^<html>|<\/html>$/gi, '')
            .trim();
    }

    return (
        <div className="w-full mt-4 rounded-e-xl border-l-2 border-l-fuchsia-500 bg-white dark:border-stone-700 dark:bg-transparent">
            {/* <div className="space-y-4 p-4">
                <div className="text-sm flex items-center gap-3">
                    <p className="font-medium whitespace-nowrap">Input Query:</p>
                    <p className="text-muted-foreground text-xs">{insighttext}</p>
                </div>
            </div>
            <Accordion type="single" collapsible>
                <AccordionItem value="sql">
                    <AccordionTrigger className="px-4 text-left text-sm font-medium">
                        View Intermediary Steps
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 p-4">

                        <div className="text-sm flex items-center gap-3 border-b py-2">
                            <p className="font-medium whitespace-nowrap">Generated SQL Query:</p>
                            {insights?.sql_query ? (
                                <p className="text-muted-foreground text-xs">{insights.sql_query}</p>
                            ) : (
                                <p className="text-red-500 text-xs">No SQL query generated</p>
                            )}
                        </div>

                        {insights.results?.length > 0 && (
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
                                        {insights.results.map((row, rowIndex) => (
                                            <TableRow key={rowIndex}>
                                                {Object.values(row).map((value, colIndex) => (
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
                            __html: cleanHtml(insights?.nl_answer || ""),
                        }}
                    />
                </div>
            </div> */}
            <Accordion type="multiple" className="w-full" defaultValue={["global"]}>
                {/* Global Accordion */}
                <AccordionItem value="global">
                    <AccordionTrigger className="px-4 text-left text-sm font-medium">
                        <div className="space-y-4">
                            <div className="text-sm flex items-center gap-3">
                                <p className="font-medium whitespace-nowrap">Input Query:</p>
                                <p className="text-muted-foreground text-xs">{insighttext}</p>
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">

                        {/* Nested Accordion for Intermediary Steps */}
                        <Accordion type="single" collapsible>
                            <AccordionItem value="sql">
                                <AccordionTrigger className="px-4 text-left text-sm font-medium">
                                    View Intermediary Steps
                                </AccordionTrigger>
                                <AccordionContent className="space-y-2 p-4">

                                    <div className="text-sm flex items-center gap-3 border-b py-2">
                                        <p className="font-medium whitespace-nowrap">Generated SQL Query:</p>
                                        {insights?.sql_query ? (
                                            <p className="text-muted-foreground text-xs">{insights.sql_query}</p>
                                        ) : (
                                            <p className="text-red-500 text-xs">No SQL query generated</p>
                                        )}
                                    </div>

                                    {insights.results?.length > 0 && (
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
                                                    {insights.results.map((row, rowIndex) => (
                                                        <TableRow key={rowIndex}>
                                                            {Object.values(row).map((value, colIndex) => (
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

                        {/* Generated Insight */}
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
                                        __html: cleanHtml(insights?.nl_answer || ""),
                                    }}
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

        </div>
    );
}
