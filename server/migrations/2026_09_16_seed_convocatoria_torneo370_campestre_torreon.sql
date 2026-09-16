-- =====================================================================
-- Seed: /convocatoria para torneoid = 370
-- TORNEO ANUAL 2026 — Campestre Torreón, S.A. de C.V.
-- Del 29 de septiembre al 3 de octubre de 2026.
-- Fuente: PDF oficial "torreon_torneoid_370_version2.pdf".
--
-- Las CATEGORÍAS y el CALENDARIO DE JUEGO NO se siembran aquí porque
-- ya están publicados en la base de datos (torneos.categorias /
-- torneos.caljuego) y esas páginas los leen directamente.
--
-- Idempotente vía ON DUPLICATE KEY UPDATE (clave única torneoid+section_id).
-- NOTA: sin GRANT/privilegios (MySQL IONOS).
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(370, 'descripcion', 'generic', 'Descripción',
'{"text": "CAMPESTRE TORREÓN, S.A. DE C.V. — TORNEO ANUAL 2026\\nDel 29 de septiembre al 3 de octubre de 2026.\\n\\nSistema de juego: 54 hoyos por categoría. Campeonato, AA y Seniors Campeonato juegan Stroke Play; A, B, C, D, E, Seniors A, Seniors B, Súper Seniors y Damas juegan Stableford.\\nVentajas: sin ventajas en Campeonato, AA, A, B, C y D; al 70% en E, Seniors A, Seniors B y Súper Seniors; al 80% en Seniors Campeonato y Damas.\\nMarcas de salida: azules (Campeonato y AA), blancas (A, B, C, D y E), doradas (Seniors), amarillas (Súper Seniors 70 y más) y rojas (Damas).\\n\\nSALIDAS: por horario en el turno correspondiente. Turno matutino a partir de las 6:40 a. m. y turno vespertino a partir de las 11:30 a. m.\\n\\nHÁNDICAP: la competencia se jugará con los hándicaps del 1 de septiembre de 2026 de la Federación Mexicana de Golf como primer referente, del sistema SPEI como segunda opción, o bien una carta de su club. El Comité se reserva el derecho de aceptar la validez del hándicap. Los jugadores que no comprueben debidamente su hándicap no podrán pelear por los trofeos de los primeros lugares.\\n\\nEl cupo máximo del torneo será de 348 jugadores. Las categorías y el calendario de juego oficial se publican en las páginas de Categorías y Calendario de juego de este sitio."}', 1, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), sort_order=VALUES(sort_order), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(370, 'elegibilidad', 'elegibilidad', 'Elegibilidad',
'{"eligibilityText": "Ser golfista amateur, mayor de 18 años cumplidos al 28 de septiembre de 2026, excepto en la categoría Campeonato, donde podrán jugar juveniles de 14 a 17 años.", "notesText": ["Las Damas se dividirán en 2 categorías, de acuerdo al número de participantes y con base en el hándicap índice.", "Los campeones del Torneo Anual 2025 jugarán en la categoría inmediata superior.", "En la categoría Campeonato sólo podrán participar jugadores invitados por el Club.", "Las categorías Seniors serán de 60 años cumplidos a la fecha del torneo; Súper Seniors de 70 años y mayores.", "En la categoría en que se inscriban menos de 10 jugadores se declarará desierta; los jugadores afectados pasarán a la categoría inmediata superior, siempre y cuando en ésta haya cupo.", "El cupo máximo del torneo será de 348 jugadores.", "DÍA DE PRÁCTICA: los jugadores inscritos no socios tendrán derecho a un día de práctica: 19, 20, 26 y 27 de septiembre de 2026. El lunes 28 de septiembre será la práctica para jugadores foráneos y de Campeonato de clubes fuera de La Laguna.", "Cheque devuelto o cargo de tarjeta no autorizado por el banco causará baja automática del jugador al torneo.", "A partir del 1 de septiembre, por ningún motivo se reembolsará el costo de la inscripción por cancelaciones.", "INFORMACIÓN GENERAL: el Comité Organizador se reserva el derecho de hacer los cambios que juzgue necesarios para el mejor desarrollo del torneo. Cualquier punto no considerado en la presente convocatoria será resuelto por el Comité de Golf y su decisión será final e inapelable."], "inscripcionesText": "En Coordinación Deportiva a partir del 1 de abril de 2026. Cierre de inscripciones el 23 de septiembre de 2026 a las 2:00 p. m. o al completarse el cupo de jugadores por categoría.\\n\\nPara que un jugador quede inscrito debe llenar su ficha de registro, comprobar su hándicap, comprobar su pago y que Coordinación Deportiva le confirme que su inscripción está completa."}', 2, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), sort_order=VALUES(sort_order), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(370, 'costos', 'generic', 'Costos',
'{"sociosPricing": [{"title": "Socios que jugaron Anual 2024 y 2025", "tiers": [{"categoria": "Caballeros", "costo": "14800.00"}, {"categoria": "Damas / Seniors", "costo": "13800.00"}]}, {"title": "Socios que jugaron Anual 2024 ó 2025", "tiers": [{"categoria": "Caballeros", "costo": "15800.00"}, {"categoria": "Damas / Seniors", "costo": "14800.00"}]}, {"title": "Socios que no jugaron Anual 2024 ni 2025", "tiers": [{"categoria": "Caballeros", "costo": "18000.00"}, {"categoria": "Damas / Seniors", "costo": "17000.00"}]}], "foraneosPricing": [{"title": "Jugaron 2024 y 2025", "caballeros": "15800.00", "damasSeniors": "14800.00"}, {"title": "Jugaron 2024 ó 2025", "caballeros": "16800.00", "damasSeniors": "15800.00"}, {"title": "No jugaron 2024 ni 2025", "caballeros": "19000.00", "damasSeniors": "18000.00"}], "pricingNote": "Los costos de socios se podrán pagar en 6, 5, 4, 3 ó 2 mensualidades, dejando forzosamente un pago inicial y los documentos correspondientes a los pagos futuros.\\n\\nMENSUALIDADES — Socios que jugaron 2024 y 2025: Caballeros abril $2,466.66 (6 mens.), mayo $2,960.00 (5), junio $3,700.00 (4), julio $4,933.33 (3), agosto $7,400.00 (2); Damas / Seniors abril $2,300.00, mayo $2,760.00, junio $3,450.00, julio $4,600.00, agosto $6,900.00.\\nSocios que jugaron 2024 ó 2025: Caballeros abril $2,633.33, mayo $3,160.00, junio $3,950.00, julio $5,266.66, agosto $7,900.00; Damas / Seniors abril $2,466.66, mayo $2,960.00, junio $3,700.00, julio $4,933.00, agosto $7,400.00.\\nSocios que no jugaron 2024 ni 2025: Caballeros abril $3,000.00, mayo $3,600.00, junio $4,500.00, julio $6,000.00, agosto $9,000.00; Damas / Seniors abril $2,833.00, mayo $3,400.00, junio $4,250.00, julio $5,666.00, agosto $8,500.00.\\n\\nEl costo de foráneos e invitados es de un solo pago.", "contactInfo": {"bankName": "BANREGIO", "clabe": "058060800000900114", "cuenta": "800-000-90011", "nombre": "CAMPESTRE TORREÓN, S.A. DE C.V.", "email": "roberto.fernandez@campestretorreon.com.mx", "telefono": "(871) 721 23 23 ext. 119 y 155", "telefonoDirecto": "(871) 721 05 41"}, "contactWarning": "Cheque devuelto o cargo de tarjeta no autorizado por el banco causará baja automática del jugador al torneo. A partir del 1 de septiembre, por ningún motivo se reembolsará el costo de la inscripción por cancelaciones.", "inscripcionesText": "En Coordinación Deportiva a partir del 1 de abril de 2026. Cierre: 23 de septiembre de 2026 a las 2:00 p. m. o al completarse el cupo por categoría."}', 3, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), sort_order=VALUES(sort_order), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Días y horarios de juego
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(370, 'servicios', 'list', 'Días y horarios de juego',
'{"items": [{"nombre": "Martes 29 de septiembre", "descripcion": "Matutino (desde 6:40 a. m.): Damas 2da., Damas 1ra., Seniors Campeonato, Seniors A, Seniors B y Súper Seniors. Vespertino (desde 11:30 a. m.): E, D y C."}, {"nombre": "Miércoles 30 de septiembre", "descripcion": "Matutino: Damas 1ra., Damas 2da., Seniors Campeonato, Seniors A, Seniors B y Súper Seniors. Vespertino: E, D y B."}, {"nombre": "Jueves 1 de octubre", "descripcion": "Matutino: E, C y B. Vespertino: A, AA y Campeonato."}, {"nombre": "Viernes 2 de octubre", "descripcion": "Matutino: Damas 1ra., Damas 2da., Seniors Campeonato, Seniors A, Seniors B y Súper Seniors. Vespertino: A, AA y Campeonato."}, {"nombre": "Sábado 3 de octubre", "descripcion": "Matutino: D, C y B. Vespertino: A, AA y Campeonato."}, {"nombre": "Días de práctica", "descripcion": "Jugadores inscritos no socios: 19, 20, 26 y 27 de septiembre de 2026. Lunes 28 de septiembre: práctica para jugadores foráneos y de Campeonato de clubes fuera de La Laguna."}]}', 4, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), sort_order=VALUES(sort_order), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(370, 'competencias', 'list', 'Competencias',
'{"items": [{"nombre": "HOLE IN ONE Y O''YES", "descripcion": "El Comité publicará en su momento la lista de premios por estos conceptos. Los jugadores de Campeonato que deseen participar en estos premios tendrán que pagar su inscripción. Los jugadores que hagan Hole in One en un hoyo con premio para Hole in One no podrán ganar otro premio por concepto de O''Yes. En caso de haber un segundo Hole in One se considerará como el mejor O''Yes. Los premios de Hole in One y O''Yes no son acumulables. Los O''Yes son generales (5 pares 3) y son por bloques de categorías.", "premios": "Lista de premios publicada por el Comité."}, {"nombre": "MEJOR SCORE DIARIO", "descripcion": "Se premiará al mejor Score Diario por categoría de acuerdo al sistema que están jugando. Los desempates serán por comparación de tarjetas. Un jugador sólo tendrá derecho a un premio del Score Diario. El sábado no habrá mejor Score Diario.", "premios": "Premio por categoría y día."}, {"nombre": "EVENTOS ADICIONALES", "descripcion": "Torneo de Putt, Torneo de Approach, Torneo de Drive, Shootout y rifas.", "premios": "Premios anunciados por el Comité."}]}', 5, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), sort_order=VALUES(sort_order), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(370, 'premiacion', 'list', 'Premiación',
'{"items": [{"categoria": "Todas las categorías", "premios": ["Trofeo al primero, segundo y tercer lugar de cada categoría."]}, {"categoria": "Seniors Campeonato y 1ra. Damas", "premios": ["1er lugar Gross: por Stroke Play en Seniors Campeonato y por Stableford en 1ra. Damas."]}, {"categoria": "Campeonato", "premios": ["Copa Challenger. El jugador que la gane 3 veces la tendrá definitivamente."]}]}', 6, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), sort_order=VALUES(sort_order), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(370, 'desempates', 'desempates', 'Desempates',
'{"intro": "Desempates para ganador de trofeo del Torneo Anual 2026 de Campestre Torreón.", "showCorte": false, "showTrofeos": true, "paraCorte": [], "paraTrofeos": ["Para el primer lugar de todas las categorías será muerte súbita en los hoyos asignados por el Comité.", "En las categorías Damas, Seniors y E, que juegan con hándicap, las ventajas serán en los hoyos correspondientes.", "Para las demás posiciones el desempate será determinado por comparación de tarjetas.", "En el Mejor Score Diario los desempates serán por comparación de tarjetas.", "En los O''Yes, en caso de empate ganará quien lo haya realizado primero."], "nota": "El Comité Organizador se reserva el derecho de hacer los cambios que juzgue necesarios para el mejor desarrollo del torneo; su decisión será final e inapelable."}', 7, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), sort_order=VALUES(sort_order), enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;
