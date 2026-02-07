/**
 * Competición Routes
 * GET /api/competicion - All competition types with winners
 * GET /api/competicion/:id - Specific competition detail
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const competicionRouter = Router();

// ============= Types =============

interface CompetitionRow extends RowDataPacket {
  id: string;
  name: string;
  short_name: string;
  description: string;
  icon: string;
  max_winners_per_group: number;
}

interface WinnerRow extends RowDataPacket {
  id: string;
  competition_id: string;
  group_id: string;
  group_name: string;
  player_id: string;
  player_name: string;
  club: string;
  result: string | null;
  position: number;
}

// ============= Routes =============

/** GET / - All competitions */
competicionRouter.get('/', async (_req, res) => {
  try {
    const [competitions] = await pool.query<CompetitionRow[]>(
      'SELECT id, name, short_name, description, icon, max_winners_per_group FROM competitions WHERE active = 1 ORDER BY order_num ASC'
    );

    const [winners] = await pool.query<WinnerRow[]>(
      `SELECT w.id, w.competition_id, w.group_id, cg.name as group_name,
              w.player_id, w.player_name, w.club, w.result, w.position
       FROM competition_winners w
       JOIN competition_groups cg ON w.group_id = cg.id
       ORDER BY w.competition_id, w.group_id, w.position ASC`
    );

    // Build nested structure
    const result = competitions.map(comp => {
      const compWinners = winners.filter(w => w.competition_id === comp.id);

      // Group winners by group
      const groupMap = new Map<string, { id: string; name: string; winners: any[] }>();
      for (const w of compWinners) {
        if (!groupMap.has(w.group_id)) {
          groupMap.set(w.group_id, { id: w.group_id, name: w.group_name, winners: [] });
        }
        groupMap.get(w.group_id)!.winners.push({
          id: w.id,
          playerId: w.player_id,
          playerName: w.player_name,
          club: w.club,
          result: w.result,
        });
      }

      return {
        id: comp.id,
        name: comp.name,
        shortName: comp.short_name,
        description: comp.description,
        icon: comp.icon,
        maxWinnersPerGroup: comp.max_winners_per_group,
        categoryGroups: Array.from(groupMap.values()),
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching competitions:', error);
    res.status(500).json({ error: 'Failed to fetch competitions' });
  }
});

/** GET /:id - Single competition detail */
competicionRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [competitions] = await pool.query<CompetitionRow[]>(
      'SELECT id, name, short_name, description, icon, max_winners_per_group FROM competitions WHERE id = ?',
      [id]
    );

    if (competitions.length === 0) {
      return res.status(404).json({ error: 'Competition not found' });
    }

    const comp = competitions[0];

    const [winners] = await pool.query<WinnerRow[]>(
      `SELECT w.id, w.competition_id, w.group_id, cg.name as group_name,
              w.player_id, w.player_name, w.club, w.result, w.position
       FROM competition_winners w
       JOIN competition_groups cg ON w.group_id = cg.id
       WHERE w.competition_id = ?
       ORDER BY w.group_id, w.position ASC`,
      [id]
    );

    const groupMap = new Map<string, { id: string; name: string; winners: any[] }>();
    for (const w of winners) {
      if (!groupMap.has(w.group_id)) {
        groupMap.set(w.group_id, { id: w.group_id, name: w.group_name, winners: [] });
      }
      groupMap.get(w.group_id)!.winners.push({
        id: w.id,
        playerId: w.player_id,
        playerName: w.player_name,
        club: w.club,
        result: w.result,
      });
    }

    res.json({
      id: comp.id,
      name: comp.name,
      shortName: comp.short_name,
      description: comp.description,
      icon: comp.icon,
      maxWinnersPerGroup: comp.max_winners_per_group,
      categoryGroups: Array.from(groupMap.values()),
    });
  } catch (error) {
    console.error('Error fetching competition:', error);
    res.status(500).json({ error: 'Failed to fetch competition' });
  }
});
