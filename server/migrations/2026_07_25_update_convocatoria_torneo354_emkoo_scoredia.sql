-- Torneo 354 — Correcciones puntuales en Convocatoria
-- 1) GAC Enkoo -> GAC Emkoo (typo)
-- 2) Quitar "(Damas, D, E y Seniors)" en el premio Mejor Score del Día

-- Premiación
UPDATE convocatoria_content
SET content = REPLACE(
  REPLACE(content, 'GAC Enkoo', 'GAC Emkoo'),
  'En categorías formato Stableford (Damas, D, E y Seniors) el ganador será la tarjeta con el mayor puntaje.',
  'En categorías formato Stableford el ganador será la tarjeta con el mayor puntaje.'
)
WHERE torneoid = 354 AND section_id = 'premiacion';

-- Competencias Especiales
UPDATE convocatoria_content
SET content = REPLACE(
  REPLACE(content, 'GAC Enkoo', 'GAC Emkoo'),
  'En categorías Stableford (Damas, D, E y Seniors) gana la tarjeta con mayor puntaje.',
  'En categorías Stableford gana la tarjeta con mayor puntaje.'
)
WHERE torneoid = 354 AND section_id = 'competencias';

-- Patrocinadores Oficiales
UPDATE convocatoria_content
SET content = REPLACE(content, 'GAC Enkoo', 'GAC Emkoo')
WHERE torneoid = 354 AND section_id = 'patrocinadoresOficiales';