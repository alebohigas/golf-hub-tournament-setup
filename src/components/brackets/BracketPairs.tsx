/**
 * BracketPairs
 * ----------------------------------------------------------------------------
 * Envuelve las match cards de una columna de bracket agrupándolas en PAREJAS
 * y dibujando la "llave" (conector) que une a los dos matches con el match de
 * la ronda siguiente, tal como se ve en los brackets impresos de Match Play.
 *
 * Los conectores son puramente CSS (`.bracket-pair`, ver src/index.css), así
 * que no requieren medir el DOM y funcionan igual en móvil con scroll lateral.
 *
 * ALINEACIÓN (móvil/tablet incluidos): la columna se maqueta con CSS **grid**
 * de filas `minmax(0, 1fr)` en DOS niveles (parejas y, dentro de cada pareja,
 * los dos slots de card). A diferencia de flex `flex-1` — cuya base mínima es
 * el contenido, por lo que una card con nombre en dos líneas (muy común en
 * pantallas angostas) crecía más que sus hermanas — las filas de un grid `1fr`
 * son SIEMPRE de altura idéntica y se igualan a la fila más alta. Así el punto
 * medio de la llave de una pareja coincide exactamente con el centro de la card
 * de la ronda siguiente en cualquier ancho de pantalla, y como los conectores
 * son CSS absolutos respecto a la pareja, se mantienen alineados también al
 * hacer scroll vertical u horizontal.
 *
 * Props:
 *   - children : las match cards de la ronda, en orden de posición.
 *   - connect  : false en la ÚLTIMA columna (la final) para no dibujar llaves
 *                que apunten a la nada.
 *   - mirrored : true en el lado derecho de layouts bilaterales (la llave se
 *                dibuja hacia la izquierda).
 *   - className: clases extra para el contenedor de la columna.
 */
import { Children, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface BracketPairsProps {
  children: ReactNode;
  connect?: boolean;
  mirrored?: boolean;
  className?: string;
}

const BracketPairs = ({ children, connect = true, mirrored = false, className }: BracketPairsProps) => {
  const items = Children.toArray(children);

  /** Agrupa las cards de dos en dos (la última puede quedar sola). */
  const pairs: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) pairs.push(items.slice(i, i + 2));

  return (
    <div className={cn('flex flex-col flex-1', className)}>
      {pairs.map((pair, idx) => (
        <div
          key={idx}
          className={cn(
            'flex flex-col flex-1',
            connect && 'bracket-pair',
            connect && pair.length < 2 && 'bracket-pair-single',
            connect && mirrored && 'bracket-pair-left',
          )}
        >
          {pair.map((card, cardIdx) => (
            /** Slot de altura uniforme: mantiene la card centrada verticalmente. */
            <div key={cardIdx} className="flex flex-1 flex-col justify-center py-1.5">
              {card}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default BracketPairs;