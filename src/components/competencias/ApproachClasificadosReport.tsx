/**
 * ApproachClasificadosReport Component
 * -----------------------------------------------------------------------
 * Reporte "Clasificados de Approach": una sola tabla con todos los jugadores
 * registrados en `torneos.approachjug` que caen dentro de los parámetros de la
 * competencia, ordenados por distancia y, en empate, por fecha/hora de registro.
 *
 * Se usa tanto en la página pública de Competiciones como en la pestaña
 * Admin > Approach (para vista previa del orden seleccionado).
 */

import { Loader2, Crosshair } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import PlayerSearchInput from '@/components/shared/PlayerSearchInput';
import { useApproachClasificados, type ApproachOrden } from '@/hooks/useApproachClasificados';
import { buildUniqueNameSuggestions, matchesPlayerName } from '@/lib/searchUtils';

// ============= Types =============

interface ApproachClasificadosReportProps {
  /** Dirección de ordenamiento por distancia (asc = más cerca primero). */
  orden?: ApproachOrden;
  /** Muestra la columna con la fecha/hora de registro (desempate). */
  showFecha?: boolean;
  /** Título configurable mostrado sobre la lista de clasificados. */
  title?: string;
}

// ============= Styles =============

/** Clases compartidas por los encabezados, idénticas al reporte de Putt. */
const TH_CLASS = 'px-3 py-2 font-bold';

// ============= Helpers =============

/**
 * Convierte la fecha de base de datos a la presentación DD/MM/YYYY HH:MM:SS.
 * Conserva el valor original cuando no coincide con el formato esperado.
 */
const formatFechaHora = (value: string | null | undefined): string => {
  if (!value) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?/.exec(value);
  if (!match) return value;
  const date = `${match[3]}/${match[2]}/${match[1]}`;
  if (!match[4]) return date;
  const seconds = match[6] ? `:${match[6]}` : '';
  return `${date} ${match[4]}:${match[5]}${seconds}`;
};

// ============= Component =============

/**
 * ApproachClasificadosReport
 * Tabla única de clasificados. Muestra loader, error y estado vacío.
 */
const ApproachClasificadosReport = ({
  orden = 'asc',
  showFecha = true,
  title = 'Clasificados — Approach',
}: ApproachClasificadosReportProps) => {
  const { data, isLoading, isError } = useApproachClasificados(orden);
  /** Texto activo del buscador de jugadores. */
  const [search, setSearch] = useState('');
  /** Referencias de filas para desplazar la lista al jugador encontrado. */
  const rowRefs = useRef<Map<string, HTMLTableRowElement | null>>(new Map());
  /** Lista estable y sin duplicados para el autocompletado. */
  const suggestions = useMemo(
    () => buildUniqueNameSuggestions((data?.players ?? []).map((player) => player.name)),
    [data?.players],
  );

  /** Busca al jugador confirmado y desplaza su fila al centro de la pantalla. */
  const handleSearchSubmit = (term: string) => {
    const query = term.trim();
    if (!query) return;
    const hit = (data?.players ?? []).find((player) => matchesPlayerName(player.name, query));
    if (!hit) return;
    setTimeout(() => {
      const row = rowRefs.current.get(`${hit.id}-${hit.position}`);
      if (row) row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  /** Loading */
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  /** Error */
  if (isError) {
    return (
      <p className="text-center text-muted-foreground py-8">
        No se pudieron cargar los clasificados de approach.
      </p>
    );
  }

  const players = data?.players ?? [];
  /** Suma de lugares configurados en todos los premios de Approach. */
  const totalSlots = (data?.groups ?? []).reduce((sum, group) => sum + Math.max(0, group.lugares), 0);

  return (
    <section className="space-y-3 border-t-2 border-primary/30 pt-6">
      {/* Encabezado y contador con el mismo patrón visual de Clasificados Putt. */}
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-bold text-primary">{title}</h3>
        <span className="text-sm text-muted-foreground">
          {players.length} {players.length === 1 ? 'jugador' : 'jugadores'}
          {totalSlots > 0 ? ` de ${totalSlots}` : ''}
        </span>
      </div>

      {/* Buscador con autocompletado y confirmación por Enter. */}
      <PlayerSearchInput
        value={search}
        onChange={setSearch}
        onSubmit={handleSearchSubmit}
        suggestions={suggestions}
        placeholder="Buscar jugador en clasificados..."
        className="max-w-md"
      />

      {/* Tabla blanca idéntica a Clasificados Putt. */}
      <div className="overflow-x-auto bg-white rounded-lg border border-border">
        <table className="w-full text-sm bg-white">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className={`${TH_CLASS} text-center w-12`}>#</th>
              <th className={`${TH_CLASS} text-left`}>Jugador</th>
              <th className={`${TH_CLASS} text-left`}>Cat</th>
              <th className={`${TH_CLASS} text-right w-32`}>Dist</th>
              {showFecha && <th className={`${TH_CLASS} text-center w-44`}>Fecha</th>}
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={showFecha ? 5 : 4} className="px-3 py-6 text-center text-muted-foreground">
                  <Crosshair className="h-8 w-8 mx-auto mb-2" />
                  Aún no hay clasificados.
                </td>
              </tr>
            ) : (
              players.map((player) => {
                const rowKey = `${player.id}-${player.position}`;
                const isHit = !!search.trim() && matchesPlayerName(player.name, search);
                return (
                  <tr
                    key={rowKey}
                    ref={(element) => rowRefs.current.set(rowKey, element)}
                    className={`border-t border-border/60 bg-white ${
                      isHit ? 'bg-accent ring-2 ring-accent' : ''
                    }`}
                  >
                    <td className="px-3 py-2 text-center font-semibold text-primary">{player.position}</td>
                    <td className={`px-3 py-2 whitespace-nowrap ${isHit ? 'font-bold text-accent-foreground' : ''}`}>
                      {player.name}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground">{player.category || '—'}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{player.distance.toFixed(2)} mts</td>
                    {showFecha && (
                      <td className="px-3 py-2 text-center text-muted-foreground tabular-nums whitespace-nowrap">
                        {formatFechaHora(player.fecha)}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ApproachClasificadosReport;
