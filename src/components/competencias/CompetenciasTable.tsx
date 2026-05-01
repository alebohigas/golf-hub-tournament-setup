/**
 * CompetenciasTable Component
 * Displays results table for a competition group
 * Supports dynamic columns based on competition type
 * No search — search lives on the Premios page
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
      return `${value} mts`;
    case 'yards':
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
    <div className="overflow-x-auto bg-white rounded-lg">
      <Table className="tournament-table">
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
            players.map((player) => (
              <TableRow 
                key={player.id}
                className="bg-white"
              >
                {columns.map((col) => (
                  <TableCell 
                    key={col.key}
                    className={`${
                      col.key === 'clubLogo' ? 'p-1 text-center align-middle' :
                      col.key === 'name' ? 'player-name-cell' :
                      col.align === 'center' ? 'text-center' : 
                      col.align === 'right' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {/* Position column - number only */}
                    {col.key === 'position' && col.format === 'medal' ? (
                      <span>{player.position}</span>
                    ) : col.key === 'clubLogo' ? (
                      /* Club logo image */
                      player.clubLogo ? (
                        <img
                          src={player.clubLogo}
                          alt="Club logo"
                          className="w-auto object-contain rounded inline-block"
                          // Height reduced 5% (2.25rem → 2.1375rem) for tighter table rows
                          style={{ height: '2.1375rem' }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23166534" rx="4"/><text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="9" font-family="sans-serif">Club</text></svg>')}`;
                          }}
                        />
                      ) : (
                        <span className="text-xs text-muted-foreground">{player.club}</span>
                      )
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
