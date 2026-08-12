-- =====================================================================
-- Costos torneo 365 (LOS LAGOS 2026)
-- Reescribe la sección `costos` usando la estructura que espera
-- CostosSection: sociosPricing[].tiers[] (title + categoria/costo),
-- para que la tabla "MIEMBROS" muestre los importes.
-- =====================================================================
UPDATE convocatoria_content
SET content = '{"sociosPricing": [{"title": "MIEMBROS", "tiers": [{"categoria": "Caballeros", "costo": "$13,550.00"}, {"categoria": "Damas y Juveniles", "costo": "$8,000.00"}]}, {"title": "INVITADOS", "tiers": [{"categoria": "Caballeros", "costo": "$15,550.00"}, {"categoria": "Damas y Juveniles", "costo": "$8,900.00"}]}], "foraneosPricing": [], "pricingNote": "", "inscripcionesText": "Mandar por correo electrónico ficha de pago a proshoplosLagos@hotmail.com · Tel. 662 260 88 68.\nBBVA Bancomer No. Cta: 045 13 61 589 · CLABE: 012 760 004 513 615 892.\nInscritos al 6 de septiembre antes de las 17:00 hrs participan en la rifa de efectivo en la Calcuta.\nA partir del 20 de septiembre no habrá reembolso."}',
    enabled = 1,
    updated_at = CURRENT_TIMESTAMP
WHERE torneoid = 365 AND section_id = 'costos';
