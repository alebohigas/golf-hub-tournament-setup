/**
 * DistanciasReport
 * Tabla reutilizable de yardas y par por campo y mesa de salida.
 */
import { Loader2, MapPin, Ruler } from 'lucide-react';
import { useDistanciasData, type DistanciasTee } from '@/hooks/useDistanciasData';
import { cn } from '@/lib/utils';

/** Columnas del reporte: hoyos, subtotales por vuelta y total general. */
const COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'V1', 10, 11, 12, 13, 14, 15, 16, 17, 18, 'V2', 'TOTAL'] as const;

/** Acepta únicamente colores CSS hexadecimales completos o cortos. */
const safeHexColor = (value: string, fallback: string): string =>
  /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(value.trim()) ? value.trim() : fallback;

/** Suma un campo numérico dentro de un rango de hoyos inclusivo. */
const sumRange = (tee: DistanciasTee, key: 'yardas' | 'par', from: number, to: number): number =>
  tee.holes.reduce((sum, hole) => (
    hole.numero >= from && hole.numero <= to ? sum + hole[key] : sum
  ), 0);

/** Resuelve el valor de una celda de hoyo, vuelta o total. */
const cellValue = (
  tee: DistanciasTee,
  column: typeof COLUMNS[number],
  key: 'yardas' | 'par',
): number | string => {
  if (column === 'V1') return sumRange(tee, key, 1, 9);
  if (column === 'V2') return sumRange(tee, key, 10, 18);
  if (column === 'TOTAL') return key === 'yardas' ? tee.totalYardas : tee.totalPar;
  return tee.holes.find((hole) => hole.numero === column)?.[key] ?? '—';
};

/** Una tabla de distancias encabezada con el color real de su mesa. */
const TeeDistanceTable = ({ tee }: { tee: DistanciasTee }) => {
  const backgroundColor = safeHexColor(tee.bgcolor, '#1f2937');
  const foregroundColor = safeHexColor(tee.color, '#ffffff');

  return (
    <article className="overflow-hidden rounded-md border border-border bg-card shadow-sm">
      <div className="px-4 py-3" style={{ backgroundColor, color: foregroundColor }}>
        <h3 className="text-lg font-bold uppercase">{tee.tee || `Mesa ${tee.id}`}</h3>
        <p className="mt-0.5 text-xs font-medium opacity-90">
          {tee.categories.map((category) => category.name).join(' · ')}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] table-fixed border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor, color: foregroundColor }}>
              <th className="sticky left-0 z-20 w-24 border-r border-current/20 px-2 py-3 text-left" style={{ backgroundColor }}>
                Hoyo
              </th>
              {COLUMNS.map((column) => (
                <th
                  key={column}
                  className={cn(
                    'min-w-11 border-r border-current/20 px-1 py-3 text-center font-bold',
                    typeof column === 'string' && 'w-16',
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(['yardas', 'par'] as const).map((key, rowIndex) => (
              <tr key={key} className={rowIndex === 0 ? 'bg-card' : 'bg-muted/30'}>
                <th className="sticky left-0 z-10 border-b border-r border-border bg-card px-2 py-3 text-left font-semibold text-foreground">
                  {key === 'yardas' ? 'Yardas' : 'Par'}
                </th>
                {COLUMNS.map((column) => (
                  <td
                    key={column}
                    className={cn(
                      'border-b border-r border-border px-1 py-3 text-center text-foreground',
                      typeof column === 'string' && 'bg-muted/50 font-bold',
                    )}
                  >
                    {cellValue(tee, column, key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
};

/** Propiedades para adaptar el encabezado al contexto público o administrativo. */
interface DistanciasReportProps {
  compact?: boolean;
}

/** Reporte completo agrupado por campo activo. */
const DistanciasReport = ({ compact = false }: DistanciasReportProps) => {
  const { data, isLoading, error } = useDistanciasData();
  const campos = data?.campos ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 text-primary" role="status" aria-label="Cargando distancias">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <p className="py-12 text-center text-destructive">No se pudieron cargar las distancias.</p>;
  }

  if (campos.length === 0) {
    return <p className="py-12 text-center text-muted-foreground">No hay distancias activas para este torneo.</p>;
  }

  return (
    <div className="space-y-10">
      {!compact && (
        <div className="text-center">
          <h2 className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
            <Ruler className="h-6 w-6 text-primary" /> Distancias por mesa de salida
          </h2>
        </div>
      )}

      {campos.map((campo) => (
        <section key={campo.id} className="space-y-4">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <MapPin className="h-5 w-5 text-primary" /> {campo.campo || `Campo ${campo.id}`}
          </h2>
          <div className="space-y-5">
            {campo.tees.map((tee) => <TeeDistanceTable key={tee.id} tee={tee} />)}
          </div>
        </section>
      ))}
    </div>
  );
};

export default DistanciasReport;
