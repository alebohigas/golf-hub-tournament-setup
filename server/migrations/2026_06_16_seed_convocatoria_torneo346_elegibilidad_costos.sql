-- Hide Elegibilidad and Costos sections for torneoid=346 so the page
-- stops falling back to the current mockData (which belongs to torneoid=354).
-- Idempotent: ON DUPLICATE KEY UPDATE on (torneoid, section_id).
-- Re-enable / fill via /admin → Convocatoria editor when ready.

INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled)
VALUES
  (346, 'elegibilidad', 'elegibilidad', 'Elegibilidad',
   '{"eligibilityText": "", "notesText": [], "inscripcionesText": ""}', 2, 0),
  (346, 'costos', 'costos', 'Costos',
   '{"sociosPricing": [], "foraneosPricing": [], "pricingNote": "", "contactInfo": {"clabe": "", "cuenta": "", "nombre": "", "bankName": ""}, "contactWarning": "", "inscripcionesText": ""}', 3, 0)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  title        = VALUES(title),
  content      = VALUES(content),
  sort_order   = VALUES(sort_order),
  enabled      = VALUES(enabled);
