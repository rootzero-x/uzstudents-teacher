import { createBrowserRouter } from "react-router-dom";
import AppShell from "../app/AppShell";
import LoginPage from "../pages/Login/LoginPage";
import DashboardPage from "../pages/Dashboard/DashboardPage";
import GroupsPage from "../pages/Groups/GroupsPage";
import GroupDetailPage from "../pages/Groups/GroupDetailPage";
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { path: "login", element: <LoginPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: "groups", element: <GroupsPage /> },
          { path: "groups/:id", element: <GroupDetailPage /> },
        ],
      },
    ],
  },
]);
