import { AlignLeft, Cog, Home, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function SideBar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const baseClasses = "text-fuchsia-500 flex items-center gap-3 text-xs p-2 rounded-xl";

  return (
    <aside className={`transition-all duration-300 w-18 py-4 px-3 bg-gray-100/60 rounded-xl p-2`}>
      <nav className="space-y-3 flex flex-col">
        <Link to="/dashboard" className={`${baseClasses} ${isActive("/dashboard") ? "bg-fuchsia-500 shadow" : ""}`}>
          <Home className={`w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out ${isActive("/dashboard") ? 'text-white' : 'text-gray-400'}`} />
        </Link>

        <Link to="/calldetails" className={`${baseClasses} ${isActive("/calldetails") ? "bg-fuchsia-500 shadow" : ""}`}>
          <AlignLeft className={`w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out ${isActive("/calldetails") ? 'text-white' : 'text-gray-400'}`} />
        </Link>

        <Link to="/usermanagment" className={`${baseClasses} ${isActive("/usermanagment") ? "bg-fuchsia-500 shadow" : ""}`}>
          <UserCog className={`w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out ${isActive("/usermanagment") ? 'text-white' : 'text-gray-400'}`} />
        </Link>

        <Link to="/settings" className={`${baseClasses} ${isActive("/settings") ? "bg-fuchsia-500 shadow" : ""}`}>
          <Cog className={`w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out ${isActive("/settings") ? 'text-white' : 'text-gray-400'}`} />
        </Link>
      </nav>
    </aside>
  );
}
