/**
 * CompetenciasTable Component
 * Displays results table for a competition group
 * Supports dynamic columns based on competition type
 * Includes search functionality to find players by name
 */

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Medal, Search, X } from 'lucide-react';
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

/** Normalize text for search (removes accents and lowercases) */
const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// ============= Component =============

/**
 * CompetenciasTable
 * Renders a results table with dynamic columns and name search
 */
const CompetenciasTable = ({ players, columns }: CompetenciasTableProps) => {
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Filter players based on search query
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    
    const normalizedQuery = normalizeText(searchQuery);
    return players.filter(player => 
      normalizeText(player.name).includes(normalizedQuery)
    );
  }, [players, searchQuery]);

  // Clear search handler
  const handleClearSearch = () => setSearchQuery('');

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="px-4 pt-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Limpiar búsqueda"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {/* Search results count */}
        {searchQuery && (
          <p className="text-sm text-muted-foreground mt-2">
            {filteredPlayers.length} resultado{filteredPlayers.length !== 1 ? 's' : ''} encontrado{filteredPlayers.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results Table */}
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
            {filteredPlayers.length > 0 ? (
              filteredPlayers.map((player, idx) => (
                <TableRow 
                  key={player.id}
                  className={`${idx % 2 === 0 ? 'bg-background' : 'bg-muted/30'} ${
                    searchQuery && normalizeText(player.name).includes(normalizeText(searchQuery))
                      ? 'ring-2 ring-primary/50 ring-inset'
                      : ''
                  }`}
                >
                  {columns.map((col) => (
                    <TableCell 
                      key={col.key}
                      className={`${
                        col.key === 'clubLogo' ? 'p-1 text-center align-middle' :
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
                        /* Club logo image - separate column, always left of name */
                        player.clubLogo ? (
                          <img
                            src={player.clubLogo}
                            alt="Club logo"
                            className="w-auto object-contain rounded inline-block"
                            style={{ height: '2.25rem' }}
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
                  {searchQuery 
                    ? `No se encontró "${searchQuery}"`
                    : 'No hay resultados disponibles'
                  }
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default CompetenciasTable;
