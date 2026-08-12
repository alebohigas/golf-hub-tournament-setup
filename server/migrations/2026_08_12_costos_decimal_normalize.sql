-- =====================================================================
-- Costos: importes como DECIMAL canónico en el JSON de convocatoria
-- ---------------------------------------------------------------------
-- Contrato: `convocatoria_content.content -> sociosPricing[].tiers[].costo`
-- guarda el importe SIN símbolo ni separadores de miles y con 2 decimales
-- (DECIMAL(12,2) como texto, ej. "13550.00"). El formato de moneda
-- ($13,550.00) lo aplica el frontend al presentar (src/lib/money.ts).
--
-- 1) Reescribe el torneo 365 con los importes ya normalizados.
-- 2) Limpia valores legados "$13,550.00" -> "13550.00" en cualquier torneo.
-- =====================================================================

-- 1) Torneo 365 (LOS LAGOS 2026)
UPDATE convocatoria_content
SET content = '{"sociosPricing": [{"title": "MIEMBROS", "tiers": [{"categoria": "Caballeros", "costo": "13550.00"}, {"categoria": "Damas y Juveniles", "costo": "8000.00"}]}, {"title": "INVITADOS", "tiers": [{"categoria": "Caballeros", "costo": "15550.00"}, {"categoria": "Damas y Juveniles", "costo": "8900.00"}]}], "foraneosPricing": [], "pricingNote": "", "inscripcionesText": "Mandar por correo electrónico ficha de pago a proshoplosLagos@hotmail.com · Tel. 662 260 88 68.\nBBVA Bancomer No. Cta: 045 13 61 589 · CLABE: 012 760 004 513 615 892.\nInscritos al 6 de septiembre antes de las 17:00 hrs participan en la rifa de efectivo en la Calcuta.\nA partir del 20 de septiembre no habrá reembolso."}',
    enabled = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE torneoid = 365 AND section_id = 'costos';

-- 2) Normalización de legados: quita "$" y las comas de miles del JSON.
--    Seguro para el resto del texto porque solo afecta patrones "$n,nnn".
UPDATE convocatoria_content
SET content = REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(content, '"costo": "$', '"costo": "'),
        '"costo":"$', '"costo":"'),
      '"caballeros": "$', '"caballeros": "'),
    '"damasSeniors": "$', '"damasSeniors": "')
WHERE section_id = 'costos'
  AND content LIKE '%": "$%';
