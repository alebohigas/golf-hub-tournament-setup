-- =====================================================================
-- Seed: /convocatoria para torneoid = 364
-- PORSCHE GOLF CUP 2026 — Campestre Torreón, viernes 28 de agosto 2026
-- Fuente: convocatoria oficial (PDF Porsche Golf Cup 2026).
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general (fecha, sede, formato, salida)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (364, 'descripcion', 'generic', '{"text": "PORSCHE GOLF CUP — viernes 28 de agosto de 2026 en CAMPESTRE TORREÓN.\\n\\nHora de salida: 8:30 horas por escopetazo.\\n\\nFormato de juego: ronda de 18 hoyos individual bajo el sistema STROKE PLAY, al 80% de hándicap.\\n\\nMarcas de salida: Caballeros BLANCAS · Damas ROJAS."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad / Categorías / Hándicap
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (364, 'elegibilidad', 'generic', '{"eligibilityText": "Podrán participar todos los golfistas amateurs que tengan cumplidos 18 años de edad al día del torneo. Se aplicarán las reglas locales del campo, así como las reglas de la USGA y la FMG.", "notesText": ["Categoría A: de 0 a 10.4 de hándicap index.", "Categoría B: de 10.5 a 22 de hándicap index.", "Categoría C: de 22.1 a 36 de hándicap index.", "El torneo se jugará con los hándicaps del 1 de agosto de 2026 de la Federación Mexicana de Golf (GHIN) o sistema SPEI. Como tercera opción, se aceptará carta de su Club.", "El Comité se reserva el derecho de aceptar la validez del hándicap; quien no lo acredite debidamente no podrá pelear por los trofeos de los primeros lugares.", "Para la PORSCHE GOLF CUP FINALE 2027, los ganadores deberán contar con GHIN."], "inscripcionesText": "Inscripciones en Coordinación Deportiva a partir del 20 de julio. Cierre de inscripciones: 27 de agosto a las 2:00 pm."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias / Premios especiales
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (364, 'competencias', 'list', '{"items": [{"nombre": "Hole-In-One — Hoyo 4", "descripcion": "Habrá un Porsche Macan T 2026 al primer Hole-In-One del torneo en el hoyo 4.", "premios": "Porsche Macan T 2026."}, {"nombre": "O''YES", "descripcion": "Se premiará a los 3 mejores O''Yes de cada par 3.", "premios": "Premio a 1°, 2° y 3° lugar de cada par 3."}, {"nombre": "PORSCHE GOLF CUP FINALE 2026", "descripcion": "Los tres primeros lugares de cada categoría asistirán como invitados a la PORSCHE GOLF CUP FINALE 2026, en fecha y lugar por definir, además del mejor SCORE GROSS general.", "premios": "Pase de invitado a la Finale 2026."}]}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación por categoría
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (364, 'premiacion', 'list', '{"items": [{"categoria": "Categoría A", "premios": ["Trofeo al 1er lugar.", "Trofeo al 2do lugar.", "Trofeo al 3er lugar.", "Los tres primeros lugares asisten como invitados a la PORSCHE GOLF CUP FINALE 2026."]}, {"categoria": "Categoría B", "premios": ["Trofeo al 1er lugar.", "Trofeo al 2do lugar.", "Trofeo al 3er lugar.", "Los tres primeros lugares asisten como invitados a la PORSCHE GOLF CUP FINALE 2026."]}, {"categoria": "Categoría C", "premios": ["Trofeo al 1er lugar.", "Trofeo al 2do lugar.", "Trofeo al 3er lugar.", "Los tres primeros lugares asisten como invitados a la PORSCHE GOLF CUP FINALE 2026."]}, {"categoria": "Score Gross del Torneo", "premios": ["Trofeo al 1er lugar del SCORE GROSS del torneo.", "El mejor SCORE GROSS general asiste como invitado a la PORSCHE GOLF CUP FINALE 2026."]}]}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates (trofeos: muerte súbita 1er lugar / comparación de tarjetas)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES (364, 'desempates', 'desempates', 'Desempates', '{"intro": "Desempates para ganador de trofeo.", "showCorte": false, "showTrofeos": true, "paraCorte": [], "paraTrofeos": ["Primer lugar de todas las categorías: MUERTE SÚBITA en los hoyos asignados por el Comité, con las ventajas originales con las que iniciaron.", "Segundos y terceros lugares: el desempate será determinado por comparación de tarjetas."], "nota": "El Comité Organizador se reserva el derecho de hacer los cambios que juzgue necesarios para el mejor desarrollo del Torneo. Cualquier punto no considerado en la presente convocatoria será resuelto por el Comité Organizador y su decisión será final e inapelable."}', 6, 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), title = VALUES(title), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos de inscripción
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (364, 'costos', 'generic', '{"foraneosPricing": [{"title": "Inscripción al Torneo", "caballeros": "$3,900.00", "damasSeniors": "$3,900.00"}], "pricingNote": "Costo de inscripción: $3,900.00 Damas y Caballeros.", "inscripcionesText": "Inscripciones en Coordinación Deportiva a partir del 20 de julio.\\nCierre de inscripciones: 27 de agosto a las 2:00 pm."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

COMMIT;
