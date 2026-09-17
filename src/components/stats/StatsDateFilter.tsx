/**
 * StatsDateFilter
 * ---------------------------------------------------------------
 * Filtro multi-selección de "fechas de consulta" para las secciones
 * de estadísticas (/stats). Lista todas las fechas del torneo (desde
 * la fecha de inicio hasta la fecha final, según el calendario de
 * juego) como chips seleccionables.
 *
 * Reglas de selección (igual que los filtros de tees/categorías):
 *  - Sin selección  → "Todas las fechas" (valor por defecto).
 *  - Un chip        → sólo esa fecha.
 *  - Varios chips   → agregación combinada de las fechas elegidas.
 *
 * Fuente de fechas: useCalendarioData() (caljuego del torneo activo).
 * ---------------------------------------------------------------
 */

import { useMemo } from 'react';
import { CalendarDays, Loader2 } from 'lucide-react';
import { useCalendarioData } from '@/hooks/useCalendarioData';
import { Button } from '@/components/ui/button';

/** Props del filtro de fechas de estadísticas. */
interface StatsDateFilterProps {
  /** Fechas seleccionadas ('YYYY-MM-DD'). Set vacío = TODAS (default). */
  selected: Set<string>;
  /** Notifica cambios de selección al componente padre. */
  onChange: (next: Set<string>) => void;
}

/** Meses abreviados en español para la etiqueta de cada chip. */
const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];
/** Días de la semana abreviados en español (0 = domingo). */
const DIAS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/**
 * formatFecha — etiqueta corta "jue 18 sep" a partir de 'YYYY-MM-DD'.
 * Parseo por descomposición (sin `new Date(string)`) para evitar
 * desfases de zona horaria.
 */
const formatFecha = (iso: string): string => {
  const [y, m, d] = iso.split('-').map((p) => parseInt(p, 10));
  if (!y || !m || !d) return iso;
  // Mediodía local: nunca cambia de día por zona horaria.
  const dt = new Date(y, m - 1, d, 12, 0, 0);
  return `${DIAS[dt.getDay()]} ${d} ${MESES[m - 1]}`;
};

const StatsDateFilter = ({ selected, onChange }: StatsDateFilterProps) => {
  const { data, isLoading } = useCalendarioData();

  /** Lista ordenada de fechas únicas del torneo (inicio → final). */
  const fechas = useMemo(
    () => (data?.dates ?? []).map((d) => d.date).sort(),
    [data],
  );

  /** Alterna una fecha dentro del conjunto de selección. */
  const toggle = (fecha: string) => {
    const next = new Set(selected);
    if (next.has(fecha)) next.delete(fecha);
    else next.add(fecha);
    onChange(next);
  };

  if (isLoading) {
    return (
      <span className="inline-flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Cargando fechas...
      </span>
    );
  }
  if (fechas.length === 0) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <CalendarDays className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mr-1">
        Fechas de consulta:
      </span>
      {fechas.map((f) => {
        const on = selected.has(f);
        return (
          <button
            key={f}
            onClick={() => toggle(f)}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
              on
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card hover:bg-muted border-border text-foreground'
            }`}
            aria-pressed={on}
            title={f}
          >
            {formatFecha(f)}
          </button>
        );
      })}
      {selected.size > 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-xs"
          onClick={() => onChange(new Set())}
        >
          Todas las fechas
        </Button>
      )}
    </div>
  );
};

export default StatsDateFilter;
