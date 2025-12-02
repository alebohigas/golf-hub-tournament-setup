import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Convocatoria from "./pages/Convocatoria";
import Eventos from "./pages/Eventos";
import Jugadores from "./pages/Jugadores";
import Salidas from "./pages/Salidas";
import LiveScoring from "./pages/LiveScoring";
import Resultados from "./pages/Resultados";
import Competicion from "./pages/Competicion";
import Calendario from "./pages/Calendario";
import Avisos from "./pages/Avisos";
import Premios from "./pages/Premios";
import Patrocinadores from "./pages/Patrocinadores";
import Reglas from "./pages/Reglas";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/convocatoria" element={<Convocatoria />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/jugadores" element={<Jugadores />} />
          <Route path="/salidas" element={<Salidas />} />
          <Route path="/live-scoring" element={<LiveScoring />} />
          <Route path="/resultados" element={<Resultados />} />
          <Route path="/competicion" element={<Competicion />} />
          <Route path="/calendario" element={<Calendario />} />
          <Route path="/avisos" element={<Avisos />} />
          <Route path="/premios" element={<Premios />} />
          <Route path="/patrocinadores" element={<Patrocinadores />} />
          <Route path="/reglas" element={<Reglas />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
