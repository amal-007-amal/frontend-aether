import { AlignLeft, Cog, Home, PhoneCall, UserCog } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "../components/ui/tooltip";


export default function SideBar() {
  const location = useLocation();
  const navMenuItem = [
    {
      path: "/dashboard",
      label: "Analysis",
      icon: Home,
      tooltip: true,
    },
    {
      path: "/calldetails",
      label: "Call Details",
      icon: AlignLeft,
      tooltip: true,
    },
    {
      path: "/usermanagment",
      label: "User Management",
      icon: UserCog,
      tooltip: true,
    },
    {
      path: "/settings",
      label: "Settings",
      icon: Cog,
      tooltip: true,
    },
    {
      path: "/calldetailstest",
      label: "Call Details Test",
      icon: PhoneCall,
      tooltip: true,
    },
  ]
  const isActive = (path: string) => location.pathname === path;

  const baseClasses = "text-fuchsia-500 flex items-center gap-3 text-xs p-2 rounded-xl";

  return (
    <aside className={`transition-all duration-300 w-18 py-4 px-3 dark:bg-stone-900 bg-gray-100/60 rounded-xl p-2 shadow`}>
      <nav className="space-y-3 flex flex-col">
        {navMenuItem.map(({ path, label, icon: Icon, tooltip }) => {
          const active = isActive(path);
          const iconClasses = `w-5 h-5 hover:rotate-[360deg] transition-transform duration-1000 ease-in-out ${active ? 'text-white' : 'text-gray-400'}`;
          const linkClasses = `${baseClasses} ${active ? "bg-fuchsia-500 shadow" : ""}`;

          const link = (
            <Link key={path} to={path} className={linkClasses}>
              <Icon className={iconClasses} />
            </Link>
          );

          return tooltip ? (
            <Tooltip key={path}>
              <TooltipTrigger asChild>{link}</TooltipTrigger>
              <TooltipContent  side="right">{label}</TooltipContent>
            </Tooltip>
          ) : (
            link
          );
        })}

      </nav>
    </aside>
  );
}
