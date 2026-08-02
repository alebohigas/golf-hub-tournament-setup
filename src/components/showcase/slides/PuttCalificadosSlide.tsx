/**
 * PuttCalificadosSlide
 * ----------------------------------------------------------------------------
 * Renderiza la lista de jugadores ya CLASIFICADOS al bracket de Putt
 * Finales por sexo (M o F). Es la misma lista que aparece bajo el
 * bracket público en /competicion, pero formateada como slide de TV
 * (tipografía grande, zebra striping global vía .showcase-tv).
 *
 * Fuente de datos: usePuttFinales() → data[sexo].qualifiers
 */

import { Card } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { usePuttFinales } from '@/hooks/useBrackets';
import ShowcaseStickyTitle from '@/components/showcase/ShowcaseStickyTitle';

/** Props del slide. */
interface Props {
  /** 'M' = Caballeros, 'F' = Damas, 'A' = bracket único ("Un solo bracket"). */
  sexo: 'M' | 'F' | 'A';
}

/**
 * PuttCalificadosSlide
 * Lista los jugadores que ya entraron al ranking acumulado para el
 * bracket Putt-Finales del sexo indicado, en orden de seed (1..N).
 */
const PuttCalificadosSlide = ({ sexo }: Props) => {
  const { data, isLoading } = usePuttFinales();
  const side = data?.[sexo];
  const qualifiers = side?.qualifiers ?? [];
  /** En modo único (A) no hay división por sexo → título general. */
  const titulo = sexo === 'M' ? 'CABALLEROS' : sexo === 'F' ? 'DAMAS' : 'GENERAL';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!side?.config) {
    return (
      <div className="max-w-6xl mx-auto p-6 rounded bg-card text-muted-foreground text-center">
        El bracket Putt Finales {titulo.toLowerCase()} aún no se ha configurado.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-2 mb-4">
        CALIFICADOS · PUTT FINALES — {titulo}
      </h1>
      <Card className="overflow-visible">
        <ShowcaseStickyTitle
          contentKey={`putt-calificados:${sexo}:${qualifiers.length}:${side.bracket_size ?? ''}`}
          className="bg-primary/10 px-4 py-3 flex flex-wrap items-baseline justify-between gap-2 border-b border-primary/20"
        >
          <div>
            <h4 className="text-lg font-bold text-foreground">
              {qualifiers.length} de {side.bracket_size ?? '—'} cupos
            </h4>
            <p className="text-sm text-muted-foreground">
              Sembrado por la mejor distancia acumulada del torneo
            </p>
          </div>
        </ShowcaseStickyTitle>

        <div className="bg-white">
          <Table viewportSticky className="tournament-table">
            <TableHeader>
              <TableRow className="bg-primary hover:bg-primary">
                <TableHead className="text-primary-foreground font-bold w-16 text-center">#</TableHead>
                <TableHead className="text-primary-foreground font-bold">Jugador</TableHead>
                <TableHead className="text-primary-foreground font-bold w-32">Cat.</TableHead>
                <TableHead className="text-primary-foreground font-bold text-right w-32">Dist</TableHead>
                <TableHead className="text-primary-foreground font-bold text-right w-40">Fecha</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {qualifiers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    Aún no hay jugadores clasificados.
                  </TableCell>
                </TableRow>
              ) : (
                qualifiers.map((q) => (
                  <TableRow key={`${q.rank}-${q.name}`}>
                    <TableCell className="text-center font-bold">{q.rank}</TableCell>
                    <TableCell className="font-medium">{q.name}</TableCell>
                    <TableCell>{q.categoria ?? ''}</TableCell>
                    <TableCell className="text-right font-mono font-bold text-primary">
                      {q.distance != null ? q.distance : ''}
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {q.fecha ?? ''}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
};

export default PuttCalificadosSlide;
