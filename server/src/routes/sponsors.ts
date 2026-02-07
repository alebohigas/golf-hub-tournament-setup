/**
 * Sponsors Routes
 * GET /api/sponsors - Returns all active sponsors with logo URLs
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const sponsorsRouter = Router();

// ============= Types =============

/** Sponsor row from database */
interface SponsorRow extends RowDataPacket {
  id: string;
  name: string;
  logo_url: string;
  website_url: string | null;
  order_num: number;
}

// ============= Routes =============

/**
 * GET / - Fetch all active sponsors
 * Logo URLs are absolute paths served from the logos directory
 */
sponsorsRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query<SponsorRow[]>(
      'SELECT id, name, logo_url, website_url, order_num FROM sponsors WHERE active = 1 ORDER BY order_num ASC'
    );

    const sponsors = rows.map(row => ({
      id: row.id,
      name: row.name,
      logoUrl: row.logo_url,
      websiteUrl: row.website_url,
    }));

    res.json(sponsors);
  } catch (error) {
    console.error('Error fetching sponsors:', error);
    res.status(500).json({ error: 'Failed to fetch sponsors' });
  }
});
