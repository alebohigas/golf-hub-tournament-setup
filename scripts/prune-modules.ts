/**
 * prune-modules.ts
 * =============================================================================
 * Poda de código: BORRA del repositorio todo lo que pertenece a los módulos que
 * este proyecto no va a usar. Es el paso final del flujo modular:
 *
 *   1. /setup  → apagas los módulos (reversible, no borra nada).
 *   2. este script → elimina su código (irreversible, hazlo en una rama).
 *
 * Uso:
 *   bun scripts/prune-modules.ts --list
 *   bun scripts/prune-modules.ts --remove=skins,matchplay            # simulación
 *   bun scripts/prune-modules.ts --remove=skins,matchplay --apply    # borra
 *   bun scripts/prune-modules.ts --keep=convocatoria,resultados --apply
 *
 * Qué hace por cada módulo eliminado:
 *   - borra sus `srcFiles`, `apiFiles` y `migrations`;
 *   - quita de src/App.tsx los imports y las <Route> que lo referencian;
 *   - quita de src/pages/Admin.tsx los imports y los <TabsTrigger>/<TabsContent>
 *     cuyos `value` son sus `adminTabs`;
 *   - lo elimina del catálogo src/modules/registry.ts.
 *
 * Después de correrlo: `bunx tsgo --noEmit -p tsconfig.app.json` y arregla los
 * restos que reporte (siempre revisa el diff antes de subir).
 */

import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { MODULES, OPTIONAL_MODULE_IDS, type ModuleDef } from '../src/modules/registry';

// ============= Argumentos =============

/** Lee un argumento con formato --clave=valor. */
const arg = (name: string): string | undefined =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=').slice(1).join('=');

/** ¿Está presente una bandera booleana? */
const flag = (name: string): boolean => process.argv.includes(`--${name}`);

const APPLY = flag('apply');

// ============= Utilidades =============

/** Imprime el catálogo de módulos que se pueden podar. */
const listModules = (): void => {
  console.log('Módulos opcionales (se pueden eliminar):\n');
  MODULES.filter((m) => !m.core).forEach((m) => {
    console.log(`  ${m.id.padEnd(16)} ${m.label}`);
  });
  console.log('\nMódulos núcleo (nunca se eliminan):\n');
  MODULES.filter((m) => m.core).forEach((m) => {
    console.log(`  ${m.id.padEnd(16)} ${m.label}`);
  });
};

/** Resuelve la lista final de módulos a eliminar según --remove/--keep. */
const resolveTargets = (): ModuleDef[] => {
  const remove = arg('remove');
  const keep = arg('keep');
  if (!remove && !keep) {
    console.error('Falta --remove=id,id o --keep=id,id (o usa --list).');
    process.exit(1);
  }
  const ids = remove
    ? remove.split(',').map((s) => s.trim()).filter(Boolean)
    : OPTIONAL_MODULE_IDS.filter(
        (id) => !keep!.split(',').map((s) => s.trim()).includes(id)
      );

  const unknown = ids.filter((id) => !OPTIONAL_MODULE_IDS.includes(id));
  if (unknown.length) {
    console.error(`Ids desconocidos o de núcleo: ${unknown.join(', ')}`);
    process.exit(1);
  }

  // Arrastra los módulos que dependen de los eliminados.
  const set = new Set(ids);
  let grew = true;
  while (grew) {
    grew = false;
    MODULES.forEach((m) => {
      if (m.core || set.has(m.id)) return;
      if ((m.dependsOn ?? []).some((d) => set.has(d))) {
        set.add(m.id);
        grew = true;
      }
    });
  }
  return MODULES.filter((m) => set.has(m.id));
};

/** Borra un archivo o carpeta (o solo lo reporta en simulación). */
const removePath = (path: string): void => {
  if (!existsSync(path)) return;
  console.log(`  ${APPLY ? 'borrado' : 'borraría'}  ${path}`);
  if (APPLY) rmSync(path, { recursive: true, force: true });
};

/**
 * Elimina de un archivo las líneas que contengan cualquiera de los patrones.
 * Sirve para imports de una línea y para <Route .../> de una línea, que es
 * exactamente cómo están escritos App.tsx y Admin.tsx.
 */
const stripLines = (path: string, patterns: RegExp[], label: string): void => {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, 'utf8').split('\n');
  const kept = lines.filter((line) => !patterns.some((re) => re.test(line)));
  const removed = lines.length - kept.length;
  if (!removed) return;
  console.log(`  ${APPLY ? 'editado' : 'editaría'}  ${path} (-${removed} líneas: ${label})`);
  if (APPLY) writeFileSync(path, kept.join('\n'));
};

/** Nombre de componente a partir de una ruta de archivo .tsx. */
const componentName = (file: string): string | null => {
  const m = file.match(/([A-Za-z0-9_]+)\.tsx$/);
  return m ? m[1] : null;
};

// ============= Programa =============

if (flag('list')) {
  listModules();
  process.exit(0);
}

const targets = resolveTargets();

console.log(
  `\n${APPLY ? 'PODANDO' : 'SIMULACIÓN (agrega --apply para borrar)'} — ${targets.length} módulo(s): ` +
    targets.map((m) => m.id).join(', ') + '\n'
);

targets.forEach((mod) => {
  console.log(`• ${mod.label} (${mod.id})`);

  // 1. Archivos propios del módulo.
  [...mod.srcFiles, ...mod.apiFiles, ...mod.migrations].forEach(removePath);

  // 2. Referencias en App.tsx: imports + rutas.
  const names = mod.srcFiles.map(componentName).filter(Boolean) as string[];
  const appPatterns: RegExp[] = [
    ...names.map((n) => new RegExp(`^import\\s+${n}\\s+from`)),
    ...mod.routes.map((r) => new RegExp(`<Route[^>]*path="${r.replace(/[/:]/g, '\\$&')}"`)),
    ...mod.pageIds.map((p) => new RegExp(`pageId="${p}"`)),
    new RegExp(`moduleId="${mod.id}"`),
  ];
  stripLines('src/App.tsx', appPatterns, 'imports y rutas');

  // 3. Referencias en Admin.tsx: imports + triggers/contents de sus tabs.
  const adminPatterns: RegExp[] = [
    ...names.map((n) => new RegExp(`^import\\s+${n}\\s+from`)),
    ...mod.adminTabs.map((t) => new RegExp(`value=(?:'|")${t}(?:'|")`)),
  ];
  stripLines('src/pages/Admin.tsx', adminPatterns, 'imports y tabs');

  // 4. Quita el módulo del catálogo para que /setup ya no lo ofrezca.
  const registryPath = 'src/modules/registry.ts';
  const src = readFileSync(registryPath, 'utf8');
  const block = new RegExp(`\\n  \\{\\n    id: '${mod.id}',[\\s\\S]*?\\n  \\},`);
  if (block.test(src)) {
    console.log(`  ${APPLY ? 'editado' : 'editaría'}  ${registryPath} (catálogo)`);
    if (APPLY) writeFileSync(registryPath, src.replace(block, ''));
  }
  console.log('');
});

console.log(
  'Siguiente paso: bunx tsgo --noEmit -p tsconfig.app.json  → arregla los restos ' +
    '(TabsContent multilínea, entradas de menuConfig, etc.) y revisa el diff.\n'
);
