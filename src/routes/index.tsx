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
    // Wrap all internal routes in the dashboard layout
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
    ],
  },
]);

export default function AetherAppRouter() {
  return <RouterProvider router={router} />;
}
