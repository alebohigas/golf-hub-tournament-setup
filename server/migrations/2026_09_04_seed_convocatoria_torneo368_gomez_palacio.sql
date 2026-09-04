-- =====================================================================
-- Seed: /convocatoria para torneoid = 368
-- LXXXIX (89) TORNEO ANUAL DE GOLF 2026 — Club Campestre de Gómez Palacio A.C.
-- Del 11 al 13 de septiembre de 2026
-- Fuente: PDF oficial "89 Torneo Anual de Golf 2026".
-- Idempotente vía ON DUPLICATE KEY UPDATE (clave única torneoid+section_id).
-- NOTA: sin GRANT/privilegios (MySQL IONOS).
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general (sede, fechas, formato, bases)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(368, 'descripcion', 'generic', 'Descripción',
'{"text": "LXXXIX TORNEO ANUAL DE GOLF 2026 — CLUB CAMPESTRE DE GÓMEZ PALACIO A.C.\\nDel 11 al 13 de septiembre de 2026.\\n\\nEl Campestre Gómez Palacio A.C. invita a los golfistas aficionados de la República Mexicana y del extranjero a participar en el 89° Torneo Anual de Golf 2026.\\n\\nLos horarios y días de juego por categorías se publicarán en las vitrinas del club y en www.speitour.mx al cierre de las inscripciones.\\n\\nSISTEMA DE JUEGO:\\n· Todas las categorías jugarán 36 hoyos (18 por día), excepto Novatos que jugará 18 hoyos (9 por día).\\n· Se jugará de acuerdo a las reglas de la Federación Mexicana de Golf y las reglas locales del club.\\n\\nCierre de inscripciones: 10 de septiembre a las 15:00 hrs."}', 1, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad (requisitos, categorías con rangos y marcas de salida)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(368, 'elegibilidad', 'elegibilidad', 'Elegibilidad',
'{"eligibilityText": "Podrán participar todos los golfistas aficionados que tengan hándicap registrado y con el índex del mes de agosto de 2026 en la mesa de salida que haya generado el hándicap en la FMG / SPEI. Se recibirá carta firmada por el profesional y avalada por el comité de golf del club al que pertenezca (cartas sujetas a autorización por el comité organizador).", "notesText": ["CATEGORÍAS Y MARCAS DE SALIDA: Primera index 0.4 a 6.9 — azules, Stroke Play al 80% del hcp · A index 7.0 a 11.5 — blancas, Stableford con ventaja · B index 11.6 a 16.2 — blancas, Stableford con ventaja · C index 16.3 a 20.8 — blancas, Stableford con ventaja · D index 20.9 a 31.9 — blancas, Stableford con ventaja · Novatos sin ventaja — Stableford, 9 hoyos por día · Damas index 0 a 35.2 al 80% — rojas, Stableford · Seniors 60 años y mayores — doradas, Stableford: Seniors Primera index 0.0 a 15.5 al 80% y Seniors Segunda index 16.0 a 29.0 al 80%.", "El cupo límite por categoría (Primera, A, B, C, D, Novatos) será de 34 jugadores; en Damas y Seniors será de 34 jugadores(as).", "No podrán participar jugadores menores de 18 años, excepto en la Primera categoría.", "Los jugadores invitados permitidos serán los acreditados de las giras juveniles cuyo nivel de juego esté dentro de los rangos de hándicap establecidos, dentro de la Primera categoría. Quienes deseen participar en Hole in One, O''Yes y rifas deberán pagar su inscripción antes de iniciar el torneo.", "El carrito de golf es permitido en todas las categorías, circulando únicamente por los caminos autorizados, a excepción de la categoría Seniors que podrá jugar bajo la regla de 90°.", "El juego lento será penalizado (regla 6-7).", "En las categorías bajo Stroke Play, los jugadores que no se presenten a la hora de su salida quedan automáticamente descalificados (regla 6-3).", "En las categorías bajo Stableford, los jugadores que lleguen tarde podrán alcanzar a su grupo y no marcarán puntos en los hoyos que su grupo ya haya jugado.", "Todas las controversias sobre la aplicación de las reglas y de esta convocatoria serán resueltas por el juez de reglas y avaladas por el comité de golf; su fallo será inapelable.", "El comité organizador se reserva el derecho de hacer cualquier modificación que juzgue necesaria para el mejor desarrollo del torneo."], "inscripcionesText": "Informes e inscripciones: Tels. (871) 714 20 35 y 714 49 10 ext. 18 · Celular y WhatsApp (871) 158 87 44 / (871) 211 72 72 · Facebook: Club Campestre Gómez Palacio.\\nPago por transferencia a nombre de Impulsora del Deporte Gómez Palacio A.C. — Banco BBVA, CLABE 012060001216414682."}', 2, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos de inscripción (importes DECIMAL canónicos)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(368, 'costos', 'generic', 'Costos',
'{"sociosPricing": [{"title": "Inscripción", "caballeros": "4500.00", "damasSeniors": "4500.00"}], "foraneosPricing": [], "pricingNote": "Caballeros, Damas y Seniors $4,500.00.", "inscripcionesText": "Cierre de inscripciones: 10 de septiembre a las 15:00 hrs.\\nUna vez realizado el pago de inscripción no habrá devoluciones.\\n\\nInformes e inscripciones: Tels. (871) 714 20 35 y 714 49 10 ext. 18 · Celular y WhatsApp (871) 158 87 44 / (871) 211 72 72.\\nPago por transferencia a nombre de Impulsora del Deporte Gómez Palacio A.C. — Banco BBVA, CLABE 012060001216414682."}', 3, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias / premios especiales (Hole in One y O''Yes)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(368, 'competencias', 'list', 'Competencias',
'{"items": [{"nombre": "HOLE IN ONE — Hoyo 3", "descripcion": "Si existiera un segundo hole in one en este o en cualquier otro hoyo, será considerado como mejor O''Yes.", "premios": "Automóvil MAZDA2 2026."}, {"nombre": "HOLE IN ONE — Hoyo 7", "descripcion": "En caso de no realizarse el hole in one, el premio será rifado en la cena de premiación. Es necesaria la presencia del jugador agraciado para hacerse acreedor a los premios rifados. El jugador(a) deberá ser mayor de 18 años y haber pagado su inscripción antes de iniciar el torneo y/o contar con cortesía de algún patrocinador previamente autorizada.", "premios": "$5,000.00 dólares."}, {"nombre": "O''YES GENERAL — Hoyos 3, 7, 10 y 12", "descripcion": "Premios a las mejores O''Yes general de todas las categorías. El primer tiro que realice el jugador es el que contará para su O''Yes. Los premios O''Yes no son acumulables.", "premios": "1° $1,000.00 dlls · 2° $850.00 dlls · 3° $700.00 dlls · 4° $550.00 dlls · 5° $400.00 dlls · 6° $200.00 dlls · 7° $100.00 dlls."}, {"nombre": "SHOT OUT PUTT — Viernes 11 de septiembre", "descripcion": "Se realiza durante el rompe hielo.", "premios": "Premio único al 1er lugar: $200.00 dlls."}, {"nombre": "TORNEO DE APPROACH — Sábado 12 de septiembre, hoyo 18", "descripcion": "A partir de las 19:30 hrs.", "premios": "Premio al 1er lugar: $200.00 dlls."}]}', 4, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación (trofeos por categoría)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(368, 'premiacion', 'list', 'Premiación',
'{"items": [{"categoria": "TROFEOS — Todas las categorías", "premios": ["Primer lugar: Trofeo.", "Segundo lugar: Trofeo.", "Tercer lugar: Trofeo."]}]}', 5, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Programa de actividades
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(368, 'servicios', 'list', 'Programa',
'{"items": [{"nombre": "Viernes 11 de septiembre", "descripcion": "Rompe hielo 19:30 hrs con música en vivo en la Terraza del Club. Shot Out Putt, premio solo al 1er lugar: $200.00 dlls."}, {"nombre": "Sábado 12 de septiembre", "descripcion": "Primera ronda del torneo. Torneo de Approach 19:30 hrs en el hoyo 18, premio al 1er lugar: $200.00 dlls."}, {"nombre": "Domingo 13 de septiembre", "descripcion": "Ronda final del torneo. Ceremonia de premiación y rifas 20:00 hrs."}, {"nombre": "Hotel sede", "descripcion": "Posada del Río · Reservaciones: (871) 714 33 99."}]}', 6, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(368, 'desempates', 'desempates', 'Desempates',
'{"intro": "Los desempates de las categorías que jueguen bajo el sistema Stroke Play serán a muerte súbita sin hándicap, solo por el primer lugar, en el hoyo que el profesional designe. Las categorías que juegan bajo el sistema Stableford se desempatan igual que en Stroke Play.", "showCorte": false, "showTrofeos": true, "paraCorte": [], "paraTrofeos": ["Primer lugar: muerte súbita sin hándicap en el hoyo que designe el profesional.", "Los demás lugares: por retrogresión de los últimos 9 hoyos jugados."], "nota": "El comité organizador se reserva el derecho de hacer cualquier modificación que juzgue necesaria para el mejor desarrollo del torneo."}', 7, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;
