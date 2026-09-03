-- =====================================================================
-- Update: Ranuras alrededor del green (MRL F-19)
-- 71º Torneo Anual Club Campestre Saltillo 2026 — torneoid = 361
-- Actualiza el texto de esta regla local según la última versión
-- oficial de Reglas y Condiciones de Competencia.
-- Idempotente: si el texto antiguo ya no existe, el UPDATE no afecta
-- ninguna fila y no hay error.
-- =====================================================================

UPDATE convocatoria_content
SET content = REPLACE(
  content,
  'Ésta se ubica en el collarín o french del green, por lo tanto está ubicada en el área general. El jugador podrá tomar alivio si su bola reposa o toca la ranura; el alivio es DROPEANDO la bola en el punto de alivio más cercano más el largo de un palo, sin acercarse al hoyo y sin cambiar de área del campo.',
  'Esta se ubica en el green, por lo que si una bola reposa o toca la ranura podrás tomar alivio colocando la bola en el punto de alivio más cercano que puede estar en green o fuera en el área general.'
)
WHERE torneoid = 361
  AND section_id = 'reglas_locales'
  AND section_type = 'accordion';
