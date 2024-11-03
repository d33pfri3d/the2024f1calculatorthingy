import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Component from "./App.tsx";
import { Analytics } from "@vercel/analytics/react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Component />
    <Analytics />
  </StrictMode>
);
