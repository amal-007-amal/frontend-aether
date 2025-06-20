import { Activity, Cog, NotebookTabs, UserCog, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "../components/ui/button";

export default function SideBar() {
  const location = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const baseClasses = "shadow-md border-2 border-white text-purple-500 flex items-center gap-3 text-xs hover:bg-purple-200  p-2 rounded-full";

  return (
    <aside className={`transition-all duration-300 ${isExpanded ? "w-52 bg-white" : "w-16"} py-4 px-3 shadow-lg  border-b border-gray-300`}>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-purple-100 shadow-sm p-2 rounded-full hover:bg-purple-100"
        >
          <ChevronRight className={`transition-transform h-5 w-5 text-purple-500 ${isExpanded ? "rotate-180" : ""}`} />
        </Button>
      </div>

      <nav className="space-y-3 flex flex-col">
        <Link to="/dashboard" className={`${baseClasses} ${isActive("/dashboard") ? "bg-purple-800 text-white" : ""}`}>
          <Activity className="w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out" />
          {isExpanded && <span>Analytics</span>}
        </Link>

        <Link to="/calldetails" className={`${baseClasses} ${isActive("/calldetails") ? "bg-purple-800 text-white" : ""}`}>
          <NotebookTabs className="w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out" />
          {isExpanded && <span>Call Details</span>}
        </Link>

        <Link to="/usermanagment" className={`${baseClasses} ${isActive("/usermanagment") ? "bg-purple-800 text-white" : ""}`}>
          <UserCog className="w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out" />
          {isExpanded && <span>User</span>}
        </Link>

        <Link to="/settings" className={`${baseClasses} ${isActive("/settings") ? "bg-purple-800 text-white" : ""}`}>
          <Cog className="w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out" />
          {isExpanded && <span>Settings</span>}
        </Link>
      </nav>
    </aside>
  );
}
