import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { installSuperAdminPasswordFetchPatch } from "./lib/superAdminAuth";

// Keep legacy admin API calls compatible after the superadmin password changes.
installSuperAdminPasswordFetchPatch();

createRoot(document.getElementById("root")!).render(<App />);
