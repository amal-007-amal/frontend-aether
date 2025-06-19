import Header from "../shared/Header";
import SideBar from "../shared/Sidebar";
import { Outlet } from "react-router-dom";

export const AetherDashboardLayout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header></Header>
            <div className="flex flex-1">
                <SideBar></SideBar>
                <main className="flex-1 p-2">
                    <div className="rounded-xl w-full p-2">
                        <Outlet/>
                    </div>
                </main>
            </div>
        </div>

    )
}