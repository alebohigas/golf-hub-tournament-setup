-- ============================================================
-- Migration: Add historial_config column to site_config
-- Purpose : Per-domain configuration for the public /historial page.
--           Stores up to 5 previous editions as JSON:
--             {"years":[{"year":2025,"torneoId":"354","label":"..."}]}
--           NULL = no historical editions configured (page shows empty state).
-- ============================================================

ALTER TABLE site_config
    ADD COLUMN IF NOT EXISTS historial_config TEXT DEFAULT NULL
    COMMENT 'JSON object with /historial page config: up to 5 previous editions (year + torneo_id)';
