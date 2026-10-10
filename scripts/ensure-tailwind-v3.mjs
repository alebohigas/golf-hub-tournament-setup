/**
 * ensure-tailwind-v3.mjs
 * ---------------------------------------------------------------------------
 * Guardia previa al build (`prebuild`). El proyecto está configurado para
 * Tailwind CSS v3 (postcss.config.js usa `tailwindcss` como plugin directo).
 * Si en la máquina local quedó instalada la v4, Vite falla con:
 *   "It looks like you're trying to use `tailwindcss` directly as a PostCSS plugin"
 * Este script detecta la versión instalada y, si no es 3.x, reinstala
 * automáticamente la versión fijada en package.json antes de compilar.
 */
import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import { createRequire } from "node:module";

/** Versión exacta de Tailwind requerida (tomada de package.json). */
const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const required = pkg.devDependencies?.tailwindcss || "3.4.17";

/**
 * getInstalledVersion
 * Devuelve la versión instalada de tailwindcss en node_modules o null si falta.
 */
function getInstalledVersion() {
  try {
    const require = createRequire(import.meta.url);
    const twPkgPath = require.resolve("tailwindcss/package.json", { paths: [process.cwd()] });
    return JSON.parse(readFileSync(twPkgPath, "utf8")).version;
  } catch {
    return null;
  }
}

const installed = getInstalledVersion();

if (installed && installed.startsWith("3.")) {
  process.exit(0);
}

console.warn(
  `\n[ensure-tailwind-v3] Tailwind instalado: ${installed ?? "ninguno"}. ` +
    `Se requiere ${required}. Reinstalando automáticamente...\n`,
);

execSync(`npm install -D tailwindcss@${required} --save-exact --legacy-peer-deps`, {
  stdio: "inherit",
  env: { ...process.env, PUPPETEER_SKIP_DOWNLOAD: "true" },
});

const after = getInstalledVersion();
if (!after || !after.startsWith("3.")) {
  console.error(`[ensure-tailwind-v3] ERROR: sigue instalada Tailwind ${after}.`);
  process.exit(1);
}
console.log(`[ensure-tailwind-v3] Tailwind ${after} listo.\n`);
