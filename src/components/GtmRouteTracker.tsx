import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { trackPageView } from "@/lib/gtm";

/**
 * Sends a GTM `page_view` on every client-side route change. In a SPA the
 * browser never reloads, so without this only the initial load would be
 * counted. Runs after paint so `document.title` reflects the new page.
 */
export default function GtmRouteTracker() {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname + location.search;
    // Defer to the next frame so per-page <title> updates are already applied.
    const id = window.requestAnimationFrame(() => trackPageView(path));
    return () => window.cancelAnimationFrame(id);
  }, [location.pathname, location.search]);

  return null;
}
