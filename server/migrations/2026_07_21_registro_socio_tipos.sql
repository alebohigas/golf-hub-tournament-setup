-- ============================================================
-- Migration: registro_socio_tipos
-- Purpose : Per-tournament mapping between the club-specific label
--           shown to end users on the /registro form (e.g. "Honorario",
--           "Jubilado", "Esposa") and the underlying SYSTEM socio type
--           used by the pricing engine ('TITULAR' | 'EMERITO' |
--           'DEPENDIENTE'). Empty table = fall back to the 3 hardcoded
--           labels historically shown by the form.
-- ============================================================

CREATE TABLE IF NOT EXISTS registro_socio_tipos (
    id            INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    torneo_id     INT NOT NULL,
    club_label    VARCHAR(120) NOT NULL COMMENT 'Nombre mostrado en el dropdown público (ej. Honorario)',
    system_type   VARCHAR(32)  NOT NULL COMMENT 'Debe ser TITULAR | EMERITO | DEPENDIENTE',
    display_order INT NOT NULL DEFAULT 0,
    is_enabled    TINYINT(1) NOT NULL DEFAULT 1,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_torneo (torneo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;