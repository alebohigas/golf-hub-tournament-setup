-- ============================================================
-- Migration: Add menus_config column to site_config
-- Purpose : Per-domain layout + poster order for the new /menus
--           page (columns and gap per breakpoint, shared poster
--           order). Mirrors avisos_config exactly.
-- Notes   : No privilege/GRANT statements (IONOS shared hosting).
-- ============================================================

ALTER TABLE site_config
    ADD COLUMN IF NOT EXISTS menus_config TEXT DEFAULT NULL
    COMMENT 'JSON object with menus page display settings (cols/gap per breakpoint + posterOrder)';
