-- ============================================================
-- Migration: Add home_config column to site_config
-- Purpose : Per-domain configuration for the public home page
--           (currently: the two hero CTA buttons). Stored as
--           a JSON string. NULL = default fallback pair
--           (/convocatoria + /jugadores).
-- ============================================================

ALTER TABLE site_config
    ADD COLUMN IF NOT EXISTS home_config TEXT DEFAULT NULL
    COMMENT 'JSON object with the home page config: {"buttons":[pageId1,pageId2]}';