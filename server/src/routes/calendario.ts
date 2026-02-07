/**
 * Calendario Routes
 * GET /api/calendario/days - Tournament days
 * GET /api/calendario/schedules - Category schedules
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const calendarioRouter = Router();

// ============= Types =============

interface DayRow extends RowDataPacket {
  day_id: string;
  day_name: string;
  short_name: string;
  date: string;
}

interface ScheduleRow extends RowDataPacket {
  category_id: string;
  category_name: string;
  short_name: string;
  day_id: string;
  time_slot: string | null;  // 'AM', 'PM', or NULL
}

// ============= Routes =============

/** GET /days - All tournament days */
calendarioRouter.get('/days', async (_req, res) => {
  try {
    const [rows] = await pool.query<DayRow[]>(
      'SELECT day_id, day_name, short_name, date FROM tournament_days ORDER BY day_id ASC'
    );

    const days = rows.map(row => ({
      dayId: row.day_id,
      dayName: row.day_name,
      shortName: row.short_name,
      date: row.date,
    }));

    res.json(days);
  } catch (error) {
    console.error('Error fetching days:', error);
    res.status(500).json({ error: 'Failed to fetch tournament days' });
  }
});

/** GET /schedules - Category schedules (which category plays when) */
calendarioRouter.get('/schedules', async (_req, res) => {
  try {
    const [rows] = await pool.query<ScheduleRow[]>(
      `SELECT cs.category_id, c.name as category_name, c.short_name,
              cs.day_id, cs.time_slot
       FROM category_schedules cs
       JOIN categories c ON cs.category_id = c.id
       ORDER BY c.id ASC, cs.day_id ASC`
    );

    // Group by category, build schedule object
    const scheduleMap = new Map<string, {
      categoryId: string;
      categoryName: string;
      shortName: string;
      schedule: Record<string, string | null>;
    }>();

    for (const row of rows) {
      if (!scheduleMap.has(row.category_id)) {
        scheduleMap.set(row.category_id, {
          categoryId: row.category_id,
          categoryName: row.category_name,
          shortName: row.short_name,
          schedule: {},
        });
      }
      scheduleMap.get(row.category_id)!.schedule[row.day_id] = row.time_slot;
    }

    res.json(Array.from(scheduleMap.values()));
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ error: 'Failed to fetch category schedules' });
  }
});
