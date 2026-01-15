import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import "./index.css";
import { TeacherAuthProvider } from "./state/TeacherAuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <TeacherAuthProvider>
      <RouterProvider router={router} />
    </TeacherAuthProvider>
  </React.StrictMode>
);
