-- ============================================================
-- Migration: Add stats_page_config column to site_config
-- Purpose : Per-domain configuration for the public /stats page
--           (section order, section visibility, and manual overrides
--           for clubes / categoria / jugador sections). Stored as
--           a JSON string. NULL = default configuration.
-- ============================================================

ALTER TABLE site_config
    ADD COLUMN IF NOT EXISTS stats_page_config TEXT DEFAULT NULL
    COMMENT 'JSON object with /stats page config: enabled, sections order+visibility, and manual overrides per section';