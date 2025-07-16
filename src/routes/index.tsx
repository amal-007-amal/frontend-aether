import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AehterOnBoardLayout } from "../layouts/OnboardLayout";
import { AetherDashboardLayout } from "../layouts/DashboardLayout";
import { AetherDashboard } from "../pages/dashboard/dashboard";
import Auth from "../pages/onboard/auth";
import SettingPage from "../pages/settings/settings";
import UserManagmentPage from "../pages/usermanagement/usermanagment";
import RedirectRoot from "../pages/redirect/redirect";
import AetherAuthGuard from "../guard/authguard";
import { setRouter } from "../utils/navigation";
import CallDetailTestPage from "../pages/calldetailtest/calldetailstest";
import UserGrousPage from "../pages/usergroups/usergroup";
import InsightPage from "../pages/insights/insight";

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
        path: "/usergroups",
        element: <UserGrousPage />,
      },
      {
        path: "/insights",
        element: <InsightPage />,
      },
      {
        path: "/calldetails",
        element: <CallDetailTestPage />,
      },
    ],
  },
]);
setRouter(router)
export default function AetherAppRouter() {
  return <RouterProvider router={router} />;
}
