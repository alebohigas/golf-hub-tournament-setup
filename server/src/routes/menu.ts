/**
 * Menu Routes
 * GET /api/menu - Returns enabled menu items sorted by order
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const menuRouter = Router();

// ============= Types =============

/** Menu item from database */
interface MenuRow extends RowDataPacket {
  id: string;
  label: string;
  path: string;
  enabled: number;  // MySQL tinyint (0/1)
  order_num: number;
}

// ============= Routes =============

/**
 * GET / - Fetch all enabled menu items
 * Returns items sorted by order_num ascending
 */
menuRouter.get('/', async (_req, res) => {
  try {
    const [rows] = await pool.query<MenuRow[]>(
      'SELECT id, label, path, enabled, order_num FROM menu_items WHERE enabled = 1 ORDER BY order_num ASC'
    );

    const items = rows.map(row => ({
      id: row.id,
      label: row.label,
      path: row.path,
      enabled: row.enabled === 1,
      order: row.order_num,
    }));

    res.json(items);
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});
