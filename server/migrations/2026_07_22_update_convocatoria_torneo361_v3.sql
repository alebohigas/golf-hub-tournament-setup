-- =====================================================================
-- Update: convocatoria content for torneoid=361 (v3 — final2 PDF)
-- Torneo Anual Club Campestre de Saltillo — Edición 71
-- Ajustes según convocatoria_final2:
--   * Inscripciones socios: 22 de Julio 2026 a las 10:00 am
--   * Invitados: 16 de Agosto 2026 a las 10:00 am
--   * Handicap GHIN: miércoles 22 de Julio de 2026
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES
(361, 'elegibilidad', 'elegibilidad',
'{"eligibilityText": "Se jugará con el handicap índice GHIN del día miércoles 22 de Julio del 2026. Es requisito indispensable tener GHIN 2026 y contar con mínimo 8 tarjetas registradas en 2026.", "notesText": ["En cualquier categoría que se inscriban menos de 12 jugadores(as) se declara desierta; sin embargo, los jugadores(as) afectados pasarán a la categoría inmediata superior, siempre y cuando haya cupo y estén de acuerdo con el cambio.", "Fecha límite para decidir si se declara desierta una categoría: Domingo 30 de Agosto del 2026.", "Ningún jugador podrá participar en más de una categoría.", "El jugador que pase a la ronda final y no pueda asistir, su lugar no podrá ser ocupado por otro jugador.", "Los ganadores de Trofeo Gross no podrán ganar Trofeo Neto en categoría Seniors A y Damas A (prioridad Gross).", "Las rondas y días de juego están sujetas a cambios sin previo aviso para beneficio general del Torneo. En caso de clima adverso se tomará como primer criterio ronda de 9 hoyos si aplica.", "Ningún jugador(a) podrá solicitar cambio de horario, grupo o día de juego.", "Las controversias sobre aplicación de reglas serán resueltas por el oficial de reglas y su fallo es definitivo.", "Campeones(as) del 70° Torneo Anual (2025) no podrán jugar la misma categoría o inferior; sí podrán en una superior (excepto Seniors A, Campeonato Caballeros y Damas A).", "En la categoría Damas Nuevos Talentos solo podrán participar jugadoras principiantes y sea su primer Torneo Anual. NO SE PUEDE JUGAR 2 VECES O MÁS ESTA CATEGORÍA."], "inscripcionesText": "Inscripciones: Socios a partir del 22 de Julio de 2026 (10:00 am). Invitados a partir del 16 de Agosto de 2026 (10:00 am).\\n\\nCierre: Domingo 30 de Agosto de 2026 a las 3:00 pm, o antes si se llega al cupo límite.\\n\\nFecha límite para cancelar inscripción: Sábado 29 de Agosto de 2026. En caso de no cancelar a tiempo se aplicará el cargo de inscripción al 100%."}', 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;