-- ---------------------------------------------------------------------------
-- Add `premios_config` column to `site_config`.
-- Mirrors `eventos_config` / `avisos_config`: a TEXT JSON blob describing
-- the column count + gap per breakpoint and the custom poster ordering for
-- the Premios page poster gallery.
-- ---------------------------------------------------------------------------
ALTER TABLE site_config
  ADD COLUMN premios_config TEXT DEFAULT NULL
  COMMENT 'JSON object with premios page display settings (cols/gap per breakpoint + posterOrder)';