-- ---------------------------------------------------------------------------
-- Admin > Heros: per-tournament hero (page background) overrides.
-- Stored as JSON in site_config.hero_config:
--   { "byTorneo": { "365": { "/convocatoria": { "url": "...", "active": true } } },
--     "default":  { "/convocatoria": { "url": "...", "active": true } } }
-- MySQL has no "ADD COLUMN IF NOT EXISTS"; site_config.php also self-heals
-- this column on first use, so run this only if that ALTER is not permitted.
-- ---------------------------------------------------------------------------
ALTER TABLE site_config
  ADD COLUMN hero_config TEXT DEFAULT NULL
  COMMENT 'JSON object with per-tournament hero image overrides';
