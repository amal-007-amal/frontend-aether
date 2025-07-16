import { Cog } from "lucide-react";
import AetherServerStats from "../../components/aetherserverstatus";

export default function SettingPage (){
    const token = localStorage.getItem('aether_access_token')
    return(
        <div>
               <div className="p-2 bg-white mb-4 rounded-xl border border-gray-200 dark:border-stone-700 dark:bg-transparent">
                <div className="flex gap-10 mb-2 items-center px-1 py-1">
                    <h2 className="text-sm font-medium flex items-center gap-2"><Cog className="h-4 text-fuchsia-500" />Server Status</h2>
                    <h2 className="text-sm text-red-500">*Experimental Feature*: *This page is under development*.</h2>
                </div>
            </div>
            <AetherServerStats token={token} />
        </div>
    )
}