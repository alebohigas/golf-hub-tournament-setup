-- =====================================================================
-- Seed: /convocatoria para torneoid = 363
-- LII (52°) Torneo Anual de Golf El Cid 2026 — 2 al 8 de Noviembre
-- Fuente: póster oficial de convocatoria El Cid Golf & Country Club.
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (363, 'descripcion', 'generic', '{"text": "El Cid Golf & Country Club invita a los golfistas aficionados a participar en el 52° Torneo Anual de Golf El Cid 2026, del 2 al 8 de noviembre de 2026, en Mazatlán, Sinaloa.\\n\\nPremios en efectivo y trofeos a los ganadores por categoría, automóviles y $200,000.00 pesos en Hole in One, O''Yes, Torneo de Putt, Shoot-Out, Skins opcional y Kit de Bienvenida para todos los participantes.\\n\\n*Las imágenes del póster son solo ilustrativas."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad / Handicap por categoría
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (363, 'elegibilidad', 'generic', '{"eligibilityText": "Podrán participar golfistas aficionados. La categoría se asigna conforme al índice de handicap del jugador.", "notesText": ["Campeonato: +4 a 3.1 de índice.", "AA: 3.2 a 6.7 de índice.", "A: 6.8 a 10.4 de índice.", "B: 10.5 a 14.1 de índice.", "C: 14.2 a 18.6 de índice.", "D: 18.7 a 24.1 de índice.", "Seniors A (+60): +5 a 17.1 de índice.", "Seniors B (+60): 17.2 a 27.4 de índice.", "Damas A y Damas B.", "Para efectos de los premios de Hole-in-One y O''Yes, todas las categorías de CABALLEROS tirarán a 165 yardas y todas las categorías de DAMAS tirarán a 155 yardas."], "inscripcionesText": "AVISO: a partir del momento de su registro en la página oficial del torneo, los participantes dispondrán de un plazo máximo de una semana para liquidar el costo de la inscripción. Transcurrido este periodo, el registro podrá ser cancelado."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias / Premios especiales
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (363, 'competencias', 'list', '{"items": [{"nombre": "Hole in One — Automóviles", "descripcion": "Premio de automóvil en los Hoyos 4 de Marina y 2 de Moro.", "premios": "Automóvil (imágenes solo ilustrativas)."}, {"nombre": "Hole in One — Efectivo", "descripcion": "Premio en efectivo en los Hoyos 6 de Marina y 4 del Moro.", "premios": "$200,000.00 pesos en efectivo."}, {"nombre": "O''YES", "descripcion": "Hoyos 4 y 6 de Marina y hoyos 11 y 13 de Moro. Los premios por O''Yes estarán limitados a uno por hoyo: en caso de marcar más de un O''Yes en el mismo hoyo, se entregará al de mayor valor. Un mismo jugador puede ganar O''Yes en hoyos diferentes. El ganador del Hole in One pagará el deducible correspondiente. Los Hole in One NO se considerarán mejor O''Yes.", "premios": "1° $100,000.00 · 2° $50,000.00 · 3° $35,000.00 · 4° $20,000.00 · 5° $15,000.00 · 6° $10,000.00 pesos."}, {"nombre": "Rifa Especial", "descripcion": "Entre todos los participantes pagados al 7 de octubre del 2026. No hay excepciones. TIENE QUE ESTAR PRESENTE EL GANADOR PARA PODER LLEVÁRSELO.", "premios": "$100,000 pesos en efectivo."}, {"nombre": "Torneo de Putt", "descripcion": "Competencia de putt durante el torneo.", "premios": "1° $35,000 pesos en efectivo · 2° $20,000 pesos en efectivo."}, {"nombre": "Shoot-Out: Carrito de Golf", "descripcion": "Todos los participantes deberán hacer el tiro; en caso de que haya más de un hole in one, se irán a desempate.", "premios": "Carrito de golf."}, {"nombre": "Kit Golf", "descripcion": "Kit de bienvenida de regalo para todos los participantes.", "premios": "Kit de Bienvenida."}, {"nombre": "Skins (opcional)", "descripcion": "Participación opcional con costo adicional de $3,000.00 pesos. Habrá rifa especial para los jugadores que participen en los SKINS.", "premios": "Bolsa de Skins."}]}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación por categoría
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (363, 'premiacion', 'list', '{"items": [{"categoria": "Damas", "premios": ["1er Lugar GROSS $9,000 pesos.", "1er Lugar NETO $6,000 pesos.", "2do Lugar NETO $4,000 pesos.", "NOTA: la misma jugadora no podrá ganar GROSS y NETO."]}, {"categoria": "Seniors", "premios": ["1er Lugar GROSS $9,000 pesos.", "1er Lugar NETO $6,000 pesos.", "2do Lugar NETO $4,000 pesos.", "NOTA: el mismo jugador no podrá ganar GROSS y NETO."]}, {"categoria": "Caballeros", "premios": ["1er Lugar GROSS $9,000 pesos.", "1er Lugar GROSS $6,000 pesos.", "2do Lugar GROSS $4,000 pesos.", "NOTA: Categoría D: 1er, 2do y 3er lugar (Stableford)."]}, {"categoria": "General", "premios": ["Premios en efectivo y trofeos a los ganadores por categoría.", "En caso de descalificación, el jugador tendrá derecho a los premios obtenidos antes de su descalificación."]}]}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates (retrogresión 9, 6, 3, 1)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES (363, 'desempates', 'desempates', 'Desempates', '{"intro": "Los desempates de TODAS las categorías y por TODOS los lugares se llevarán a cabo bajo el método de retrogresión 9, 6, 3, 1 comenzando con la vuelta de MORO del domingo de la categoría.", "paraCorte": [], "paraTrofeos": [], "nota": "El Comité Organizador y el de Reglas se reserva el derecho de hacer cualquier modificación para el mejor desarrollo del Torneo sin previo aviso. Cualquier pregunta o controversia sobre la aplicación de las reglas será resuelta por el Comité de Honor y Justicia y su fallo será definitivo e inapelable."}', 6, 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), title = VALUES(title), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos de inscripción y formas de pago
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (363, 'costos', 'generic', '{"foraneosPricing": [{"title": "Inscripción al Torneo", "caballeros": "$13,000.00", "damasSeniors": "$12,000.00"}], "pricingNote": "Skins OPCIONAL: más $3,000.00 pesos. Habrá rifa especial para los jugadores que participen en los SKINS. *Facilidades de pago a 3 y 6 meses sin intereses con Tarjeta de Crédito participantes. AVISO: a partir del registro en la página oficial del torneo, se dispone de un plazo máximo de una semana para liquidar la inscripción; transcurrido este periodo el registro podrá ser cancelado.", "contactInfo": {"bankName": "BANCOMER", "clabe": "012744001607002589", "cuenta": "0160700258", "nombre": "El Cid Golf Y Country Club", "email": "mherrera@elcid.com.mx", "telefono": "669 989 69 69"}, "contactWarning": "Favor de hacer su pago a: EL CID GOLF & COUNTRY CLUB, Apartado Postal #813, Av. Camarón Sábalo s/n, Mazatlán, Sinaloa, México 82110. Atn: Martha Herrera.", "inscripcionesText": "Formas de pago:\\n• Depósito o transferencia BANCOMER — Cuenta 0160700258, CLABE 012744001607002589 a nombre de El Cid Golf Y Country Club.\\n• Tarjeta de crédito participante — 3 y 6 meses sin intereses."}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Contacto
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (363, 'contacto', 'generic', '{"text": "El Cid Golf & Country Club\\nAv. Camarón Sábalo s/n, Apartado Postal #813, Mazatlán, Sinaloa, México 82110.\\nAtn: Martha Herrera\\nCorreo: mherrera@elcid.com.mx\\nTel. 669 989 69 69\\nSitio: elcidgolfandcountryclub.com"}', 1)
ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content = VALUES(content), enabled = 1, updated_at = CURRENT_TIMESTAMP;

COMMIT;
