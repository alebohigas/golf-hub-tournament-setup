/**
 * Eventos Routes
 * GET /api/eventos - All event days with schedule
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const eventosRouter = Router();

// ============= Types =============

interface EventRow extends RowDataPacket {
  id: string;
  day_date: string;
  day_name: string;
  time: string;
  event_name: string;
  order_num: number;
}

interface SorteoRow extends RowDataPacket {
  day_date: string;
  sorteo_name: string;
}

// ============= Routes =============

/** GET / - All event days with events and sorteos */
eventosRouter.get('/', async (_req, res) => {
  try {
    const [events] = await pool.query<EventRow[]>(
      'SELECT id, day_date, day_name, time, event_name, order_num FROM events ORDER BY day_date ASC, order_num ASC'
    );

    const [sorteos] = await pool.query<SorteoRow[]>(
      'SELECT day_date, sorteo_name FROM event_sorteos ORDER BY day_date ASC'
    );

    // Group by day
    const dayMap = new Map<string, {
      date: string;
      dayName: string;
      events: { time: string; event: string }[];
      sorteos: string[];
    }>();

    for (const ev of events) {
      if (!dayMap.has(ev.day_date)) {
        dayMap.set(ev.day_date, {
          date: ev.day_date,
          dayName: ev.day_name,
          events: [],
          sorteos: [],
        });
      }
      dayMap.get(ev.day_date)!.events.push({
        time: ev.time,
        event: ev.event_name,
      });
    }

    for (const s of sorteos) {
      if (dayMap.has(s.day_date)) {
        dayMap.get(s.day_date)!.sorteos.push(s.sorteo_name);
      }
    }

    res.json(Array.from(dayMap.values()));
  } catch (error) {
    console.error('Error fetching eventos:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});
