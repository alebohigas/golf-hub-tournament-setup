-- =============================================================
-- Superadmin password configurable fuera de `usuarios`
-- =============================================================
-- El superadmin legacy sigue entrando SIN usuario; esta tabla guarda
-- únicamente el hash de su contraseña cuando se cambia desde /admin.
-- No inserta admin2025: ese valor queda como fallback hasta configurar
-- una contraseña personalizada.

CREATE TABLE IF NOT EXISTS admin_settings (
  setting_key VARCHAR(100) NOT NULL PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;