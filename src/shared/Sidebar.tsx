import { Activity, Cog, NotebookTabs, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const baseClasses =
        "text-black bg-white flex items-center gap-2 text-xs hover:bg-purple-200 p-2 rounded-full";

    return (
        <aside className="w-[13rem] py-4 text-left px-5 shadow bg-white border-b border-b-gray-300">
            <nav className="space-y-2 flex flex-col">
                <Link
                    to="/dashboard"
                    className={`${baseClasses} ${isActive("/dashboard") ? "bg-purple-200" : ""}`}
                >
                    <Activity className="w-4 h-4" />
                    Analytics
                </Link>

                <Link
                    to="/calldetails"
                    className={`${baseClasses} ${isActive("/calldetails") ? "bg-purple-200" : ""}`}
                >
                    <NotebookTabs className="w-4 h-4" />
                    Call Details
                </Link>

                <Link
                    to="/usermanagment"
                    className={`${baseClasses} ${isActive("/usermanagment") ? "bg-purple-200" : ""}`}
                >
                    <UserCog className="w-4 h-4" />
                    User
                </Link>

                <Link
                    to="/settings"
                    className={`${baseClasses} ${isActive("/settings") ? "bg-purple-200" : ""}`}
                >
                    <Cog className="w-4 h-4" />
                    Settings
                </Link>
            </nav>
        </aside>
    )
}