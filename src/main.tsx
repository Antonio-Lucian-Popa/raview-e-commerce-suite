import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { bootstrapGtm } from "./lib/gtm";

// Load the Google Tag Manager container (consent defaults to denied until the
// visitor accepts). No-op when VITE_GTM_ID is not set.
bootstrapGtm();

if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

createRoot(document.getElementById("root")!).render(<App />);
