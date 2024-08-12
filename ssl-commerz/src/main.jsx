import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import Success from "./Success";
import Fail from "./Fail";
import Cancel from "./Cancel";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App></App>,
  },
  {
    path: "/success",
    element: <Success></Success>,
  },
  {
    path: "/fail",
    element: <Fail></Fail>,
  },
  { path: "/cancel", element: <Cancel></Cancel> },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
