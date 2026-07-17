-- =======================================================================
-- Add `anuncio_config` column to `site_config`
-- -----------------------------------------------------------------------
-- Stores the scrolling announcement ribbon settings (between the header
-- and the sponsor ribbon). JSON object shape:
--   {
--     "enabled":    bool,
--     "text":       string,
--     "bgColor":    string   (hex, e.g. "#111827"),
--     "textColor":  string   (hex, e.g. "#ffffff"),
--     "fontFamily": "sans" | "serif" | "mono" | "display",
--     "fontSize":   number   (px, 10-48),
--     "bold":       bool,
--     "italic":     bool,
--     "speedSeconds": number (seconds per viewport pass; higher = slower)
--   }
-- =======================================================================
ALTER TABLE site_config
  ADD COLUMN IF NOT EXISTS anuncio_config TEXT DEFAULT NULL
  COMMENT 'JSON object with scrolling announcement ribbon settings (text, colors, typography)';
