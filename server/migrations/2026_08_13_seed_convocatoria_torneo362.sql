-- =====================================================================
-- Seed: /convocatoria para torneoid = 362
-- TORNEO ANUAL 2026 — del 9 al 14 de noviembre de 2026
-- Base mínima (fechas y formato pendiente de detalle del cartel oficial).
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general (nombre del torneo y fechas)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(362, 'descripcion', 'generic', 'Descripción', '{"text": "TORNEO ANUAL 2026 — del 9 al 14 de noviembre de 2026."}', 1, 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), title = VALUES(title), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

COMMIT;
