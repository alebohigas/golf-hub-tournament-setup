/**
 * Podium (Podio de Match Play)
 * ---------------------------------------------------------------------------
 * Componente compartido por TODOS los brackets de Match Play (individual,
 * parejas y putt) para presentar el podio final:
 *
 *   - Si existe competencia por el 3er lugar (match 199/299 en Match Play,
 *     `position = 99` en el bracket de putt), el podio es:
 *         2 SUB CAMPEÓN · 1 CAMPEÓN · 3 TERCER LUGAR
 *   - Si NO hay competencia por el 3er lugar, el tercer bloque pasa a ser
 *     SEMIFINALISTAS y lista a los dos jugadores/parejas que perdieron en
 *     semifinales.
 *
 * Layout: 2-1-3 con el bloque central más alto (igual al diseño aprobado),
 * nombres arriba de cada bloque y badge numérico dentro del bloque.
 */
import { Trophy } from 'lucide-react';

/** Props del podio. Los nombres nulos se muestran como "— por definir —". */
export interface PodiumProps {
  /** Nombre del campeón (ganador de la final). */
  championName: string | null;
  /** Nombre del subcampeón (perdedor de la final). */
  runnerUpName: string | null;
  /** Ganador del match por 3er lugar. `null` si no hay match de 3er lugar. */
  thirdPlaceName?: string | null;
  /** Existe match por 3er lugar (aunque no esté decidido todavía). */
  hasThirdPlaceMatch?: boolean;
  /** Perdedores de semifinales (se usan cuando no hay match por 3er lugar). */
  semifinalistNames?: (string | null)[];
}

/** Paleta por posición de podio. */
const COLORS = {
  gold:   { badge: 'bg-yellow-500 text-white', block: 'bg-yellow-500/20 border-yellow-500' },
  silver: { badge: 'bg-slate-400 text-white',  block: 'bg-slate-400/20 border-slate-400' },
  bronze: { badge: 'bg-amber-700 text-white',  block: 'bg-amber-700/20 border-amber-700' },
} as const;

/**
 * Bloque individual del podio. `place` sólo define el número del badge; el
 * color y la altura se pasan explícitos para poder ordenar visualmente 2-1-3.
 */
const PodiumSlot = ({
  place,
  tone,
  label,
  names,
  heightClass,
}: {
  place: 1 | 2 | 3;
  tone: keyof typeof COLORS;
  /** Etiqueta del puesto: CAMPEÓN / SUB CAMPEÓN / 3ER LUGAR / SEMIFINALISTAS. */
  label: string;
  /** Uno o varios nombres (SEMIFINALISTAS lleva dos). */
  names: (string | null)[];
  heightClass: string;
}) => {
  const c = COLORS[tone];
  const shown = names.filter((n) => n && n.trim().length > 0) as string[];
  return (
    <div className="flex-1 min-w-0 flex flex-col items-center gap-2 max-w-[200px]">
      <div className="text-center min-h-[4rem] flex flex-col items-center justify-end px-1 gap-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
        {shown.length ? (
          shown.map((n, i) => (
            <span key={i} className="text-sm font-semibold whitespace-normal break-words leading-tight">
              {n}
            </span>
          ))
        ) : (
          <span className="text-sm italic text-muted-foreground">— por definir —</span>
        )}
      </div>
      <div className={`w-full ${heightClass} ${c.block} border-2 rounded-t-md flex items-start justify-center pt-2`}>
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${c.badge} font-bold text-lg shadow`}>
          {place}
        </span>
      </div>
    </div>
  );
};

/** Podio completo (sección con título "Podio"). */
const Podium = ({
  championName,
  runnerUpName,
  thirdPlaceName,
  hasThirdPlaceMatch,
  semifinalistNames = [],
}: PodiumProps) => {
  // Sin campeón no hay podio que mostrar.
  if (!championName) return null;
  return (
    <section className="border-t-2 border-accent/50 pt-6">
      <h3 className="text-center text-lg font-bold text-accent flex items-center justify-center gap-2 mb-4">
        <Trophy className="h-5 w-5" /> Podio
      </h3>
      <div className="flex items-end justify-center gap-3 max-w-2xl mx-auto">
        <PodiumSlot place={2} tone="silver" label="Sub Campeón" names={[runnerUpName]} heightClass="h-20" />
        <PodiumSlot place={1} tone="gold" label="Campeón" names={[championName]} heightClass="h-28" />
        {hasThirdPlaceMatch ? (
          <PodiumSlot place={3} tone="bronze" label="3er Lugar" names={[thirdPlaceName ?? null]} heightClass="h-16" />
        ) : (
          <PodiumSlot place={3} tone="bronze" label="Semifinalistas" names={semifinalistNames} heightClass="h-16" />
        )}
      </div>
    </section>
  );
};

export default Podium;
