/**
 * ResultadosSlide
 * ----------------------------------------------------------------------------
 * Slide del rotador `/showcase/rotacion` que renderiza el leaderboard clásico
 * de una categoría de /resultados para un tipo de puntuación (NETO o GROSS).
 *
 * - Fetch: useCategoryResults(catid, true, scoringType) — mismo hook que la
 *   página /resultados; devuelve rondas dinámicas r1..rN + total.
 * - Render: tabla simplificada (Pos · Club · Jugador · R1..Rn · Total) sin
 *   scorecards expandibles ni cutPlayers, optimizada para TV/rotación.
 * - Soporta PAREJAS mostrando ambos integrantes apilados con rowSpan igual
 *   que /resultados.
 */
import { Loader2, Medal } from 'lucide-react';
import { useCategoryResults } from '@/hooks/useResultadosData';
import { Fragment } from 'react';

interface Props {
  /** Category id (puede contener ':' internos). */
  catid: string;
  /** NETO o GROSS — controla `gross` param del endpoint. */
  scoringType: 'NETO' | 'GROSS';
}

/** Color helper para medallas 1º/2º/3º. */
const medalColor = (pos: number) =>
  pos === 1 ? 'text-yellow-500'
  : pos === 2 ? 'text-gray-400'
  : 'text-amber-600';

const ResultadosSlide = ({ catid, scoringType }: Props) => {
  const { data: cat, isLoading } = useCategoryResults(catid, true, scoringType);

  if (isLoading || !cat) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // El hook mete los jugadores dentro del primer scoringTypes[]; buscamos el
  // que corresponde a la selección del slide.
  const bucket =
    cat.scoringTypes?.find((s) => s.scoringType === scoringType)
    ?? cat.scoringTypes?.[0];
  const players = bucket?.players ?? [];
  const rounds = cat.days || [];
  const medalCount = scoringType === 'GROSS'
    ? (cat.medalCountGross ?? 1)
    : (cat.medalCountNeto ?? cat.medalCount ?? 3);

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      {/* Título de categoría sticky durante el autoscroll del rotador. */}
      <div className="showcase-prize-sticky text-center py-3">
        <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-2">
          {cat.categoryName}
        </h1>
        <span
          className={`inline-block mt-3 px-4 py-1 rounded-full text-white font-semibold ${
            scoringType === 'NETO' ? 'bg-sky-500' : 'bg-green-600'
          }`}
        >
          {scoringType}
        </span>
      </div>

      {/* Sin overflow-x-auto — rompe el sticky del <thead> contra el viewport. */}
      <div className="bg-white rounded-md border border-border">
        <table className="w-full text-sm tournament-table">
          <thead>
            <tr className="bg-primary text-primary-foreground">
              <th className="p-2 text-left w-16">Pos</th>
              <th className="p-2 text-center">Club</th>
              <th className="p-2 text-left">Jugador</th>
              {rounds.map((_, i) => (
                <th key={i} className="p-2 text-center">R{i + 1}</th>
              ))}
              <th className="p-2 text-center">Total</th>
            </tr>
          </thead>
          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={3 + rounds.length + 1} className="p-6 text-center text-muted-foreground">
                  Sin resultados aún.
                </td>
              </tr>
            ) : players.map((p) => {
              const isPair = !!(cat.isParejas && p.partner);
              const rowSpan = isPair ? 2 : 1;
              return (
                <Fragment key={p.id}>
                  <tr className="border-t border-border">
                    <td rowSpan={rowSpan} className="p-2 font-semibold align-middle">
                      <div className="flex items-center gap-1">
                        {p.position <= medalCount && (
                          <Medal className={`h-4 w-4 ${medalColor(p.position)}`} />
                        )}
                        <span className={p.position <= medalCount ? medalColor(p.position) : ''}>
                          {p.position}
                        </span>
                      </div>
                    </td>
                    <td className="p-1 text-center align-middle">
                      {p.clubLogo ? (
                        <img src={p.clubLogo} alt="" className="h-8 inline-block object-contain" />
                      ) : <span className="text-xs">{p.club}</span>}
                    </td>
                    <td className="p-2 align-middle font-medium">{p.name}</td>
                    {rounds.map((_, i) => (
                      <td key={i} rowSpan={rowSpan} className="p-2 text-center align-middle">
                        {p[`r${i + 1}`] ?? '-'}
                      </td>
                    ))}
                    <td rowSpan={rowSpan} className="p-2 text-center font-bold text-primary text-lg align-middle">
                      {p.total ?? 0}
                    </td>
                  </tr>
                  {isPair && (
                    <tr className="border-b border-border">
                      <td className="p-1 text-center align-middle">
                        {p.clubLogo2 ? (
                          <img src={p.clubLogo2} alt="" className="h-8 inline-block object-contain" />
                        ) : <span className="text-xs">—</span>}
                      </td>
                      <td className="p-2 align-middle font-medium">{p.partner}</td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultadosSlide;