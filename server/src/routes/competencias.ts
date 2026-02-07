/**
 * Competencias Routes
 * GET /api/competencias - All competition types (approach, driver, etc.)
 * GET /api/competencias/:id - Single competition with groups
 * GET /api/competencias/:id/groups/:groupId - Group players
 */

import { Router } from 'express';
import { pool } from '../db';
import { RowDataPacket } from 'mysql2';

export const competenciasRouter = Router();

// ============= Types =============

interface CompetenciaRow extends RowDataPacket {
  id: string;
  name: string;
  short_name: string;
  description: string | null;
  icon: string;
  order_num: number;
  enabled: number;
}

interface ColumnRow extends RowDataPacket {
  competencia_id: string;
  col_key: string;
  label: string;
  align: string | null;
  width: string | null;
  format: string | null;
  order_num: number;
}

interface GroupRow extends RowDataPacket {
  id: string;
  competencia_id: string;
  name: string;
  short_name: string;
  description: string | null;
  hoyo: number | null;
  max_players: number;
  last_updated: string | null;
}

interface PlayerRow extends RowDataPacket {
  id: string;
  group_id: string;
  position: number;
  name: string;
  club: string;
  club_logo: string | null;
  distance: number | null;
  precision_val: number | null;
  score: number | null;
  round: number | null;
  date: string | null;
}

// ============= Routes =============

/** GET / - All enabled competencias with groups summary */
competenciasRouter.get('/', async (_req, res) => {
  try {
    const [competencias] = await pool.query<CompetenciaRow[]>(
      'SELECT id, name, short_name, description, icon, order_num, enabled FROM competencias WHERE enabled = 1 ORDER BY order_num ASC'
    );

    const [columns] = await pool.query<ColumnRow[]>(
      'SELECT competencia_id, col_key, label, align, width, format, order_num FROM competencia_columns ORDER BY competencia_id, order_num ASC'
    );

    const [groups] = await pool.query<GroupRow[]>(
      'SELECT id, competencia_id, name, short_name, description, hoyo, max_players, last_updated FROM competencia_groups ORDER BY competencia_id, id ASC'
    );

    // Build nested structure
    const result = competencias.map(comp => {
      const compColumns = columns
        .filter(c => c.competencia_id === comp.id)
        .map(c => ({
          key: c.col_key,
          label: c.label,
          align: c.align || undefined,
          width: c.width || undefined,
          format: c.format || undefined,
        }));

      const compGroups = groups
        .filter(g => g.competencia_id === comp.id)
        .map(g => ({
          id: g.id,
          name: g.name,
          shortName: g.short_name,
          description: g.description || undefined,
          hoyo: g.hoyo || undefined,
          maxPlayers: g.max_players,
          players: [], // Don't include players in list view
          lastUpdated: g.last_updated || undefined,
        }));

      return {
        id: comp.id,
        name: comp.name,
        shortName: comp.short_name,
        description: comp.description || undefined,
        icon: comp.icon,
        columns: compColumns,
        groups: compGroups,
        order: comp.order_num,
        enabled: comp.enabled === 1,
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Error fetching competencias:', error);
    res.status(500).json({ error: 'Failed to fetch competencias' });
  }
});

/** GET /:id - Single competencia with full groups */
competenciasRouter.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [competencias] = await pool.query<CompetenciaRow[]>(
      'SELECT id, name, short_name, description, icon, order_num, enabled FROM competencias WHERE id = ?',
      [id]
    );

    if (competencias.length === 0) {
      return res.status(404).json({ error: 'Competencia not found' });
    }

    const comp = competencias[0];

    const [columns] = await pool.query<ColumnRow[]>(
      'SELECT col_key, label, align, width, format, order_num FROM competencia_columns WHERE competencia_id = ? ORDER BY order_num ASC',
      [id]
    );

    const [groups] = await pool.query<GroupRow[]>(
      'SELECT id, name, short_name, description, hoyo, max_players, last_updated FROM competencia_groups WHERE competencia_id = ? ORDER BY id ASC',
      [id]
    );

    res.json({
      id: comp.id,
      name: comp.name,
      shortName: comp.short_name,
      description: comp.description || undefined,
      icon: comp.icon,
      columns: columns.map(c => ({
        key: c.col_key,
        label: c.label,
        align: c.align || undefined,
        width: c.width || undefined,
        format: c.format || undefined,
      })),
      groups: groups.map(g => ({
        id: g.id,
        name: g.name,
        shortName: g.short_name,
        description: g.description || undefined,
        hoyo: g.hoyo || undefined,
        maxPlayers: g.max_players,
        players: [],
        lastUpdated: g.last_updated || undefined,
      })),
      order: comp.order_num,
      enabled: comp.enabled === 1,
    });
  } catch (error) {
    console.error('Error fetching competencia:', error);
    res.status(500).json({ error: 'Failed to fetch competencia' });
  }
});

/** GET /:id/groups/:groupId - Players for a specific group */
competenciasRouter.get('/:id/groups/:groupId', async (req, res) => {
  try {
    const { id, groupId } = req.params;
    const logosBaseUrl = process.env.LOGOS_BASE_URL || 'https://alien2019.speitour.mx/logos';

    const [players] = await pool.query<PlayerRow[]>(
      `SELECT cp.id, cp.group_id, cp.position, cp.name, cp.club, 
              cl.logo as club_logo,
              cp.distance, cp.precision_val, cp.score, cp.round, cp.date
       FROM competencia_players cp
       LEFT JOIN clubs cl ON cp.club = cl.name
       WHERE cp.group_id = ?
       ORDER BY cp.position ASC`,
      [groupId]
    );

    const result = players.map(p => ({
      id: p.id,
      position: p.position,
      name: p.name,
      club: p.club,
      clubLogo: p.club_logo ? `${logosBaseUrl}/${p.club_logo}` : undefined,
      distance: p.distance || undefined,
      precision: p.precision_val || undefined,
      score: p.score || undefined,
      round: p.round || undefined,
      date: p.date || undefined,
    }));

    res.json(result);
  } catch (error) {
    console.error('Error fetching group players:', error);
    res.status(500).json({ error: 'Failed to fetch group players' });
  }
});
