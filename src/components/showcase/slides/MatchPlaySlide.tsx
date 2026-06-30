/**
 * MatchPlaySlide
 * ----------------------------------------------------------------------------
 * Renderiza el bracket Match Play de una categoría para usarse como slide
 * dentro del rotador `/showcase/rotacion`.
 *
 * - Carga el bracket con useMatchPlayBracket(catid).
 * - Muestra título de la categoría, BracketView del Cuadro Principal (D1) y
 *   — si hay matches en la Consolación — un segundo bloque con D2.
 * - Reutiliza el mismo BracketView de /matchplay para mantener idéntica la
 *   estética (campeón, layout bilateral semis+final, etc.).
 * - El autoscroll lo controla el rotador, así que este slide sólo necesita
 *   pintar contenido en orden vertical.
 */
import { Loader2 } from 'lucide-react';
import { useMatchPlayBracket } from '@/hooks/useMatchPlay';
import BracketView from '@/components/matchplay/BracketView';

interface Props {
  /** Id de la categoría Match Play (ej. "346:001:01"). */
  catid: string;
}

const MatchPlaySlide = ({ catid }: Props) => {
  const { data: bracket, isLoading } = useMatchPlayBracket(catid);

  if (isLoading || !bracket) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const hasD2 = !!bracket.d2?.length;

  return (
    <div className="max-w-7xl mx-auto space-y-10">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold border-b-2 border-primary pb-2">
          Match Play — {bracket.categoryName}
        </h1>
        {bracket.shortName && (
          <p className="text-sm text-muted-foreground mt-1">{bracket.shortName}</p>
        )}
      </div>

      {/* Cuadro principal (D1) — siempre presente */}
      <div>
        {hasD2 && (
          <h2 className="text-lg font-bold uppercase tracking-wide text-primary text-center mb-3">
            Cuadro Principal
          </h2>
        )}
        <BracketView matches={bracket.d1} />
      </div>

      {/* Consolación (D2) — sólo si hay matches */}
      {hasD2 && (
        <div>
          <h2 className="text-lg font-bold uppercase tracking-wide text-primary text-center mb-3">
            Consolación
          </h2>
          <BracketView matches={bracket.d2} />
        </div>
      )}
    </div>
  );
};

export default MatchPlaySlide;