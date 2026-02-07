/**
 * Categories Routes
 * GET /api/categories - All tournament categories with details
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const categoriesRouter = Router();

// ============= Types =============

interface CategoryRow extends RowDataPacket {
  id: string;
  api_cat_id: string;
  name: string;
  short_name: string;
  tee_salida: string;
  rating: number;
  slope: number;
  par: number;
  format: string;
  handicap_min: number;
  handicap_max: number;
  handicap_percentage: string;
  player_count: number;
}

// ============= Routes =============

/** GET / - All active categories */
categoriesRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query<CategoryRow[]>(
      `SELECT id, api_cat_id, name, short_name, tee_salida, rating, slope, par,
              format, handicap_min, handicap_max, handicap_percentage, player_count
       FROM categories WHERE active = 1 ORDER BY id ASC`
    );

    const categories = rows.map(row => ({
      id: row.id,
      apiCatId: row.api_cat_id,
      name: row.name,
      shortName: row.short_name,
      teeSalida: row.tee_salida,
      rating: row.rating,
      slope: row.slope,
      par: row.par,
      format: row.format,
      handicapMin: row.handicap_min,
      handicapMax: row.handicap_max,
      handicapPercentage: row.handicap_percentage,
      playerCount: row.player_count,
    }));

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});
