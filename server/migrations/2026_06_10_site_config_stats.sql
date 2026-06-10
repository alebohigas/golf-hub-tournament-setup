-- ============================================================
-- Migration: Add stats_config column to site_config
-- Purpose : Per-domain overrides for the home Stats ribbon
--           (totalHistoricalPlayers, yearsHistory, maxCategories)
--           Stored as JSON, NULL/missing key = automatic (computed
--           from tournament data in server/api/tournament.php).
-- ============================================================

ALTER TABLE site_config
    ADD COLUMN IF NOT EXISTS stats_config TEXT DEFAULT NULL
    COMMENT 'JSON object overriding home stats ribbon values: {totalHistoricalPlayers, yearsHistory, maxCategories}. Missing/null key => auto';