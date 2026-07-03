/**
 * ScorecardParejas Component
 * Tarjeta detallada para torneos de parejas. Réplica fiel del legacy
 * (`tarjeta_gogo_handicap.php` y `bola_baja_suma_scores.php`):
 *   - Go Go                   → Par · Vtja · Gross(j1) · hcp(j1) · Neto.
 *   - Bola Baja / Suma Scores → Par · Vtja · Gross(j1) · hcp(j1) · Gross(j2) · hcp(j2) · Neto.
 * La fila "Neto" sale de `tarjetas.h{n}_a` y la BD ya tiene aplicada la
 * lógica de cada estilojuego (best ball, suma, etc.). No se recalcula nada
 * aquí — es exactamente lo que el legacy mostraba.
 *
 * Datos vienen de `fetchParejasScorecardFromApi` (server/api/tarjeta_parejas.php).
 */

import { TableRow, TableCell } from '@/components/ui/table';
import { X } from 'lucide-react';
import type { ParejaScorecard, ParejaHoleScore } from '@/hooks/useResultadosData';

interface ScorecardParejasProps {
  scorecard: ParejaScorecard;
  /** Texto del grupo / pareja a mostrar en el header (ej. "Grupo C24"). */
  pairLabel: string;
  /** Etiqueta de la ronda (ej. "Ronda 2"). */
  roundLabel: string;
  onClose: () => void;
  colSpan: number;
}

/** Color por hoyo relativo al par */
const scoreColor = (golpes: number, par: number): string => {
  if (golpes <= 0) return 'text-muted-foreground';
  const diff = golpes - par;
  if (diff <= -2) return 'bg-primary text-primary-foreground rounded';
  if (diff === -1) return 'bg-red-500/20 text-red-700 rounded';
  if (diff === 0) return '';
  if (diff === 1) return 'bg-blue-500/20 text-blue-700 rounded';
  return 'bg-blue-700/20 text-blue-900 rounded';
};

const ScorecardParejas = ({ scorecard, pairLabel, roundLabel, onClose, colSpan }: ScorecardParejasProps) => {
  const { player1, player2, holes, estilojuego, totals, fecha, campo } = scorecard;
  const front9 = holes.slice(0, 9);
  const back9 = holes.slice(9, 18);

  const isGoGo = estilojuego === 'Go Go';
  const isBolaBaja = estilojuego === 'Bola Baja';
  const isSuma = estilojuego === 'Suma Scores';
  /**
   * Bola Baja y Suma Scores se renderizan idénticos: muestran ambos
   * jugadores y la fila Neto agregada del equipo. La diferencia entre
   * estilos vive en la BD (h{n}_a ya viene calculado como best-ball o
   * suma según corresponda), no en el layout.
   */
  const showPartner = !isGoGo;

  /**
   * Devuelve las iniciales del nombre completo. Toma la primera letra de
   * cada palabra significativa (ignora conectores cortos como "de", "la").
   * Usado en la columna de etiqueta de la fila del jugador para evitar
   * ambigüedad cuando dos jugadores comparten el primer nombre.
   */
  const getInitials = (fullName: string): string => {
    if (!fullName) return '';
    const SKIP = new Set(['de', 'del', 'la', 'las', 'los', 'y', 'da', 'do']);
    return fullName
      .trim()
      .split(/\s+/)
      .filter((w) => !SKIP.has(w.toLowerCase()))
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  };

  /**
   * Para cada hoyo decide qué jugador(es) aportaron el score usado para el
   * Neto del equipo. El puntito amarillo solo se muestra en Bola Baja porque
   * es el único modo donde hay que identificar cuál de los dos scores cuenta.
   * Go Go siempre usa jugador 1 y Suma Scores usa ambos, por lo que no hay
   * ambigüedad que resolver visualmente.
   * Devuelve { p1, p2 } booleans indicando qué celdas se marcan.
   */
  const getUsedFor = (h: ParejaHoleScore): { p1: boolean; p2: boolean } => {
    if (!isBolaBaja) return { p1: false, p2: false };
    const n1 = (h.p1SO || 0) - (h.p1Hcp || 0);
    const n2 = (h.p2SO || 0) - (h.p2Hcp || 0);
    const has1 = (h.p1SO || 0) > 0;
    const has2 = (h.p2SO || 0) > 0;
    if (has1 && has2) {
      if (n1 < n2) return { p1: true, p2: false };
      if (n2 < n1) return { p1: false, p2: true };
      return { p1: true, p2: true };
    }
    return { p1: has1, p2: has2 };
  };

  /** Indicador puntito amarillo para el score que aporta al Neto del hoyo. */
  const Dot = () => (
    <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-yellow-400" />
  );

  /** Sub-totales (front/back) sumando una propiedad numérica de los hoyos. */
  const sum = (arr: ParejaHoleScore[], key: keyof ParejaHoleScore) =>
    arr.reduce((s, h) => s + (Number(h[key]) || 0), 0);

  /** Renderea una tabla de 9 hoyos con todas las filas que aplican al estilo. */
  const renderSection = (chunk: ParejaHoleScore[], label: string) => (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-primary">
            <th className="px-2 py-1 text-primary-foreground font-bold text-center w-20">{label}</th>
            {chunk.map((h) => (
              <th key={h.hole} className="px-2 py-1 text-primary-foreground font-bold text-center min-w-[34px]">
                {h.hole}
              </th>
            ))}
            <th className="px-2 py-1 text-primary-foreground font-bold text-center min-w-[44px]">Tot</th>
          </tr>
        </thead>
        <tbody>
          {/* Par */}
          <tr className="bg-muted">
            <td className="px-2 py-1 font-semibold text-center">Par</td>
            {chunk.map((h) => (
              <td key={h.hole} className="px-2 py-1 text-center">{h.par}</td>
            ))}
            <td className="px-2 py-1 text-center font-semibold">{sum(chunk, 'par')}</td>
          </tr>

          {/* Vtja (hole difficulty rank) */}
          <tr className="bg-muted/30">
            <td className="px-2 py-1 font-semibold text-center text-muted-foreground">Vtja</td>
            {chunk.map((h) => (
              <td key={h.hole} className="px-2 py-1 text-center text-muted-foreground">{h.ventaja}</td>
            ))}
            <td className="px-2 py-1 text-center text-muted-foreground">-</td>
          </tr>

          {/* Jugador 1 — Gross (siempre visible). En Go Go la etiqueta es genérica "Gross". */}
          <tr>
            <td className="px-2 py-1 font-semibold text-center">
              {isGoGo ? 'Gross' : getInitials(player1.name)}
            </td>
            {chunk.map((h) => {
              const used = getUsedFor(h).p1;
              return (
                <td
                  key={h.hole}
                  className={`relative px-2 py-1 text-center font-bold ${scoreColor(h.p1SO, h.par)}`}
                >
                  {h.p1SO || '-'}
                  {used && <Dot />}
                </td>
              );
            })}
            <td className="px-2 py-1 text-center font-bold">{sum(chunk, 'p1SO')}</td>
          </tr>

          {/* Hcp jugador 1 */}
          <tr className="bg-muted/10">
            <td className="px-2 py-1 text-center text-muted-foreground">
              {isGoGo ? `hcp ${getInitials(player1.name)}` : 'hcp'}
            </td>
            {chunk.map((h) => {
              const used = getUsedFor(h).p1;
              return (
                <td
                  key={h.hole}
                  className="px-2 py-1 text-center text-muted-foreground"
                >
                  {h.p1Hcp}
                </td>
              );
            })}
            <td className="px-2 py-1 text-center text-muted-foreground">{sum(chunk, 'p1Hcp')}</td>
          </tr>

          {/*
           * DEBUG (Go Go): fila extra con el hcp del jugador 2 para verificar
           * que la API está trayendo `arvtjpar` correctamente. Una vez
           * validado se colapsará con la fila anterior en una sola "hcp"
           * que sume ambos jugadores por hoyo.
           */}
          {isGoGo && (
            <tr className="bg-yellow-500/10">
              <td className="px-2 py-1 text-center text-muted-foreground">
                hcp {getInitials(player2.name)}
              </td>
              {chunk.map((h) => (
                <td key={h.hole} className="px-2 py-1 text-center text-muted-foreground">
                  {h.p2Hcp}
                </td>
              ))}
              <td className="px-2 py-1 text-center text-muted-foreground">{sum(chunk, 'p2Hcp')}</td>
            </tr>
          )}

          {/* Jugador 2 — sólo Bola Baja / Suma Scores (Go Go omite por replicar legacy). */}
          {showPartner && (
            <>
              <tr>
                <td className="px-2 py-1 font-semibold text-center">{getInitials(player2.name)}</td>
                {chunk.map((h) => {
                  const used = getUsedFor(h).p2;
                  return (
                    <td
                      key={h.hole}
                      className={`relative px-2 py-1 text-center font-bold ${scoreColor(h.p2SO, h.par)}`}
                    >
                      {h.p2SO || '-'}
                      {used && <Dot />}
                    </td>
                  );
                })}
                <td className="px-2 py-1 text-center font-bold">{sum(chunk, 'p2SO')}</td>
              </tr>
              <tr className="bg-muted/10">
                <td className="px-2 py-1 text-center text-muted-foreground">hcp</td>
                {chunk.map((h) => {
                  const used = getUsedFor(h).p2;
                  return (
                    <td
                      key={h.hole}
                      className="px-2 py-1 text-center text-muted-foreground"
                    >
                      {h.p2Hcp}
                    </td>
                  );
                })}
                <td className="px-2 py-1 text-center text-muted-foreground">{sum(chunk, 'p2Hcp')}</td>
              </tr>
            </>
          )}

          {/*
           * Neto del equipo — h{n}_a en la tabla tarjetas. Esta única fila
           * representa el resultado final del estilojuego del día (Go Go usa
           * el handicap personal, Bola Baja toma la mejor, Suma Scores
           * acumula). Coincide 1:1 con la última fila del PHP legacy.
           */}
          <tr className="bg-primary/15 ring-1 ring-primary/40">
            <td className="px-2 py-1 font-semibold text-center text-muted-foreground">Neto</td>
            {chunk.map((h) => (
              <td key={h.hole} className="px-2 py-1 text-center font-extrabold text-primary">{h.neto || '-'}</td>
            ))}
            <td className="px-2 py-1 text-center font-extrabold text-primary">{sum(chunk, 'neto')}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );

  return (
    <TableRow className="bg-muted/10 hover:bg-muted/10">
      <TableCell colSpan={colSpan} className="p-0">
        <div className="p-4 border-t border-b border-primary/20">
          {/* Header — pareja + fecha + estilo + close */}
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground">{pairLabel}</span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                {roundLabel}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 text-xs font-bold">
                {estilojuego}
              </span>
              {campo && <span className="text-xs text-muted-foreground">Campo: {campo}</span>}
              {fecha && <span className="text-xs text-muted-foreground">Fecha: {fecha}</span>}
            </div>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Jugadores — nombres con logos */}
          <div className="flex items-center gap-4 mb-3 text-sm flex-wrap">
            <div className="flex items-center gap-2">
              {player1.logo && <img src={player1.logo} alt={player1.club} className="h-6 w-auto" />}
              <span className="font-medium">{player1.name}</span>
            </div>
            <span className="text-muted-foreground">/</span>
            <div className="flex items-center gap-2">
              {player2.logo && <img src={player2.logo} alt={player2.club} className="h-6 w-auto" />}
              <span className="font-medium">{player2.name}</span>
            </div>
          </div>

          {/* Secciones OUT / IN */}
          <div className="space-y-3">
            {renderSection(front9, 'OUT')}
            {renderSection(back9, 'IN')}
          </div>

          {/* Totales */}
          <div className="flex justify-end items-baseline gap-6 mt-3 text-sm flex-wrap">
            <span className="text-muted-foreground">
              J1: <strong className="text-foreground">{totals.player1.SO}</strong>
            </span>
            <span className="text-muted-foreground">
              J2: <strong className="text-foreground">{totals.player2.SO}</strong>
            </span>
            <span className="text-muted-foreground">
              Pareja Neto: <strong className="text-primary font-bold">{totals.pair.SA}</strong>
            </span>
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ScorecardParejas;