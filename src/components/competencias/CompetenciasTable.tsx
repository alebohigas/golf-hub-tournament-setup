/**
 * CompetenciasTable Component
 * Displays results table for a competition group
 * Supports dynamic columns based on competition type
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Medal } from 'lucide-react';
import { CompetenciaPlayer, ColumnConfig } from '@/data/competenciasConfig';

// ============= Types =============

interface CompetenciasTableProps {
  /** Players to display */
  players: CompetenciaPlayer[];
  /** Column configuration */
  columns: ColumnConfig[];
}

// ============= Helper Functions =============

/** Get medal color by position */
const getPositionStyle = (position: number): string => {
  if (position === 1) return 'text-yellow-500';
  if (position === 2) return 'text-gray-400';
  if (position === 3) return 'text-amber-600';
  return '';
};

/** Format cell value based on format type */
const formatValue = (
  value: unknown, 
  format?: ColumnConfig['format']
): React.ReactNode => {
  if (value === undefined || value === null) return '-';
  
  switch (format) {
    case 'distance':
      return `${value} yds`;
    case 'percentage':
      return `${value}%`;
    case 'number':
      return String(value);
    default:
      return String(value);
  }
};

/** Get cell value from player by key */
const getCellValue = (player: CompetenciaPlayer, key: string): unknown => {
  return player[key as keyof CompetenciaPlayer];
};

// ============= Component =============

/**
 * CompetenciasTable
 * Renders a results table with dynamic columns
 */
const CompetenciasTable = ({ players, columns }: CompetenciasTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        {/* Table Header */}
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            {columns.map((col) => (
              <TableHead 
                key={col.key}
                className={`text-primary-foreground font-bold ${
                  col.align === 'center' ? 'text-center' : 
                  col.align === 'right' ? 'text-right' : 'text-left'
                }`}
                style={{ width: col.width }}
              >
                {col.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        
        {/* Table Body */}
        <TableBody>
          {players.length > 0 ? (
            players.map((player, idx) => (
              <TableRow 
                key={player.id}
                className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'}
              >
                {columns.map((col) => (
                  <TableCell 
                    key={col.key}
                    className={`${
                      col.align === 'center' ? 'text-center' : 
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {/* Special handling for position column with medal */}
                    {col.key === 'position' && col.format === 'medal' ? (
                      <div className="flex items-center justify-center gap-1">
                        {player.position <= 3 && (
                          <Medal className={`h-5 w-5 ${getPositionStyle(player.position)}`} />
                        )}
                        <span className={getPositionStyle(player.position)}>
                          {player.position}
                        </span>
                      </div>
                    ) : col.key === 'clubLogo' ? (
                      /* Club logo display - for now just text, will be image when API ready */
                      <span className="text-xs text-muted-foreground">
                        {player.club}
                      </span>
                    ) : (
                      /* Standard cell rendering */
                      formatValue(getCellValue(player, col.key), col.format)
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell 
                colSpan={columns.length} 
                className="text-center text-muted-foreground py-8"
              >
                No hay resultados disponibles
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CompetenciasTable;
