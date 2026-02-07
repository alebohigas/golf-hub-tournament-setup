/**
 * Players Routes
 * GET /api/players/:catId - Players by category ID
 * Replaces: lista_jug.php?catid=:catId
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const playersRouter = Router();

// ============= Types =============

interface PlayerRow extends RowDataPacket {
  id: string;
  numjugador: string;
  jugador: string;
  logo: string;
  hi: string;
  hc: string;
  hn: string;
}

// ============= Routes =============

/**
 * GET /:catId - Fetch players by category
 * Returns array matching the original PHP format for backward compatibility
 */
playersRouter.get('/:catId', async (req, res) => {
  try {
    const { catId } = req.params;
    const logosBaseUrl = process.env.LOGOS_BASE_URL || 'https://alien2019.speitour.mx/logos';

    const [rows] = await pool.query<PlayerRow[]>(
      `SELECT p.id, p.numjugador, p.jugador, c.logo, p.hi, p.hc, p.hn
       FROM players p
       LEFT JOIN clubs c ON p.club_id = c.id
       WHERE p.category_id = ?
       ORDER BY p.jugador ASC`,
      [catId]
    );

    // Map to frontend-friendly format with full logo URLs
    const players = rows.map(row => ({
      id: row.id,
      numjugador: row.numjugador || '',
      jugador: row.jugador,
      logo: row.logo ? `${logosBaseUrl}/${row.logo}` : '',
      hi: row.hi,
      hc: row.hc,
      hn: row.hn,
    }));

    // Return in same format as original PHP
    res.json({ players });
  } catch (error) {
    console.error('Error fetching players:', error);
    res.status(500).json({ error: 'Failed to fetch players' });
  }
});
