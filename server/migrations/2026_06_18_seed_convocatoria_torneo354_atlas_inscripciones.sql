-- =====================================================================
-- Seed elegibilidad + costos for torneoid=354 (Atlas Country Club 2026)
-- These sections hold Atlas-specific inscripciones/cuota/WhatsApp data
-- that was previously hardcoded in src/data/mockData.ts. Moved here so
-- only torneoid=354 shows them; all other torneos fall back to empty.
-- Idempotent via ON DUPLICATE KEY UPDATE.
-- =====================================================================

-- elegibilidad: only inscripcionesText (eligibilityText / notesText left to defaults)
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled)
VALUES (354, 'elegibilidad', 'generic', '{"inscripcionesText": "Cuota de recuperación: $19,950.00. Cierre de inscripciones: 8 de Julio 2026 a las 18:00 hrs (o antes si se completa el cupo). Inscripciones en https://torneoscountry.atlas.com.mx . Información general: https://anualgolf.atlas.com.mx . WhatsApp: 33 2257 1913."}', 1)
ON DUPLICATE KEY UPDATE
  section_type = 'generic',
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- costos: full pricing block + contactInfo + warnings + inscripcionesText
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled)
VALUES (354, 'costos', 'generic', '{"sociosPricing": [{"title": "Costo de Inscripción", "subtitle": "Cuota única. Incluye kit de regalos y cortesías para ingresar a los eventos sociales. Acceso a rondas de práctica ilimitadas a partir del 12 de Julio de 2026 (previa reservación de tee time).", "tiers": [{"categoria": "Cuota de recuperación (todas las categorías)", "costo": "$19,950.00", "mayo6": "", "junio5": "", "julio4": "", "agosto3": "", "sept2": ""}]}], "foraneosPricing": [], "pricingNote": "Todos los participantes deberán inscribirse en la página web de registro https://torneoscountry.atlas.com.mx, con su INDEX vigente, número de GHIN, datos de su tarjeta de crédito y datos de su invitación. Sin este proceso no será válida su inscripción. Recibirá un correo de confirmación; revise también la bandeja de spam. Si su pago se realiza posterior a la fecha de anuncio de lleno, no será válida su inscripción.", "contactInfo": {"bankName": "", "clabe": "", "cuenta": "", "nombre": "Atlas Country Club", "email": "", "telefono": "33 2257 1913", "telefonoDirecto": ""}, "contactWarning": "Si después de inscribirse no recibe correo de confirmación, favor de enviar un mensaje por WhatsApp al 33 2257 1913.", "inscripcionesText": "Cuota de recuperación: $19,950.00. Cierre de inscripciones: 8 de Julio 2026 a las 18:00 hrs (o antes si se completa el cupo). Inscripciones en https://torneoscountry.atlas.com.mx . Información general: https://anualgolf.atlas.com.mx . WhatsApp: 33 2257 1913."}', 1)
ON DUPLICATE KEY UPDATE
  section_type = 'generic',
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;