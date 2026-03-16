/**
 * App.tsx
 * Main application component with routing and providers
 * Includes PageVisibilityProvider for admin-controlled page visibility
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PageVisibilityProvider, usePageVisibility } from "@/contexts/PageVisibilityContext";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useEffect } from "react";
import Index from "./pages/Index";
import Convocatoria from "./pages/Convocatoria";
import Eventos from "./pages/Eventos";
import Jugadores from "./pages/Jugadores";
import Salidas from "./pages/Salidas";
import LiveScoring from "./pages/LiveScoring";
import Live from "./pages/Live";
import Resultados from "./pages/Resultados";
import Competicion from "./pages/Competicion";
import Competencias from "./pages/Competencias";
import Calendario from "./pages/Calendario";
import Avisos from "./pages/Avisos";
import Premios from "./pages/Premios";
import Patrocinadores from "./pages/Patrocinadores";
import Reglas from "./pages/Reglas";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/auth/ProtectedRoute";

// ============= Query Client =============
const queryClient = new QueryClient();

/**
 * SiteConfigSync
 * Fetches server-side config and pushes values into PageVisibility context
 * Must be rendered inside PageVisibilityProvider
 */
const SiteConfigSync = ({ children }: { children: React.ReactNode }) => {
  const { data } = useSiteConfig();
  const { 
    setMenuItemOrder, 
    setPageVisibility, 
    setMenuGroups, 
    setPageGroupAssignment,
    isAdmin,
  } = usePageVisibility();

  /** Sync server config into context state when data arrives (non-admin only) */
  useEffect(() => {
    if (!data || isAdmin) return; // Admin manages locally, don't overwrite

    if (data.menu_order) {
      setMenuItemOrder(data.menu_order);
    }
    if (data.visibility) {
      Object.entries(data.visibility).forEach(([pageId, visible]) => {
        setPageVisibility(pageId, visible);
      });
    }
    if (data.menu_groups) {
      setMenuGroups(data.menu_groups);
    }
    if (data.page_group_assignments) {
      Object.entries(data.page_group_assignments).forEach(([pageId, groupId]) => {
        setPageGroupAssignment(pageId, groupId);
      });
    }
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps

  return <>{children}</>;
};

// ============= App Component =============
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PageVisibilityProvider>
        <SiteConfigSync>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/admin" element={<Admin />} />
              
              {/* Protected Routes - visibility controlled by admin */}
              <Route path="/convocatoria" element={<ProtectedRoute pageId="convocatoria"><Convocatoria /></ProtectedRoute>} />
              <Route path="/eventos" element={<ProtectedRoute pageId="eventos"><Eventos /></ProtectedRoute>} />
              <Route path="/jugadores" element={<ProtectedRoute pageId="jugadores"><Jugadores /></ProtectedRoute>} />
              <Route path="/salidas" element={<ProtectedRoute pageId="salidas"><Salidas /></ProtectedRoute>} />
              <Route path="/live-scoring" element={<ProtectedRoute pageId="live-scoring"><LiveScoring /></ProtectedRoute>} />
              <Route path="/live" element={<ProtectedRoute pageId="live"><Live /></ProtectedRoute>} />
              <Route path="/resultados" element={<ProtectedRoute pageId="resultados"><Resultados /></ProtectedRoute>} />
              <Route path="/competicion" element={<ProtectedRoute pageId="competicion"><Competicion /></ProtectedRoute>} />
              <Route path="/competencias" element={<ProtectedRoute pageId="competencias"><Competencias /></ProtectedRoute>} />
              <Route path="/calendario" element={<ProtectedRoute pageId="calendario"><Calendario /></ProtectedRoute>} />
              <Route path="/avisos" element={<ProtectedRoute pageId="avisos"><Avisos /></ProtectedRoute>} />
              <Route path="/premios" element={<ProtectedRoute pageId="premios"><Premios /></ProtectedRoute>} />
              <Route path="/patrocinadores" element={<ProtectedRoute pageId="patrocinadores"><Patrocinadores /></ProtectedRoute>} />
              <Route path="/reglas" element={<ProtectedRoute pageId="reglas"><Reglas /></ProtectedRoute>} />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SiteConfigSync>
      </PageVisibilityProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
