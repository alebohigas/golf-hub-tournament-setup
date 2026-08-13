-- ============================================================
-- Migration: Add modules_config column to site_config
-- Purpose : Guarda qué MÓDULOS opcionales de la app están
--           encendidos en este proyecto (página /setup).
--           Formato JSON:
--             { "modules": { "skins": { "enabled": false,
--                                       "lockedBy": "superadmin",
--                                       "updatedAt": "2026-08-13T00:00:00Z" } } }
--           Una entrada ausente = módulo ENCENDIDO.
-- Notes   : site_config.php auto-crea esta columna en su primer uso;
--           corre este SQL solo si el hosting no permite ALTER.
--           Sin GRANTs: hosting compartido IONOS/MySQL.
-- ============================================================

ALTER TABLE site_config
    ADD COLUMN modules_config TEXT DEFAULT NULL
    COMMENT 'JSON object with enabled/disabled app modules';
