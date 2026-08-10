-- =====================================================================
-- Seed: /convocatoria para torneoid = 365
-- TORNEO ANUAL DE GOLF LOS LAGOS "MEGA 2026"
-- Los Lagos Club Campestre — 8 al 11 de octubre de 2026
-- Fuente: cartel oficial "Información Anual 2026".
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general (fechas, sede, formato)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (365, 'descripcion', 'generic', '{"text": "TORNEO ANUAL DE GOLF — MEGA 2026, del 8 al 11 de octubre de 2026 en LOS LAGOS CLUB CAMPESTRE.\\n\\nFormato de juego para todas las categorías: STROKE PLAY INDIVIDUAL a 54 hoyos.\\n\\nCupo para 232 jugadores.\\n\\nInscripciones: 662 260 88 68 · proshoplosLagos@hotmail.com"}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad / Formato de juego / Hándicap
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (365, 'elegibilidad', 'generic', '{"eligibilityText": "Jugadores con hándicap actualizado registrado ante la USGA o por la Federación Mexicana de Golf. Es necesario enviar al Proshop su número GHIN.", "notesText": ["Formato de juego para todas las categorías: STROKE PLAY INDIVIDUAL a 54 hoyos.", "Corte del 40% después de 36 hoyos, sin empates y sin excepciones.", "Score neto a tirar mínimo en los primeros 36 hoyos: 136 golpes en AA y A; 140 golpes en B, C, D, E y Damas.", "Si tiran menos, se ajustará en su juego en la ronda final.", "Categoría Campeonato sin mínimo de golpes.", "Trofeos a los primeros 3 lugares de cada categoría.", "Cupo para 232 jugadores.", "Criterio de desempate por el Comité Organizador.", "El Comité Organizador se reserva cualquier cambio necesario en la presente convocatoria para su mejor desarrollo."], "inscripcionesText": "Inscripciones: 662 260 88 68 · proshoplosLagos@hotmail.com. Mandar por correo electrónico ficha de pago."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias / Premios especiales (O''Yeses, Hole in One, rifas)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (365, 'competencias', 'list', '{"items": [{"nombre": "O''YESES — Hoyo 3", "descripcion": "Premios por acierto en el hoyo 3.", "premios": "Automóvil (Hyundai Grand i10) · $40,000 · $30,000 · $20,000 · Inscripción Torneo Aniversario 2027 · Inscripción Torneo Anual 2027 · Bolsa de golf · $5,000."}, {"nombre": "O''YESES — Hoyo 5", "descripcion": "Premios por acierto en el hoyo 5.", "premios": "Automóvil (Hyundai Grand i10) · $40,000 · $30,000 · $20,000 · Inscripción Torneo Aniversario 2027 · Inscripción Torneo Anual 2027 · Bolsa de golf · $5,000."}, {"nombre": "O''YESES — Hoyo 12", "descripcion": "Premios por acierto en el hoyo 12.", "premios": "Automóvil (Mazda 2) · $40,000 · $30,000 · $20,000 · Inscripción Torneo Aniversario 2027 · Inscripción Torneo Anual 2027 · Bolsa de golf · $5,000."}, {"nombre": "O''YESES — Hoyo 15", "descripcion": "Premios por acierto en el hoyo 15.", "premios": "$70,000 · $40,000 · $30,000 · $20,000 · Inscripción Torneo Aniversario 2027 · Inscripción Torneo Anual 2027 · Bolsa de golf · $5,000."}, {"nombre": "O''YESES — Hoyo 12, domingo", "descripcion": "Premiación especial del domingo en el hoyo 12.", "premios": "1° $15,000 · 2° $10,000 · 3° $5,000."}, {"nombre": "HOLE IN ONE — Hoyo 5", "descripcion": "Viernes y sábado.", "premios": "Ford Territory."}, {"nombre": "HOLE IN ONE — Hoyo 12", "descripcion": "Domingo.", "premios": "Ford Territory."}, {"nombre": "RIFA DE EFECTIVO (Calcuta)", "descripcion": "Participan los inscritos al 6 de septiembre antes de las 17:00 hrs.", "premios": "Rifa de efectivo en la Calcuta."}, {"nombre": "SE REGALARÁ", "descripcion": "Entre los inscritos antes del 6 de septiembre.", "premios": "1er premio $100,000 · 2do premio $30,000 · 3er premio $20,000."}]}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación por categoría
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (365, 'premiacion', 'list', '{"items": [{"categoria": "Todas las categorías", "premios": ["Trofeo al 1er lugar.", "Trofeo al 2do lugar.", "Trofeo al 3er lugar."]}, {"categoria": "Categoría Campeonato", "premios": ["Sin mínimo de golpes.", "Trofeos a los primeros 3 lugares."]}]}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates (criterio del Comité)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES (365, 'desempates', 'desempates', 'Desempates', '{"intro": "Criterio de desempate por el Comité Organizador.", "showCorte": true, "showTrofeos": true, "paraCorte": ["Corte del 40% después de 36 hoyos, sin empates y sin excepciones."], "paraTrofeos": ["El criterio de desempate para trofeos será determinado por el Comité Organizador."], "nota": "El Comité Organizador se reserva cualquier cambio necesario en la presente convocatoria para su mejor desarrollo. Su decisión será final e inapelable."}', 6, 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), title = VALUES(title), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos de inscripción (cuotas socios y no miembros)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (365, 'costos', 'generic', '{"sociosPricing": [{"title": "Miembros", "caballeros": "$13,550.00", "damasSeniors": "$8,000.00"}], "foraneosPricing": [{"title": "No miembros", "caballeros": "$15,550.00", "damasSeniors": "$8,900.00"}], "pricingNote": "Caballeros $13,550 · Caballeros no miembros $15,550 · Damas y juveniles $8,000 · Damas y juveniles no miembros $8,900.", "inscripcionesText": "Mandar por correo electrónico ficha de pago a proshoplosLagos@hotmail.com · Tel. 662 260 88 68.\\nBBVA Bancomer No. Cta: 045 13 61 589 · CLABE: 012 760 004 513 615 892.\\nInscritos al 6 de septiembre antes de las 17:00 hrs participan en la rifa de efectivo en la Calcuta.\\nA partir del 20 de septiembre no habrá reembolso."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

COMMIT;
