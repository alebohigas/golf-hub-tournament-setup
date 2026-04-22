/**
 * CategoryTable
 * Auto-populated from /api/categories.php (table `categorias`).
 *
 * Column mapping (per product spec):
 *  - CATEGORÍAS       → categoria.categoria (name)
 *  - RANGO DE HÁNDICAP → "{hcpIdxMin} A {hcpIdxMax}" with leading "+" if negative
 *  - FORMATO           → categoria.sistema
 *  - VENTAJAS          → "SIN VENTAJA" if porcentaje is 0 or 100, otherwise "{porcentaje}%"
 *  - CUPO              → "∞" if maxjugadores = 99, otherwise the number
 *  - RONDA             → "{hoyosxronda} HOYOS" if available, blank otherwise
 *  - MARCAS            → tee color name from `salidas` (teeColorName), blank if missing
 */

import { useCategories } from '@/hooks/usePlayersData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/** Visual swatch colors per tee marker name (matches DB `salidas.color` / tee name) */
const teeMarkerColors: Record<string, string> = {
  AZULES: 'bg-blue-500',
  AZUL: 'bg-blue-500',
  BLANCAS: 'bg-gray-100 border border-gray-300',
  BLANCA: 'bg-gray-100 border border-gray-300',
  DORADAS: 'bg-amber-400',
  DORADA: 'bg-amber-400',
  AMARILLAS: 'bg-yellow-300',
  AMARILLA: 'bg-yellow-300',
  ROJAS: 'bg-red-500',
  ROJA: 'bg-red-500',
  NEGRAS: 'bg-black',
  NEGRA: 'bg-black',
  VERDES: 'bg-green-600',
  VERDE: 'bg-green-600',
};

/** Format the handicap range with proper sign (e.g. "+5.0 A 1.2") */
const formatHcpRange = (min: number, max: number): string => {
  const fmt = (n: number) => {
    if (n === 0) return '0';
    // Negative HCP indices in golf are written with a leading "+"
    if (n < 0) return `+${Math.abs(n)}`;
    return `${n}`;
  };
  return `${fmt(min)} A ${fmt(max)}`;
};

/** Format the "VENTAJAS" column according to porcentaje rules */
const formatVentajas = (porcentaje: number): string => {
  if (!porcentaje || porcentaje === 0 || porcentaje === 100) return 'SIN VENTAJA';
  return `${porcentaje}%`;
};

/** Format the "CUPO" column (99 ⇒ ∞, anything else ⇒ number) */
const formatCupo = (maxPlayers?: number): string => {
  if (!maxPlayers || maxPlayers === 99) return '∞';
  return String(maxPlayers);
};

/** Resolve the tee name to display in the "MARCAS" column */
const resolveTeeName = (teeColorName?: string, teeName?: string): string => {
  return (teeColorName || teeName || '').toUpperCase();
};

const CategoryTable = () => {
  const { data: categories = [], isLoading } = useCategories();

  return (
    <div className="overflow-x-auto rounded-xl border border-border shadow-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            <TableHead className="text-primary-foreground font-semibold">CATEGORÍAS</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">RANGO DE HÁNDICAP</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">FORMATO</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">VENTAJAS</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">CUPO</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">RONDA</TableHead>
            <TableHead className="text-primary-foreground font-semibold text-center">MARCAS</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                Cargando categorías…
              </TableCell>
            </TableRow>
          )}
          {!isLoading && categories.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                No hay categorías registradas para este torneo.
              </TableCell>
            </TableRow>
          )}
          {categories.map((category, index) => {
            const sistema = (category.system || '').toUpperCase();
            const isStrokePlay = sistema.includes('STROKE');
            const teeName = resolveTeeName(category.teeColorName, category.teeName);
            const ronda = category.holesPerRound
              ? `${category.holesPerRound} HOYOS`
              : '';
            return (
              <TableRow
                key={category.id}
                className={cn(
                  'transition-colors',
                  index % 2 === 0 ? 'bg-card' : 'bg-muted/30'
                )}
              >
                <TableCell className="font-medium text-foreground">
                  {category.name}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {formatHcpRange(category.hcpMin, category.hcpMax)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant={isStrokePlay ? 'default' : 'secondary'}
                    className="font-normal"
                  >
                    {sistema || '—'}
                  </Badge>
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {formatVentajas(category.percentage)}
                </TableCell>
                <TableCell className="text-center font-medium text-foreground">
                  {formatCupo(category.maxPlayers)}
                </TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {ronda}
                </TableCell>
                <TableCell className="text-center">
                  {teeName ? (
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full',
                          teeMarkerColors[teeName] || 'bg-muted border border-border'
                        )}
                      />
                      <span className="text-sm text-muted-foreground">{teeName}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default CategoryTable;
