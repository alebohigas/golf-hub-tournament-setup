/**
 * Tournament Routes
 * GET /api/tournament - Tournament info
 * GET /api/tournament/stats - Tournament statistics
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const tournamentRouter = Router();

// ============= Types =============

interface TournamentRow extends RowDataPacket {
  id: string;
  name: string;
  logo_url: string;
  hero_image_url: string;
  start_date: string;
  end_date: string;
  venue: string;
  phone: string;
}

interface StatsRow extends RowDataPacket {
  total_participants: number;
  holes: number;
  categories: number;
  years_history: number;
}

// ============= Routes =============

/** GET / - Tournament general info */
tournamentRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query<TournamentRow[]>(
      'SELECT id, name, logo_url, hero_image_url, start_date, end_date, venue, phone FROM tournament LIMIT 1'
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Tournament not found' });
    }

    const t = rows[0];
    res.json({
      id: t.id,
      name: t.name,
      logoUrl: t.logo_url,
      heroImageUrl: t.hero_image_url,
      startDate: t.start_date,
      endDate: t.end_date,
      venue: t.venue,
      phone: t.phone,
    });
  } catch (error) {
    console.error('Error fetching tournament:', error);
    res.status(500).json({ error: 'Failed to fetch tournament info' });
  }
});

/** GET /stats - Tournament statistics (calculated from DB) */
tournamentRouter.get('/stats', async (_req, res) => {
  try {
    // Calculate stats from actual data
    const [rows] = await pool.query<StatsRow[]>(`
      SELECT 
        (SELECT COUNT(*) FROM players WHERE active = 1) as total_participants,
        (SELECT holes FROM tournament LIMIT 1) as holes,
        (SELECT COUNT(*) FROM categories WHERE active = 1) as categories,
        (SELECT years_history FROM tournament LIMIT 1) as years_history
    `);

    const stats = rows[0];
    res.json({
      totalParticipants: stats.total_participants,
      holes: stats.holes,
      categories: stats.categories,
      yearsHistory: stats.years_history,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch tournament stats' });
  }
});
