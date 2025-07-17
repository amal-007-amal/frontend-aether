import { Cog } from "lucide-react";
import AetherServerStats from "../../components/aetherserverstatus";

export default function SettingPage (){
    const token = localStorage.getItem('aether_access_token')
    return(
        <div>
               <div className="p-2 bg-white mb-4 h-14  rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex gap-10 mb-2 items-center px-1 py-2">
                    <h2 className="text-sm font-medium flex items-center gap-2"><Cog className="h-4 text-fuchsia-500" />Server Status</h2>
                    <h2 className="text-xs px-3 bg-red-50 shadow text-red-500 border border-red-500 rounded-xl">*Experimental Feature*: *This page is under development*.</h2>
                </div>
            </div>
            <AetherServerStats token={token} />
        </div>
    )
}