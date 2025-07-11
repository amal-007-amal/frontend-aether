import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AehterOnBoardLayout } from "../layouts/OnboardLayout";
import { AetherLoginLayout } from "../layouts/LoginLayout";
import { AetherLogin } from "../pages/login/login";
import { AetherDashboardLayout } from "../layouts/DashboardLayout";
import { AetherDashboard } from "../pages/dashboard/dashboard";
import Auth from "../pages/onboard/auth";
import SettingPage from "../pages/settings/settings";
import UserManagmentPage from "../pages/usermanagement/usermanagment";
import CallDetailPage from "../pages/calldetail/calldetail";
import RedirectRoot from "../pages/redirect/redirect";
import AetherAuthGuard from "../guard/authguard";
import { setRouter } from "../utils/navigation";
import CallDetailTestPage from "../pages/calldetailtest/calldetailstest";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RedirectRoot />,
  },
  {
    path: "/onboard",
    element: <AehterOnBoardLayout><Auth /></AehterOnBoardLayout>,
  },
  {
    path: "/login",
    element: <AetherLoginLayout><AetherLogin /></AetherLoginLayout>,
  },
  {
    element:<AetherAuthGuard><AetherDashboardLayout /></AetherAuthGuard>,
    children: [
      {
        path: "/dashboard",
        element: <AetherDashboard />,
      },
      {
        path: "/settings",
        element: <SettingPage />,
      },
      {
        path: "/usermanagment",
        element: <UserManagmentPage />,
      },
      {
        path: "/calldetails",
        element: <CallDetailPage />,
      },
      {
        path: "/calldetailstest",
        element: <CallDetailTestPage />,
      },
    ],
  },
]);
setRouter(router)
export default function AetherAppRouter() {
  return <RouterProvider router={router} />;
}
