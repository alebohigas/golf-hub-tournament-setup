-- =====================================================================
-- Seed: /convocatoria content for torneoid=361
-- Torneo Anual de Golf Club Campestre de Saltillo — Edición 71
-- Fecha de juego: 3 al 12 de Septiembre de 2026
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES
(361, 'descripcion', 'text',
'{"text": "El Club Campestre de Saltillo convoca a sus socios e invitados a participar en su Torneo Anual Edición 71, que se llevará a cabo del 3 al 12 de Septiembre de 2026.\n\nEvento con puntos para el World Amateur Golf Ranking (WAGR)."}', 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad (inscripciones, cierre, handicap y notas)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES
(361, 'elegibilidad', 'elegibilidad',
'{"eligibilityText": "Se jugará con el handicap índice GHIN del día miércoles 15 de Julio del 2026. Es requisito indispensable tener GHIN 2026 y contar con mínimo 8 tarjetas registradas en 2026.", "notesText": ["En cualquier categoría que se inscriban menos de 12 jugadores(as) se declara desierta; sin embargo, los jugadores(as) afectados pasarán a la categoría inmediata superior, siempre y cuando haya cupo y estén de acuerdo con el cambio.", "Fecha límite para decidir si se declara desierta una categoría: Domingo 30 de Agosto del 2026.", "Ningún jugador podrá participar en más de una categoría.", "El jugador que pase a la ronda final y no pueda asistir, su lugar no podrá ser ocupado por otro jugador.", "Los ganadores de Trofeo Gross no podrán ganar Trofeo Neto en categoría Seniors A y Damas A (prioridad Gross).", "Las rondas y días de juego están sujetas a cambios sin previo aviso para beneficio general del Torneo. En caso de clima adverso se tomará como primer criterio ronda de 9 hoyos si aplica.", "Ningún jugador(a) podrá solicitar cambio de horario, grupo o día de juego.", "Las controversias sobre aplicación de reglas serán resueltas por el oficial de reglas y su fallo es definitivo.", "Campeones(as) del 70° Torneo Anual (2025) no podrán jugar la misma categoría o inferior; sí podrán en una superior (excepto Seniors A, Campeonato Caballeros y Damas A).", "En la categoría Damas Nuevos Talentos solo podrán participar jugadoras principiantes y sea su primer Torneo Anual. NO SE PUEDE JUGAR 2 VECES O MÁS ESTA CATEGORÍA."], "inscripcionesText": "Inscripciones: Socios a partir del 15 de Julio de 2026. Invitados a partir del 16 de Agosto de 2026.\n\nCierre: Domingo 30 de Agosto de 2026 a las 3:00 pm, o antes si se llega al cupo límite.\n\nFecha límite para cancelar inscripción: Sábado 29 de Agosto de 2026. En caso de no cancelar a tiempo se aplicará el cargo de inscripción al 100%."}', 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos (cuotas por categoría de jugador y datos bancarios)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES
(361, 'costos', 'costos',
'{"sociosPricing": [{"title": "Socios", "subtitle": "Cuotas de inscripción para socios del Club Campestre Saltillo.", "tiers": [{"categoria": "Dama Socia", "costo": "$11,600"}, {"categoria": "Socia Nuevos Talentos", "costo": "$6,000"}, {"categoria": "Caballero Socio", "costo": "$14,500"}, {"categoria": "Socio Honorario", "costo": "$13,000"}]}], "foraneosPricing": [{"title": "Invitados", "caballeros": "$17,500", "damasSeniors": "$12,800"}], "pricingNote": "Formas de pago: Transferencia, pago en caja o cargo a la acción. Invitados: enviar comprobante de pago al 844 286 0810 con nombre y categoría. Inscripciones únicamente por www.campestresaltillo.com (Pestaña Torneo Anual).", "contactInfo": {"bankName": "BANCOMER", "clabe": "012078004430754434", "cuenta": "0443075443", "nombre": "Club Campestre de Saltillo A.C.", "email": "", "telefono": "844 286 0810", "telefonoDirecto": "WhatsApp invitados: 844 286 0810"}, "contactWarning": "Invitados: es OBLIGATORIO enviar el comprobante de pago al WhatsApp 844 286 0810 incluyendo nombre y categoría del jugador.", "inscripcionesText": "Inscripciones únicamente por la página web: www.campestresaltillo.com (Pestaña Torneo Anual)."}', 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación / Trofeos por categoría
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES
(361, 'premiacion', 'premiacion',
'{"items": [{"categoria": "Campeonato / Premier / AA", "premios": ["1er lugar", "2do lugar", "3er lugar", "4to lugar"]}, {"categoria": "Seniors A", "premios": ["1ro y 2do GROSS", "1ro y 2do NETO"]}, {"categoria": "A, B, C, D, E, Seniors B y C / Super Seniors", "premios": ["1er lugar", "2do lugar", "3er lugar", "4to lugar"]}, {"categoria": "Damas A", "premios": ["1ro y 2do GROSS", "1ro y 2do NETO"]}, {"categoria": "Damas B, C, D, E", "premios": ["1er lugar", "2do lugar", "3er lugar", "4to lugar"]}, {"categoria": "Nuevos Talentos", "premios": ["1er lugar", "2do lugar", "3er lugar", "4to lugar"]}, {"categoria": "Trofeo — Diseño Exclusivo", "premios": ["Diseño exclusivo para el Club Campestre Saltillo del escultor Alejandro Fuentes."]}, {"categoria": "Criterio de desempate para Trofeo (1er lugar Gross o Neto)", "premios": ["Se jugará a MUERTE SÚBITA en el hoyo que el Director de Reglas designe, bajo la misma modalidad de juego.", "El resto de desempates se hará por comparación de tarjetas: score del último día jugado, luego hoyos 10-18, 13-18, 16-18, y hoyo por hoyo del 18 al 1."]}]}', 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias / Premios especiales (incluye)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES
(361, 'competencias', 'competencias',
'{"items": [{"nombre": "Kit de Bienvenida", "descripcion": "Kit oficial de bienvenida para todos los participantes inscritos al Torneo Anual Edición 71.", "premios": ""}, {"nombre": "Torneo de Putt y Approach", "descripcion": "Competencias paralelas de Putt y Approach abiertas a todos los participantes.", "premios": ""}, {"nombre": "Premios O''Yes", "descripcion": "Premios O''Yes disponibles en los hoyos par 3 durante los días de competencia.", "premios": ""}, {"nombre": "Buffet y Barra Libre", "descripcion": "Buffet de alimentos y barra libre de bebidas durante el desarrollo del torneo.", "premios": ""}, {"nombre": "Rifas en Premiación y Evento de Clausura", "descripcion": "Rifas durante la Ceremonia de Premiación y el Evento de Clausura del torneo.", "premios": ""}]}', 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Servicios / Programación días de juego y horarios (10 días)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES
(361, 'servicios', 'servicios',
'{"items": [
{"dia": "Jueves 3 de Septiembre — 1ra Ronda", "items": [{"servicio": "Damas A, B, C, D, E y Nuevos Talentos", "horario": "6:30 - 9:20 hrs"}, {"servicio": "Caballeros E", "horario": "12:30 - 14:40 hrs"}]},
{"dia": "Viernes 4 de Septiembre — 1ra Ronda", "items": [{"servicio": "Seniors B y C, Caballeros D", "horario": "6:30 - 9:20 hrs"}, {"servicio": "Caballeros C", "horario": "12:30 - 14:40 hrs"}]},
{"dia": "Sábado 5 de Septiembre — 2da Ronda", "items": [{"servicio": "Damas A, B, C, D y Nuevos Talentos", "horario": "6:30 - 9:20 hrs"}, {"servicio": "Caballeros B", "horario": "12:30 - 14:40 hrs"}]},
{"dia": "Domingo 6 de Septiembre — 1ra Ronda", "items": [{"servicio": "Seniors A, Super Seniors, Caballeros A", "horario": "6:30 - 9:20 hrs"}, {"servicio": "Caballeros E", "horario": "12:30 - 14:40 hrs"}]},
{"dia": "Lunes 7 de Septiembre — 2da Ronda", "items": [{"servicio": "Seniors B y C, Caballeros D", "horario": "6:30 - 9:20 hrs"}, {"servicio": "Caballeros C", "horario": "12:30 - 14:40 hrs"}]},
{"dia": "Martes 8 de Septiembre — 3ra Ronda", "items": [{"servicio": "Damas A, B, C, D, E y Nuevos Talentos", "horario": "6:40 - 9:10 hrs"}, {"servicio": "Caballeros B", "horario": "12:00 - 14:20 hrs"}]},
{"dia": "Miércoles 9 de Septiembre — 2da Ronda / Rondas Campeonato", "items": [{"servicio": "Seniors A, Super Seniors, Caballeros E", "horario": "6:40 - 9:10 hrs"}, {"servicio": "Caballeros A y D", "horario": "12:00 - 14:20 hrs"}]},
{"dia": "Jueves 10 de Septiembre — 3ra Ronda / Rondas Campeonato", "items": [{"servicio": "Seniors B y C, Caballeros C y B", "horario": "6:40 - 9:10 hrs"}, {"servicio": "Campeonato, Premier y Caballeros AA", "horario": "12:00 - 14:20 hrs"}]},
{"dia": "Viernes 11 de Septiembre — Rondas Campeonato", "items": [{"servicio": "Super Seniors, Caballeros A", "horario": "6:40 - 9:10 hrs"}, {"servicio": "Campeonato, Premier y Caballeros AA", "horario": "12:00 - 14:20 hrs"}]},
{"dia": "Sábado 12 de Septiembre — Finales", "items": [{"servicio": "Final Todas las Categorías Caballeros y 3ra Ronda Seniors A", "horario": "7:00 hrs"}]}
]}', 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;