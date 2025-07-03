import Header from "../shared/Header";
import SideBar from "../shared/Sidebar";
import { Outlet } from "react-router-dom";

export const AetherDashboardLayout = () => {
    return (
        <div className="min-h-screen flex flex-col p-4">
            <div className="flex flex-1 p-1">
                <SideBar></SideBar>
                <main className="flex-1 px-4">
                    <Header></Header>
                    <div className="rounded-xl w-full py-4 ">
                        <Outlet/>
                    </div>
                </main>
            </div>
        </div>
    )
}