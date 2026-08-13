/**
 * useModules
 * =============================================================================
 * Hooks de acceso a los módulos activos del proyecto.
 *
 *  - `useSyncModules()`  → se llama UNA vez (en SiteConfigSync) para empujar la
 *                          configuración del servidor al singleton `moduleState`.
 *  - `useModules()`      → lista de módulos con su estado, para /setup y filtros.
 *  - `useModuleEnabled()`→ booleano reactivo para un módulo concreto.
 */

import { useEffect, useState } from 'react';
import {
  MODULES,
  ModuleDef,
} from './registry';
import {
  ModulesConfig,
  applyModulesConfig,
  getDisabledModuleIds,
  isModuleEnabled,
  subscribeModules,
} from './moduleState';

// ============= Hooks =============

/**
 * useSyncModules
 * Empuja `modules_config` (viene de site_config.php) al estado global.
 * Debe llamarse en un único lugar, lo más arriba posible del árbol.
 */
export const useSyncModules = (config: ModulesConfig | null | undefined): void => {
  useEffect(() => {
    applyModulesConfig(config ?? null);
  }, [config]);
};

/** Suscripción reactiva al set de módulos apagados. */
const useDisabledIds = (): string[] => {
  const [ids, setIds] = useState<string[]>(() => getDisabledModuleIds());
  useEffect(() => subscribeModules(() => setIds(getDisabledModuleIds())), []);
  return ids;
};

/** Un módulo con su estado resuelto, listo para pintar en /setup. */
export interface ModuleWithState extends ModuleDef {
  enabled: boolean;
}

/**
 * useModules
 * Devuelve el catálogo completo con `enabled` resuelto y helpers de consulta.
 */
export const useModules = () => {
  const disabled = useDisabledIds();
  const modules: ModuleWithState[] = MODULES.map((m) => ({
    ...m,
    enabled: m.core || !disabled.includes(m.id),
  }));

  return {
    modules,
    disabledIds: disabled,
    /** ¿Está activo el módulo? */
    isEnabled: (id: string) => {
      const mod = modules.find((m) => m.id === id);
      return mod ? mod.enabled : true;
    },
    /** ¿Está activo el tab de /admin? Tabs sin módulo dueño se consideran activos. */
    isAdminTabEnabled: (tab: string) => {
      const owner = modules.find((m) => m.adminTabs.includes(tab));
      return owner ? owner.enabled : true;
    },
  };
};

/** Booleano reactivo para un módulo concreto. */
export const useModuleEnabled = (moduleId: string): boolean => {
  const disabled = useDisabledIds();
  return !disabled.includes(moduleId) && isModuleEnabled(moduleId);
};
