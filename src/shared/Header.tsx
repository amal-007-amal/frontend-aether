import { AudioLines, Ellipsis, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { Switch } from "../components/ui/switch";

export default function Header() {
    const aetherNaviagte = useNavigate()

    const [isDark, setIsDark] = useState<boolean>(() => {
        if (typeof window === "undefined") return false;
        const stored = localStorage.getItem("aether_theme");
        if (stored === "dark") return true;
        if (stored === "light") return false;
        return window.matchMedia("(prefers-color-scheme: light)").matches;
    });

    useEffect(() => {
        const root = window.document.documentElement;
        if (isDark) {
            root.classList.add("dark");
            localStorage.setItem("aether_theme", "dark");
        } else {
            root.classList.remove("dark");
            localStorage.setItem("aether_theme", "light");
        }
    }, [isDark]);



    const handleLogout = () => {
        localStorage.removeItem('aether_access_token')
        localStorage.removeItem('aether_refresh_token')
        localStorage.removeItem('aether_leaderboard_filters')
        localStorage.removeItem('aether_call_filters')
        localStorage.removeItem('aether_theme')
        aetherNaviagte('/')
    }
    return (
        <header className="text-white p-3 rounded-xl bg-white border border-gray-200 dark:border-stone-700 dark:bg-stone-900 flex justify-between items-center">
            <h2 className="font-light flex text-black dark:text-white text-xl items-center">
                A<span className="text-fuchsia-500 font-normal">ether</span>&nbsp;Hub&nbsp;
                <AudioLines className="h-5 w-5" />
            </h2>

            <div className="flex gap-4">
                <div className="flex items-center">
                    <Switch checked={isDark} onCheckedChange={setIsDark} />
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger>
                        <Ellipsis className="h-4 w-4 text-black dark:text-white" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="space-y-2 p-3 me-10 w-40">
                        <div className="flex flex-col gap-4">
                            <span onClick={handleLogout} className="cursor-pointer flex items-center text-xs"><LogOut className="w-4 h-4" /> Logout</span>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}