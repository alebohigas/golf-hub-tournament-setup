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
import { Award, Crown, Medal, Trophy, Users } from 'lucide-react';

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

/**
 * Paleta e ícono por posición de podio.
 *   gold   → Campeón (corona)
 *   silver → Sub Campeón (medalla)
 *   bronze → 3er lugar (award) / Semifinalistas (users, se pasa aparte)
 */
const COLORS = {
  gold:   { badge: 'bg-yellow-500 text-white', block: 'bg-yellow-500/20 border-yellow-500', text: 'text-yellow-600 dark:text-yellow-500' },
  silver: { badge: 'bg-slate-400 text-white',  block: 'bg-slate-400/20 border-slate-400',  text: 'text-slate-500 dark:text-slate-300' },
  bronze: { badge: 'bg-amber-700 text-white',  block: 'bg-amber-700/20 border-amber-700',  text: 'text-amber-700 dark:text-amber-600' },
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
  Icon,
}: {
  place: 1 | 2 | 3;
  tone: keyof typeof COLORS;
  /** Etiqueta del puesto: CAMPEÓN / SUB CAMPEÓN / 3ER LUGAR / SEMIFINALISTAS. */
  label: string;
  /** Uno o varios nombres (SEMIFINALISTAS lleva dos). */
  names: (string | null)[];
  /** Alturas responsivas del bloque (móvil → escritorio). */
  heightClass: string;
  /** Ícono del puesto (corona / medalla / award / users). */
  Icon: typeof Crown;
}) => {
  const c = COLORS[tone];
  const shown = names.filter((n) => n && n.trim().length > 0) as string[];
  return (
    <div className="flex-1 min-w-0 basis-0 flex flex-col items-center gap-1.5 sm:gap-2 max-w-[200px]">
      <div className="w-full text-center min-h-[5rem] sm:min-h-[5.5rem] flex flex-col items-center justify-end px-0.5 sm:px-1 gap-0.5">
        <span className={`inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide ${c.text}`}>
          <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" aria-hidden="true" />
          <span className="whitespace-nowrap">{label}</span>
        </span>
        {shown.length ? (
          shown.map((n, i) => (
            <span key={i} className="w-full text-[11px] sm:text-sm font-semibold whitespace-normal break-words leading-tight">
              {n}
            </span>
          ))
        ) : (
          <span className="text-[11px] sm:text-sm italic text-muted-foreground">— por definir —</span>
        )}
      </div>
      <div className={`w-full ${heightClass} ${c.block} border-2 rounded-t-md flex items-start justify-center pt-1.5 sm:pt-2`}>
        <span className={`inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full ${c.badge} font-bold text-base sm:text-lg shadow`}>
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
      <h3 className="text-center text-base sm:text-lg font-bold text-accent flex items-center justify-center gap-2 mb-3 sm:mb-4">
        <Trophy className="h-4 w-4 sm:h-5 sm:w-5" /> Podio
      </h3>
      {/* Grid de 3 columnas iguales: mismo layout en móvil y escritorio,
          sólo cambian escalas de texto, íconos y alturas de bloque. */}
      <div className="grid grid-cols-3 items-end justify-items-center gap-1.5 sm:gap-3 max-w-2xl mx-auto px-1">
        <PodiumSlot place={2} tone="silver" label="Sub Campeón" names={[runnerUpName]} heightClass="h-16 sm:h-20" Icon={Medal} />
        <PodiumSlot place={1} tone="gold" label="Campeón" names={[championName]} heightClass="h-24 sm:h-28" Icon={Crown} />
        {hasThirdPlaceMatch ? (
          <PodiumSlot place={3} tone="bronze" label="3er Lugar" names={[thirdPlaceName ?? null]} heightClass="h-12 sm:h-16" Icon={Award} />
        ) : (
          <PodiumSlot place={3} tone="bronze" label="Semifinalistas" names={semifinalistNames} heightClass="h-12 sm:h-16" Icon={Users} />
        )}
      </div>
    </section>
  );
};

export default Podium;
