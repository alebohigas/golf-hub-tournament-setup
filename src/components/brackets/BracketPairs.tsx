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
 * ALINEACIÓN: cada match card se monta dentro de un "slot" `flex-1` centrado,
 * de modo que TODAS las cards de una ronda quedan en slots de idéntica altura
 * (independientemente de que un nombre ocupe una o dos líneas). Así el centro
 * de la card de la ronda N+1 coincide exactamente con el punto medio de la
 * llave de su pareja en la ronda N — sin esto, `justify-around` desplazaba los
 * conectores cuando las cards tenían alturas distintas.
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