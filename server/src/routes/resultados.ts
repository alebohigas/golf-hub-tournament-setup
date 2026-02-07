/**
 * Resultados Routes
 * GET /api/resultados - All categories with results
 * GET /api/resultados/:categoryId - Results by category
 * GET /api/resultados/:categoryId/:scoringType - Results filtered by scoring type
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const resultadosRouter = Router();

// ============= Types =============

interface ResultRow extends RowDataPacket {
  id: string;
  position: number;
  player_name: string;
  club: string;
  r1: number | null;
  r2: number | null;
  r3: number | null;
  total: number;
  handicap_index: number | null;
  scoring_type: string;
  category_id: string;
  category_name: string;
  short_name: string;
}

// ============= Routes =============

/** GET / - All categories that have results */
resultadosRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query<ResultRow[]>(
      `SELECT r.id, r.position, r.player_name, r.club, 
              r.r1, r.r2, r.r3, r.total, r.handicap_index,
              r.scoring_type, r.category_id,
              c.name as category_name, c.short_name
       FROM results r
       JOIN categories c ON r.category_id = c.id
       ORDER BY c.id ASC, r.scoring_type ASC, r.position ASC`
    );

    // Group by category, then by scoring type
    const categoryMap = new Map<string, {
      categoryId: string;
      categoryName: string;
      shortName: string;
      scoringTypes: Map<string, any[]>;
    }>();

    for (const row of rows) {
      if (!categoryMap.has(row.category_id)) {
        categoryMap.set(row.category_id, {
          categoryId: row.category_id,
          categoryName: row.category_name,
          shortName: row.short_name,
          scoringTypes: new Map(),
        });
      }

      const cat = categoryMap.get(row.category_id)!;
      if (!cat.scoringTypes.has(row.scoring_type)) {
        cat.scoringTypes.set(row.scoring_type, []);
      }

      cat.scoringTypes.get(row.scoring_type)!.push({
        id: row.id,
        position: row.position,
        name: row.player_name,
        club: row.club,
        r1: row.r1,
        r2: row.r2,
        r3: row.r3,
        total: row.total,
        handicapIndex: row.handicap_index,
      });
    }

    // Convert to array format
    const results = Array.from(categoryMap.values()).map(cat => ({
      categoryId: cat.categoryId,
      categoryName: cat.categoryName,
      shortName: cat.shortName,
      scoringTypes: Array.from(cat.scoringTypes.entries()).map(([type, players]) => ({
        scoringType: type,
        players,
      })),
    }));

    res.json(results);
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({ error: 'Failed to fetch results' });
  }
});

/** GET /:categoryId - Results for a specific category */
resultadosRouter.get('/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [rows] = await pool.query<ResultRow[]>(
      `SELECT r.id, r.position, r.player_name, r.club,
              r.r1, r.r2, r.r3, r.total, r.handicap_index,
              r.scoring_type, r.category_id,
              c.name as category_name, c.short_name
       FROM results r
       JOIN categories c ON r.category_id = c.id
       WHERE r.category_id = ?
       ORDER BY r.scoring_type ASC, r.position ASC`,
      [categoryId]
    );

    if (rows.length === 0) {
      return res.json({ categoryId, categoryName: '', shortName: '', scoringTypes: [] });
    }

    // Group by scoring type
    const scoringMap = new Map<string, any[]>();
    for (const row of rows) {
      if (!scoringMap.has(row.scoring_type)) {
        scoringMap.set(row.scoring_type, []);
      }
      scoringMap.get(row.scoring_type)!.push({
        id: row.id,
        position: row.position,
        name: row.player_name,
        club: row.club,
        r1: row.r1,
        r2: row.r2,
        r3: row.r3,
        total: row.total,
        handicapIndex: row.handicap_index,
      });
    }

    res.json({
      categoryId,
      categoryName: rows[0].category_name,
      shortName: rows[0].short_name,
      scoringTypes: Array.from(scoringMap.entries()).map(([type, players]) => ({
        scoringType: type,
        players,
      })),
    });
  } catch (error) {
    console.error('Error fetching category results:', error);
    res.status(500).json({ error: 'Failed to fetch category results' });
  }
});
