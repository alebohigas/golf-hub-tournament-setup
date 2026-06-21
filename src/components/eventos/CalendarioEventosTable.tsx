/**
 * CalendarioEventosTable
 * --------------------------------------------------------------
 * Presentación moderna del "Calendario de Eventos" del torneo
 * (anteriormente disponible solo como póster). Muestra una matriz
 * con los 9 días del torneo en el eje horizontal y las áreas /
 * actividades (La Roca, Casa Club, Golf, Eventos) en el eje
 * vertical.
 *
 * Características clave de presentación:
 *  - Encabezado de fechas con `position: sticky` (top) — siempre
 *    visible al hacer scroll vertical.
 *  - Primera columna (área / categoría) con `position: sticky`
 *    (left) — siempre visible al hacer scroll horizontal en mobile.
 *  - Tokens semánticos del design system (sin colores hardcodeados).
 *  - Layout responsive: en desktop se ve completo, en mobile la
 *    tabla hace scroll horizontal con headers congelados.
 */

import { Utensils, Flag, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ============================================================
 * Tipos
 * ============================================================ */

/** Una columna del calendario representa un día del torneo. */
interface DayColumn {
  /** Nombre del día (ej. "VIERNES"). */
  weekday: string;
  /** Número de día (ej. "26"). */
  date: string;
}

/** Una celda dentro de la tabla. Puede ser texto simple o multilínea. */
interface Cell {
  /** Título principal (ej. "DESAYUNO"). */
  title?: string;
  /** Subtítulo opcional (ej. "6 A.M. a 12 P.M."). */
  subtitle?: string;
  /** Lista de viñetas para celdas con varios elementos (ej. categorías Golf). */
  bullets?: string[];
  /** Hora destacada para eventos especiales. */
  time?: string;
  /** Indica que la celda está intencionalmente vacía. */
  empty?: boolean;
}

/** Una fila dentro de un grupo (ej. "Desayuno" dentro de "La Roca"). */
interface Row {
  /** Etiqueta principal de la fila (ej. "DESAYUNO"). */
  label: string;
  /** Etiqueta secundaria opcional con horario base. */
  sublabel?: string;
  /** Celdas — una por día (mismo orden que `DAYS`). */
  cells: Cell[];
}

/** Un grupo agrupa filas relacionadas (ej. todas las comidas de "La Roca"). */
interface Group {
  /** Identificador del grupo (para `key`). */
  id: string;
  /** Nombre mostrado verticalmente en la columna izquierda. */
  title: string;
  /** Icono lucide para reforzar visualmente. */
  icon: React.ComponentType<{ className?: string }>;
  /** Filas que pertenecen a este grupo. */
  rows: Row[];
}

/* ============================================================
 * Datos del calendario (basados en el póster oficial Terralta)
 * ============================================================ */

/** 9 días del torneo: viernes 26 → sábado 4. */
const DAYS: DayColumn[] = [
  { weekday: 'Viernes', date: '26' },
  { weekday: 'Sábado', date: '27' },
  { weekday: 'Domingo', date: '28' },
  { weekday: 'Lunes', date: '29' },
  { weekday: 'Martes', date: '30' },
  { weekday: 'Miércoles', date: '1' },
  { weekday: 'Jueves', date: '2' },
  { weekday: 'Viernes', date: '3' },
  { weekday: 'Sábado', date: '4' },
];

/** Helper: genera 9 celdas idénticas — útil para servicios diarios fijos. */
const repeat = (cell: Cell): Cell[] => Array.from({ length: 9 }, () => ({ ...cell }));

/** Estructura completa del calendario. */
const GROUPS: Group[] = [
  {
    id: 'la-roca',
    title: 'La Roca',
    icon: Utensils,
    rows: [
      {
        label: 'Desayuno',
        sublabel: '6 A.M. – 12 P.M.',
        cells: repeat({ title: 'Desayuno', subtitle: '6 A.M. – 12 P.M.' }),
      },
      {
        label: 'Comida',
        sublabel: '12 P.M. – 5 P.M.',
        cells: repeat({ title: 'Comida', subtitle: '12 P.M. – 5 P.M.' }),
      },
    ],
  },
  {
    id: 'casa-club',
    title: 'Casa Club',
    icon: Utensils,
    rows: [
      {
        label: 'Comida',
        sublabel: '12 P.M. – 5 P.M.',
        cells: repeat({ title: 'Comida', subtitle: '12 P.M. – 5 P.M.' }),
      },
      {
        label: 'Cena',
        sublabel: '5 P.M. – 9:30 P.M.',
        cells: repeat({ title: 'Cena', subtitle: '5 P.M. – 9:30 P.M.' }),
      },
    ],
  },
  {
    id: 'golf',
    title: 'Golf',
    icon: Flag,
    rows: [
      {
        label: 'Categorías en juego',
        cells: [
          { bullets: ['Damas (1A, 2A, 3A, 4A)', 'Estrella', 'Seniors', 'Super Seniors'] },
          { bullets: ['Caballeros (A, B, C)'] },
          { bullets: ['Caballeros (D, A, B)'] },
          { bullets: ['Damas (1A, 2A, 3A, 4A)', 'Estrella'] },
          { bullets: ['Caballeros (C, D)'] },
          { bullets: ['Damas (1A, 2A, 3A, 4A)', 'Estrella'] },
          { bullets: ['Campeonato', 'Premier', 'Caballeros (AA)', 'Seniors', 'Super Seniors'] },
          { bullets: ['Caballeros (AA)', 'Seniors', 'Super Seniors', 'Campeonato', 'Premier'] },
          { bullets: ['Caballeros (A, B, C, D)', 'Premier', 'Camp Zona 10'] },
        ],
      },
    ],
  },
  {
    id: 'eventos',
    title: 'Eventos',
    icon: Sparkles,
    rows: [
      {
        label: 'Actividades especiales',
        cells: [
          { empty: true },
          { empty: true },
          { title: 'Putt Damas', time: '4:00 P.M.' },
          { title: 'Bingo', time: '5:00 P.M.' },
          { empty: true },
          { title: 'Long Driver Caballeros', time: '5:00 P.M.', subtitle: 'Casino · 7:00 P.M.' },
          { title: 'Putt Caballeros', time: '5:00 P.M.', subtitle: 'Approach Mixto · 8:30 P.M.' },
          { empty: true },
          { empty: true },
        ],
      },
    ],
  },
];

/* ============================================================
 * Componente
 * ============================================================ */

/**
 * Renderiza la matriz completa con:
 *  - Encabezado de días (sticky top).
 *  - Columna de áreas (sticky left).
 *  - Celdas con tipografía display + tokens semánticos.
 */
const CalendarioEventosTable = () => {
  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-3 md:px-4">
        {/* Encabezado */}
        <div className="text-center mb-6 md:mb-10">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground tracking-tight">
            Calendario de Eventos
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Programa completo del torneo — desliza para ver todos los días
          </p>
        </div>

        {/* Wrapper con scroll horizontal y altura limitada para que el
            sticky-top funcione cuando hay scroll vertical en mobile. */}
        <div
          className={cn(
            'relative overflow-auto rounded-xl border border-border',
            'bg-card shadow-card',
            // Limita altura en mobile para activar sticky vertical;
            // en desktop deja crecer porque cabe sin scroll vertical.
            'max-h-[80vh] md:max-h-none'
          )}
        >
          <table className="w-full border-separate border-spacing-0 text-xs md:text-sm">
            {/* ---------- Encabezado: días (sticky top) ---------- */}
            <thead>
              <tr>
                {/* Esquina superior izquierda — sticky en ambos ejes. */}
                <th
                  scope="col"
                  className={cn(
                    'sticky top-0 left-0 z-30',
                    'bg-primary text-primary-foreground',
                    'border-b border-r border-primary-foreground/20',
                    'min-w-[88px] md:min-w-[120px] px-2 py-3',
                    'text-left font-display uppercase tracking-wider text-[10px] md:text-xs'
                  )}
                >
                  Área
                </th>
                {DAYS.map((d, i) => (
                  <th
                    key={`${d.weekday}-${d.date}-${i}`}
                    scope="col"
                    className={cn(
                      'sticky top-0 z-20',
                      'bg-primary text-primary-foreground',
                      'border-b border-r border-primary-foreground/15',
                      'min-w-[120px] md:min-w-[140px] px-2 py-3',
                      'text-center font-display'
                    )}
                  >
                    <div className="text-[10px] md:text-xs uppercase tracking-wider opacity-90">
                      {d.weekday}
                    </div>
                    <div className="text-xl md:text-2xl font-bold leading-none mt-1 text-accent">
                      {d.date}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* ---------- Cuerpo: filas agrupadas ---------- */}
            <tbody>
              {GROUPS.map((group) => {
                const Icon = group.icon;
                return group.rows.map((row, rowIdx) => (
                  <tr key={`${group.id}-${rowIdx}`}>
                    {/* Primera columna (sticky left): solo se renderiza
                        en la primera fila del grupo y abarca todas las
                        filas mediante rowSpan para mostrar la categoría
                        verticalmente centrada. */}
                    {rowIdx === 0 && (
                      <th
                        scope="rowgroup"
                        rowSpan={group.rows.length}
                        className={cn(
                          'sticky left-0 z-10',
                          'bg-primary text-primary-foreground',
                          'border-b border-r border-primary-foreground/15',
                          'px-2 py-3 align-middle text-center'
                        )}
                      >
                        <div className="flex flex-col items-center gap-1.5">
                          <Icon className="h-4 w-4 md:h-5 md:w-5 text-accent" />
                          <span className="font-display font-bold uppercase tracking-wider text-[10px] md:text-xs leading-tight">
                            {group.title}
                          </span>
                        </div>
                      </th>
                    )}

                    {/* Celdas de datos por día */}
                    {row.cells.map((cell, cellIdx) => (
                      <td
                        key={cellIdx}
                        className={cn(
                          'border-b border-r border-border',
                          'px-2 py-3 align-middle text-center',
                          cell.empty
                            ? 'bg-muted/30'
                            : 'bg-card hover:bg-muted/40 transition-colors'
                        )}
                      >
                        {cell.empty ? (
                          <span className="sr-only">Sin actividad</span>
                        ) : cell.bullets ? (
                          <ul className="space-y-0.5 text-foreground text-left">
                            {cell.bullets.map((b, i) => (
                              <li
                                key={i}
                                className="text-[10px] md:text-xs leading-snug pl-2 relative before:content-['•'] before:text-accent before:absolute before:left-0"
                              >
                                {b}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="space-y-0.5">
                            {cell.title && (
                              <div className="font-display font-semibold text-foreground text-xs md:text-sm uppercase tracking-wide">
                                {cell.title}
                              </div>
                            )}
                            {cell.time && (
                              <div className="text-[10px] md:text-xs font-bold text-accent">
                                {cell.time}
                              </div>
                            )}
                            {cell.subtitle && (
                              <div className="text-[9px] md:text-[11px] text-muted-foreground leading-tight">
                                {cell.subtitle}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                ));
              })}
            </tbody>
          </table>
        </div>

        {/* Nota al pie */}
        <p className="text-center text-xs text-muted-foreground mt-4 italic">
          * Programa sujeto a cambios sin previo aviso
        </p>
      </div>
    </section>
  );
};

export default CalendarioEventosTable;