import { AspectRatio } from "../components/ui/aspect-ratio";
import Header from "../shared/Header";
import SideBar from "../shared/Sidebar";
import { Outlet } from "react-router-dom";

export const AetherDashboardLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-100 p-4 dark:bg-transparent">
            <div className="flex flex-1 p-1">
                <SideBar></SideBar>
                <main className="flex-1 px-4">
                    <Header></Header>
                    <AspectRatio ratio={16 / 9} className="w-full rounded-xl">
                        <div className="rounded-xl w-full py-4 ">
                            <Outlet />
                        </div>
                    </AspectRatio>
                </main>
            </div>
        </div>
    )
}