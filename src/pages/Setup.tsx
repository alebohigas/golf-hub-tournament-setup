/**
 * Setup Page (/setup)
 * =============================================================================
 * Configuración de MÓDULOS del proyecto. Aquí se decide qué funcionalidades
 * existen en esta instalación: cada interruptor apaga o enciende un módulo
 * completo (su página pública, su tab en /admin y sus enlaces del menú).
 *
 * Reglas:
 *  - Solo el SUPERADMIN entra a esta página y solo él puede volver a encender
 *    un módulo apagado (el backend rechaza cualquier otra credencial).
 *  - Apagar un módulo NO borra datos: solo lo oculta. El borrado de código se
 *    hace después con `scripts/prune-modules.ts`.
 *  - "Apagado aquí" gana siempre sobre "visible en /admin".
 *
 * Ver el catálogo en `src/modules/registry.ts` y la documentación en docs/MODULES.md.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Blocks, Lock, ShieldAlert, Loader2, RotateCcw } from 'lucide-react';
import { usePageVisibility } from '@/contexts/PageVisibilityContext';
import { useSiteConfig, useSaveSiteConfig } from '@/hooks/useSiteConfig';
import { useToast } from '@/hooks/use-toast';
import { getSuperAdminPassword } from '@/lib/superAdminAuth';
import { useModules } from '@/modules/useModules';
import {
  MODULE_GROUP_LABELS,
  ModuleGroup,
  getDependents,
  getModule,
} from '@/modules/registry';
import type { ModulesConfig } from '@/modules/moduleState';

// ============= Sub-componentes =============

/** Aviso mostrado cuando el visitante no es superadmin. */
const SetupDenied = () => (
  <div className="container mx-auto px-4 py-16 max-w-xl">
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-3">
          <ShieldAlert className="w-7 h-7 text-destructive" />
        </div>
        <CardTitle>Acceso restringido</CardTitle>
        <CardDescription>
          La configuración de módulos es exclusiva del superadministrador.
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Button asChild>
          <Link to="/admin">Iniciar sesión como superadmin</Link>
        </Button>
      </CardContent>
    </Card>
  </div>
);

// ============= Página =============

/**
 * Setup
 * Lista los módulos agrupados por área con su interruptor. Cada cambio se
 * guarda en `site_config.modules_config` (columna JSON) del proyecto actual.
 */
const Setup = () => {
  const { isAdmin } = usePageVisibility();
  const { data: siteConfig, isLoading } = useSiteConfig();
  const saveSiteConfig = useSaveSiteConfig();
  const { toast } = useToast();
  const { modules } = useModules();
  /** Id del módulo cuyo guardado está en curso (para el spinner del switch). */
  const [savingId, setSavingId] = useState<string | null>(null);

  /** Configuración actual normalizada. */
  const currentConfig: ModulesConfig = useMemo(
    () => ({ modules: siteConfig?.modules_config?.modules ?? {} }),
    [siteConfig]
  );

  /** ¿La base ya tiene configuración de módulos guardada? */
  const isFirstRun = Object.keys(currentConfig.modules).length === 0;

  /** Guarda el estado completo de módulos en el servidor. */
  const persist = (next: ModulesConfig, moduleId: string) => {
    setSavingId(moduleId);
    saveSiteConfig.mutate(
      { password: getSuperAdminPassword(), modules_config: next },
      {
        onSuccess: () => {
          setSavingId(null);
          toast({
            title: 'Módulos actualizados',
            description: 'La configuración se aplicó a todo el sitio.',
          });
        },
        onError: (err) => {
          setSavingId(null);
          toast({
            title: 'No se pudo guardar',
            description: err.message,
            variant: 'destructive',
          });
        },
      }
    );
  };

  /** Enciende o apaga un módulo, avisando de los módulos dependientes. */
  const toggleModule = (moduleId: string, enabled: boolean) => {
    const mod = getModule(moduleId);
    if (!mod || mod.core) return;

    const next: ModulesConfig = { modules: { ...currentConfig.modules } };
    next.modules[moduleId] = {
      enabled,
      lockedBy: enabled ? undefined : 'superadmin',
      updatedAt: new Date().toISOString(),
    };

    // Al apagar un módulo, se apagan también los que dependen de él.
    if (!enabled) {
      getDependents(moduleId).forEach((dep) => {
        if (dep.core) return;
        next.modules[dep.id] = {
          enabled: false,
          lockedBy: 'superadmin',
          updatedAt: new Date().toISOString(),
        };
      });
    }

    // Al encender un módulo, se encienden sus requisitos.
    if (enabled) {
      (mod.dependsOn ?? []).forEach((depId) => {
        const dep = getModule(depId);
        if (!dep || dep.core) return;
        next.modules[depId] = { enabled: true, updatedAt: new Date().toISOString() };
      });
    }

    persist(next, moduleId);
  };

  /** Restablece todo: borra la configuración y deja todos los módulos activos. */
  const resetAll = () => {
    persist({ modules: {} }, '__reset__');
  };

  if (!isAdmin) return <Layout><SetupDenied /></Layout>;

  /** Orden de las agrupaciones en pantalla. */
  const groupOrder: ModuleGroup[] = [
    'competencia',
    'informacion',
    'inscripciones',
    'presentacion',
    'nucleo',
  ];

  const activeCount = modules.filter((m) => m.enabled).length;
  const offCount = modules.length - activeCount;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Blocks className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Módulos del proyecto</h1>
              <p className="text-muted-foreground">
                Elige qué funcionalidades existen en esta instalación
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{activeCount} activos</Badge>
            <Badge variant="outline">{offCount} apagados</Badge>
            <Button variant="outline" size="sm" className="gap-2" onClick={resetAll}>
              <RotateCcw className="h-4 w-4" />
              Activar todo
            </Button>
          </div>
        </div>

        {/* Asistente de primer arranque */}
        {isFirstRun && (
          <Alert className="mb-6">
            <AlertTitle>Primer arranque</AlertTitle>
            <AlertDescription>
              Todos los módulos están activos. Apaga los que este torneo no vaya a usar; podrás
              volver a encenderlos solo desde aquí. Apagar un módulo no borra información.
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando configuración…
          </p>
        )}

        {/* Módulos por agrupación */}
        <div className="space-y-6">
          {groupOrder.map((group) => {
            const groupModules = modules.filter((m) => m.group === group);
            if (!groupModules.length) return null;
            return (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="text-lg">{MODULE_GROUP_LABELS[group]}</CardTitle>
                </CardHeader>
                <CardContent className="divide-y">
                  {groupModules.map((mod) => {
                    const state = currentConfig.modules[mod.id];
                    const locked = !mod.enabled && !!state?.lockedBy;
                    return (
                      <div key={mod.id} className="py-4 first:pt-0 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold">{mod.label}</h3>
                              {mod.core && <Badge variant="secondary">Núcleo</Badge>}
                              {locked && (
                                <Badge variant="outline" className="gap-1">
                                  <Lock className="h-3 w-3" />
                                  Solo superadmin
                                </Badge>
                              )}
                              {!mod.enabled && !mod.core && (
                                <Badge variant="destructive">Apagado</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {mod.description}
                            </p>
                            {!mod.core && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Al apagarlo: {mod.losesOnDisable}
                              </p>
                            )}
                            {/* Rutas y tabs que controla este módulo */}
                            {(mod.routes.length > 0 || mod.adminTabs.length > 0) && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {mod.routes.map((r) => (
                                  <Badge key={r} variant="outline" className="font-mono text-[10px]">
                                    {r}
                                  </Badge>
                                ))}
                                {mod.adminTabs.map((t) => (
                                  <Badge key={t} variant="secondary" className="text-[10px]">
                                    /admin → {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {savingId === mod.id && (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            )}
                            <Switch
                              checked={mod.enabled}
                              disabled={mod.core || saveSiteConfig.isPending}
                              onCheckedChange={(v) => toggleModule(mod.id, v)}
                              aria-label={`Activar ${mod.label}`}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-8" />

        <p className="text-xs text-muted-foreground">
          La selección se guarda en la base de datos de este proyecto, así que cada instalación
          tiene sus propios módulos. Para eliminar definitivamente el código de los módulos
          apagados, corre <code className="font-mono">scripts/prune-modules.ts</code> (ver
          docs/NEW-PROJECT.md).
        </p>
      </div>
    </Layout>
  );
};

export default Setup;
