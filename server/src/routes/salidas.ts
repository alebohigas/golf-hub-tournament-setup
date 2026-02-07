/**
 * Salidas (Tee Times) Routes
 * GET /api/salidas - All days summary
 * GET /api/salidas/:dayId - Foursomes for a specific day
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const salidasRouter = Router();

// ============= Types =============

interface DaySummaryRow extends RowDataPacket {
  day_id: string;
  day_name: string;
  date: string;
  foursome_count: number;
  player_count: number;
}

interface FoursomeRow extends RowDataPacket {
  foursome_id: string;
  hole: number;
  time: string;
  category_id: string;
  category_name: string;
  player_id: string;
  player_name: string;
  club: string;
  club_logo: string | null;
  score: number | null;
  handicap_index: number;
}

// ============= Routes =============

/** GET / - Days summary with counts */
salidasRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query<DaySummaryRow[]>(
      `SELECT d.day_id, d.day_name, d.date,
              COUNT(DISTINCT f.id) as foursome_count,
              COUNT(fp.player_id) as player_count
       FROM tournament_days d
       LEFT JOIN foursomes f ON d.day_id = f.day_id
       LEFT JOIN foursome_players fp ON f.id = fp.foursome_id
       GROUP BY d.day_id, d.day_name, d.date
       ORDER BY d.day_id ASC`
    );

    const days = rows.map(row => ({
      dayId: row.day_id,
      dayName: row.day_name,
      date: row.date,
      foursomeCount: row.foursome_count,
      playerCount: row.player_count,
    }));

    res.json(days);
  } catch (error) {
    console.error('Error fetching salidas:', error);
    res.status(500).json({ error: 'Failed to fetch tee times' });
  }
});

/** GET /:dayId - Detailed foursomes for a day */
salidasRouter.get('/:dayId', async (req, res) => {
  try {
    const { dayId } = req.params;
    const logosBaseUrl = process.env.LOGOS_BASE_URL || 'https://alien2019.speitour.mx/logos';

    const [rows] = await pool.query<FoursomeRow[]>(
      `SELECT f.id as foursome_id, f.hole, f.time,
              f.category_id, c.name as category_name,
              fp.player_id, p.jugador as player_name, 
              cl.name as club, cl.logo as club_logo,
              fp.score, p.hi as handicap_index
       FROM foursomes f
       JOIN categories c ON f.category_id = c.id
       JOIN foursome_players fp ON f.id = fp.foursome_id
       JOIN players p ON fp.player_id = p.id
       LEFT JOIN clubs cl ON p.club_id = cl.id
       WHERE f.day_id = ?
       ORDER BY c.id ASC, f.time ASC, fp.position ASC`,
      [dayId]
    );

    // Group by category, then by foursome
    const categoryMap = new Map<string, {
      categoryId: string;
      categoryName: string;
      foursomes: Map<string, {
        id: string;
        hole: number;
        time: string;
        players: any[];
      }>;
    }>();

    for (const row of rows) {
      if (!categoryMap.has(row.category_id)) {
        categoryMap.set(row.category_id, {
          categoryId: row.category_id,
          categoryName: row.category_name,
          foursomes: new Map(),
        });
      }

      const cat = categoryMap.get(row.category_id)!;
      if (!cat.foursomes.has(row.foursome_id)) {
        cat.foursomes.set(row.foursome_id, {
          id: row.foursome_id,
          hole: row.hole,
          time: row.time,
          players: [],
        });
      }

      cat.foursomes.get(row.foursome_id)!.players.push({
        id: row.player_id,
        name: row.player_name,
        club: row.club,
        clubLogo: row.club_logo ? `${logosBaseUrl}/${row.club_logo}` : undefined,
        score: row.score,
        handicapIndex: parseFloat(String(row.handicap_index)) || 0,
      });
    }

    // Convert maps to arrays
    const categories = Array.from(categoryMap.values()).map(cat => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      foursomes: Array.from(cat.foursomes.values()),
    }));

    res.json({
      dayId,
      categories,
    });
  } catch (error) {
    console.error('Error fetching salidas for day:', error);
    res.status(500).json({ error: 'Failed to fetch tee times for day' });
  }
});
