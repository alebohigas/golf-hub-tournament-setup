/**
 * Players Data Types & Fallback Helpers
 * Type definitions for players and categories
 * Actual fetching is done via React Query hooks in usePlayersData.ts
 */

// ============= Category Interface =============
/** Represents a tournament category as returned by categories.php */
export interface CategoryDetail {
  id: string;              // categoria_id from DB
  name: string;            // Full category name
  shortName: string;       // Abbreviated name
  system: string;          // Scoring system
  format: string;          // Competition format
  style: string;           // Style descriptor
  hcpMin: number;          // Min handicap index
  hcpMax: number;          // Max handicap index
  percentage: number;      // Handicap percentage applied
  holes: number;           // Holes to play
  cutHoles: number;        // Cut holes
  teeId: string;           // Tee identifier
  gross: number;           // Gross flag
  relatedCat: string;      // Related category ID
  teeColor: string;        // Tee color name (legacy)
  teeName: string;         // Tee name (e.g. "AZULES")
  teeColorName: string;    // Tee color from salidas table
  rating: number | null;   // Course rating
  slope: number | null;    // Course slope
  par: number | null;      // Course par
  playerCount: number;     // Number of registered players
}

// ============= Player Interface =============
/** Represents a player with club logo URL */
export interface Player {
  id: string;
  clubLogo: string;        // Full URL of the club logo image
  name: string;            // Player full name
  handicapIndex: number;   // HI - Handicap Index
  handicapJuego: number;   // HJ - Handicap de Juego
  handicapNeto: number;    // HN - Handicap Neto
  categoryId: string;      // Category ID reference
}
