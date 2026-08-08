-- ============================================================
-- Migration: Add historial_config column to site_config
-- Purpose : Per-domain configuration for the public /historial page.
--           Stores up to 5 previous editions as JSON:
--             {"years":[{"year":2025,"torneoId":"354","label":"..."}]}
--           NULL = no historical editions configured (page shows empty state).
-- ============================================================

-- NOTE: MySQL does NOT support "ADD COLUMN IF NOT EXISTS". Run this once;
-- if it errors with "Duplicate column name", the column already exists.
ALTER TABLE site_config
    ADD COLUMN historial_config TEXT DEFAULT NULL
    COMMENT 'JSON object with /historial page config: up to 5 previous editions (year + torneo_id)';
