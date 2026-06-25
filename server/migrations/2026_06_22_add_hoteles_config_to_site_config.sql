-- Add hoteles_config column to site_config so the /hoteles page can
-- store its own poster-grid layout (cols + gap per breakpoint + order),
-- mirroring premios_config / avisos_config / eventos_config.
ALTER TABLE site_config
  ADD COLUMN hoteles_config TEXT DEFAULT NULL
  COMMENT 'JSON object with hoteles page display settings (cols/gap per breakpoint)';