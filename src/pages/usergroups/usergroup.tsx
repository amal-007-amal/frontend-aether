import { Users } from "lucide-react";

export default function UserGrousPage() {
    return(
         <div>
            <div className="p-2 bg-white h-14 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex gap-10 mb-2 items-center px-1 pt-2">
                    <h2 className="text-sm font-medium flex items-center gap-2"><Users className="h-4 text-fuchsia-500" />User Groups</h2>
                    <h2 className="text-xs px-3 bg-red-50 shadow text-red-500 border border-red-500 rounded-xl">*Experimental Feature*: *This page is under development*.</h2>
                </div>
            </div>
            <div className="p-3 flex flex-col gap-4 mt-4 bg-white rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
         
            </div>
        </div>
    )
}