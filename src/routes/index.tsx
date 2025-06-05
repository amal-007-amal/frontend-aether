import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AehterOnBoardLayout } from "../layouts/OnboardLayout"
import { AetherOnBoard } from "../pages/onboard/onboard"
import { AetherLoginLayout } from "../layouts/LoginLayout"
import { AetherLogin } from "../pages/login/login"
import { AetherDashboardLayout } from "../layouts/DashboardLayout"
import { AetherDashboard } from "../pages/dashboard/dashboard"

const router = createBrowserRouter([
    {
        path: "/",
        element: <AehterOnBoardLayout><AetherOnBoard /></AehterOnBoardLayout>,
    },
    {
        path: "/login",
        element: <AetherLoginLayout><AetherLogin /></AetherLoginLayout>,
    },
    {
        path: "/dashboard",
        element: <AetherDashboardLayout><AetherDashboard /></AetherDashboardLayout>,
    },
])

export default function AetherAppRouter() {
    return <RouterProvider router={router} />
}