-- =======================================================================
-- Add popup_config column to site_config
-- -----------------------------------------------------------------------
-- Stores the site-wide POP UP overlay settings configured from the
-- Admin > POP tab. JSON object shape:
--   {
--     "enabled":   bool,
--     "imageUrl":  string,           // /api/uploads/{domain}/popup/{file}
--     "paths":     string[],         // routes where the popup should show
--     "durationSeconds": number,     // auto-dismiss; 0 = manual close only
--     "widthPx":   number,           // rendered max-width in px (e.g. 480)
--     "altText":   string
--   }
-- =======================================================================
ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS popup_config TEXT DEFAULT NULL
  COMMENT 'JSON object with site-wide popup overlay settings (image, target paths, duration, width)';