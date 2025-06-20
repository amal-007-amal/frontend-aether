import { Activity, Cog, NotebookTabs, UserCog, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export default function SideBar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const baseClasses = "shadow-lg border border-gray-200 text-purple-500 flex items-center gap-3 text-xs hover:bg-purple-200 p-2 rounded";

  return (
    <aside className={`transition-all duration-300 ${isExpanded ? "w-52 bg-white" : "w-16 bg-purple-100"} py-4 px-3 shadow-lg  border-b border-gray-300`}>
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-white p-2 rounded-full hover:bg-purple-100"
        >
          <ChevronRight className={`transition-transform h-5 w-5 ${isExpanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      <nav className="space-y-3 flex flex-col">
        <Link to="/dashboard" className={`${baseClasses} ${isActive("/dashboard") ? "bg-gradient-to-r from-purple-500 to-white text-white" : ""}`}>
          <Activity className="w-5 h-5" />
          {isExpanded && <span>Analytics</span>}
        </Link>

        <Link to="/calldetails" className={`${baseClasses} ${isActive("/calldetails") ? "bg-gradient-to-r from-purple-500 to-white text-white" : ""}`}>
          <NotebookTabs className="w-5 h-5" />
          {isExpanded && <span>Call Details</span>}
        </Link>

        <Link to="/usermanagment" className={`${baseClasses} ${isActive("/usermanagment") ? "bg-gradient-to-r from-purple-500 to-white text-white" : ""}`}>
          <UserCog className="w-5 h-5" />
          {isExpanded && <span>User</span>}
        </Link>

        <Link to="/settings" className={`${baseClasses} ${isActive("/settings") ? "bg-gradient-to-r from-purple-500 to-white text-white" : ""}`}>
          <Cog className="w-5 h-5" />
          {isExpanded && <span>Settings</span>}
        </Link>
      </nav>
    </aside>
  );
}
