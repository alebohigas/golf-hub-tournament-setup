/**
 * ModuleGate
 * =============================================================================
 * Envoltura de ruta para páginas que NO pasan por `ProtectedRoute` (rutas de
 * showcase y de admin propias de un módulo). Si el módulo está apagado desde
 * /setup, la ruta responde como inexistente.
 */

import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useModuleEnabled } from '@/modules/useModules';

interface ModuleGateProps {
  /** Id del módulo dueño de la ruta (ver src/modules/registry.ts). */
  moduleId: string;
  children: ReactNode;
}

/** Renderiza los hijos solo si el módulo está activo. */
const ModuleGate = ({ moduleId, children }: ModuleGateProps) => {
  const enabled = useModuleEnabled(moduleId);
  if (!enabled) return <Navigate to="/not-found" replace />;
  return <>{children}</>;
};

export default ModuleGate;
