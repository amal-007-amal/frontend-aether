import { createBrowserRouter, RouterProvider } from "react-router-dom"
import { AehterOnBoardLayout } from "../layouts/OnboardLayout"
import { AetherLoginLayout } from "../layouts/LoginLayout"
import { AetherLogin } from "../pages/login/login"
import { AetherDashboardLayout } from "../layouts/DashboardLayout"
import { AetherDashboard } from "../pages/dashboard/dashboard"
import Auth from "../pages/onboard/auth"

const router = createBrowserRouter([
    {
        path: "/",
        element: <AehterOnBoardLayout><Auth /></AehterOnBoardLayout>,
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