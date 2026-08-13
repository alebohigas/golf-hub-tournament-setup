/**
 * moduleState
 * =============================================================================
 * Estado global (fuera de React) con los módulos APAGADOS del proyecto actual.
 *
 * ¿Por qué fuera de React? Porque `PageVisibilityContext` se monta ANTES de que
 * la configuración del servidor llegue, y necesita consultar si un módulo está
 * apagado sin depender del árbol de providers. Este singleton es la única vía
 * de comunicación entre ambos, y notifica a sus suscriptores en cada cambio.
 *
 * Regla: "apagado en /setup" gana siempre sobre "visible en /admin".
 */

import { getModuleByPageId, MODULES } from './registry';

// ============= Tipos =============

/** Estado de un módulo tal como se guarda en la base de datos. */
export interface ModuleState {
  /** false = apagado. */
  enabled: boolean;
  /** Quién lo apagó ('superadmin' o el usuario de staff). Solo informativo. */
  lockedBy?: string;
  /** Fecha ISO del último cambio. */
  updatedAt?: string;
}

/** Contenido de la columna `site_config.modules_config`. */
export interface ModulesConfig {
  modules: Record<string, ModuleState>;
}

// ============= Estado interno =============

/** Ids de módulos apagados. Vacío = todo activo (comportamiento por defecto). */
let disabledModuleIds = new Set<string>();

/** Suscriptores que deben re-renderizar cuando cambia el set. */
const listeners = new Set<() => void>();

/** Notifica a todos los suscriptores. */
const emit = () => {
  listeners.forEach((fn) => fn());
};

// ============= API pública =============

/**
 * Reemplaza el set de módulos apagados a partir de la configuración del
 * servidor. Ignora los módulos núcleo: nunca se pueden apagar.
 */
export const applyModulesConfig = (config: ModulesConfig | null | undefined): void => {
  const next = new Set<string>();
  const entries = config?.modules ?? {};
  MODULES.forEach((mod) => {
    if (mod.core) return;
    const state = entries[mod.id];
    if (state && state.enabled === false) next.add(mod.id);
  });
  // Evita re-render si no cambió nada.
  const same =
    next.size === disabledModuleIds.size &&
    [...next].every((id) => disabledModuleIds.has(id));
  if (same) return;
  disabledModuleIds = next;
  emit();
};

/** ¿Está apagado este módulo? Los módulos núcleo siempre responden false. */
export const isModuleDisabled = (moduleId: string): boolean =>
  disabledModuleIds.has(moduleId);

/** ¿Está activo este módulo? */
export const isModuleEnabled = (moduleId: string): boolean => !isModuleDisabled(moduleId);

/** Set (copia) de módulos apagados. */
export const getDisabledModuleIds = (): string[] => [...disabledModuleIds];

/**
 * ¿La página del menú pertenece a un módulo apagado?
 * Las páginas sin módulo asignado se consideran siempre disponibles.
 */
export const isPageIdModuleDisabled = (pageId: string): boolean => {
  const mod = getModuleByPageId(pageId);
  return !!mod && !mod.core && disabledModuleIds.has(mod.id);
};

/** Suscribe un callback a los cambios. Devuelve la función para desuscribir. */
export const subscribeModules = (fn: () => void): (() => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
