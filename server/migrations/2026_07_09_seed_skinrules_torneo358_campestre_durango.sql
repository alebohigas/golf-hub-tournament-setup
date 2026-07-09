-- =====================================================================
-- Seed: /skinrules content for torneoid=358
-- Torneo Anual de Golf Club Campestre de Durango 2026
-- Reusa la tabla convocatoria_content con section_ids prefijados
-- `skinrules_*`. Idempotente vía ON DUPLICATE KEY UPDATE.
--
-- Estructura basada en el PDF de referencia SKINS-RULES (El Cid 2025):
--   - skinrules_intro_cards : 3 tarjetas resumen (formato, elegibilidad, premiación)
--   - skinrules_reglas      : accordion con las reglas del juego SKINS
--   - skinrules_pdf_label   : etiqueta opcional del botón "Ver PDF"
--
-- IMPORTANT: este seed es SOLO para torneoid=358. Otros torneos deben
-- tener su propio seed; la página /skinrules NO usa este contenido como
-- fallback para otros torneos (si no hay filas, la sección se oculta).
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Tarjetas resumen (skinrules_intro_cards)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (358, 'skinrules_intro_cards', 'cards', '[{"icon": "BookOpen", "title": "Formato del Juego", "body": "El juego de SKINS asigna un valor monetario a cada hoyo del campo de acuerdo con la bolsa acumulada, ya sea por categoría o todos contra todos. Los SKINS son simples y no acumulativos, tanto en modalidad GROSS como NETO."}, {"icon": "Scale", "title": "Modalidad NETO", "body": "El juego de SKINS en su forma NETO se juega con el 80% del hándicap, aplicando el hándicap por hoyo indicado en la tarjeta de score."}, {"icon": "ShieldCheck", "title": "Premiación", "body": "Los ganadores se llevan el 80% de la bolsa acumulada. El pago de premios se realiza en la ceremonia de premiación al cierre del torneo."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Reglas del juego SKINS (accordion)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (358, 'skinrules_reglas', 'accordion', '[{"titulo": "Agrupación de categorías", "contenido": "Los SKINS se agrupan de la siguiente manera para efectos de premiación (GROSS y NETO, por día):\\n• Grupo A – Campeonato, Premier y AA.\\n• Grupo B – A, B y C.\\n• Grupo C – D y E.\\n• Grupo D – Senior A, Senior B y Súper Senior.\\n• Grupo E – Damas A, Damas B y Damas C."}, {"titulo": "Inscripción y pago", "contenido": "Todo participante del juego de SKINS debe cubrir el monto total del juego a más tardar al cierre de la fiesta de bienvenida. Si un jugador no se inscribe a tiempo, cualquier otro jugador podrá comprar su lugar."}, {"titulo": "Modalidad NETO", "contenido": "El juego de SKINS en su forma NETO se juega con el 80% del hándicap, aplicando el hándicap por hoyo indicado en la tarjeta de score."}, {"titulo": "Premiación", "contenido": "Los ganadores se llevan el 80% de la bolsa acumulada del juego."}, {"titulo": "Días de juego", "contenido": "Los SKINS se juegan únicamente durante los primeros 2 días de competencia."}, {"titulo": "Cuota de participación", "contenido": "$3,000 pesos por jugador. Incluye:\\n• Participación en la bolsa por Grupo y en la bolsa Overall.\\n• Rifa de una (1) inscripción para el Torneo Anual del siguiente año."}, {"titulo": "Cobro de premios", "contenido": "Los ganadores de SKINS podrán recibir sus premios durante la ceremonia de premiación al cierre del torneo."}, {"titulo": "Reservas del Comité", "contenido": "El Comité se reserva el derecho de hacer los cambios necesarios a estas reglas y al juego de SKINS para el mejor desarrollo del torneo, sin previo aviso."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Etiqueta del botón "Ver PDF" (opcional)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (358, 'skinrules_pdf_label', 'text', '{"label": "Ver Reglas del Skin Game (PDF)"}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;