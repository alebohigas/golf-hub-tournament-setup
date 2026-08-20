-- =====================================================================
-- Seed: /convocatoria para torneoid = 366
-- 50 TORNEO DE ORO 2026 — Club Campestre de Ciudad Juárez
-- Del 7 al 12 de septiembre de 2026
-- Fuente: cartel oficial "50 Torneo de Oro 2026".
-- Idempotente vía ON DUPLICATE KEY UPDATE (clave única torneoid+section_id).
-- NOTA: sin GRANT/privilegios (MySQL IONOS).
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general (sede, fechas, formato, categorías)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(366, 'descripcion', 'generic', 'Descripción',
'{"text": "50 TORNEO DE ORO 2026 — CLUB CAMPESTRE DE CIUDAD JUÁREZ.\\nDel 7 al 12 de septiembre de 2026.\\n\\nPodrán participar todos los jugadores amateurs con hándicap registrado y actualizado. En todas las categorías la edad mínima será de 13 años con hándicap actualizado.\\n\\nSISTEMA DE JUEGO:\\n· Se jugará a 54 hoyos STROKE PLAY. Todas las categorías jugarán SIN hándicap.\\n· Las categorías MUJERES y SENIORS se jugarán a 36 hoyos STROKE PLAY.\\n· Las categorías E, MUJERES y SENIORS se jugarán con el 80% del hándicap.\\n\\nCada categoría se abrirá con un mínimo de 20 jugadores inscritos.\\n\\nInscripciones: Ramón Macías · (656) 202 6595."}', 1, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad (requisitos, categorías con rangos y marcas de salida)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(366, 'elegibilidad', 'elegibilidad', 'Elegibilidad',
'{"eligibilityText": "Podrán participar todos los jugadores amateurs con hándicap registrado y actualizado. En todas las categorías la edad mínima será de 13 años con hándicap actualizado.", "notesText": ["CATEGORÍAS Y MARCAS DE SALIDA: Campeonato hasta 3.0 — negras · AA 3.1 a 6.6 — negras · A 6.7 a 10.4 — azules · B 10.5 a 14.3 — azules · C 14.4 a 18.2 — blancas · D 18.3 a 22.8 — blancas · E 22.9 en adelante — blancas · Mujeres — rojas · Seniors 65+ — doradas.", "Cada categoría se abrirá con un mínimo de 20 jugadores inscritos.", "Se jugará a 54 hoyos Stroke Play; todas las categorías sin hándicap.", "Las categorías Mujeres y Seniors se jugarán a 36 hoyos Stroke Play.", "Las categorías E, Mujeres y Seniors se jugarán con el 80% del hándicap.", "Todos los participantes reciben $350 USD a elegir en mercancía; Mujeres y Séniors $250 USD.", "Pulsera obligatoria para todos los participantes: incluye desayunos, comidas y bebidas en el área del campo y en el área del comedor durante sus rondas correspondientes.", "Todo acompañante deberá portar pulsera para ingresar al campo, sin excepción. Pulseras no transferibles.", "Pulsera para invitados: $1,200.00 por día o $3,000.00 por las tres rondas. Precio por persona, incluye entrada al torneo, alimentos y bebidas.", "Cena de cierre: $1,500.00 por persona. Se vende por separado y no está incluida en la pulsera."], "inscripcionesText": "Inscripciones con Ramón Macías · (656) 202 6595.\\nPago en efectivo en Pro Shop o transferencia: CAMPESTRE JUÁREZ A.C. — BANREGIO · No. de cuenta 067008210141 · CLABE 058164670082101410."}', 2, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos de inscripción (importes DECIMAL canónicos)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(366, 'costos', 'generic', 'Costos',
'{"sociosPricing": [{"title": "Socios", "caballeros": "13000.00", "damasSeniors": "10000.00"}], "foraneosPricing": [{"title": "Invitados no socios", "caballeros": "15000.00", "damasSeniors": "12000.00"}], "pricingNote": "Socios $13,000.00 · Invitados no socios $15,000.00 · Socios juveniles, mujeres y séniors $10,000.00 · No socios juveniles, mujeres y séniors $12,000.00.", "inscripcionesText": "INCLUYE: crédito en mercancía a elegir en el Pro Shop ($350 USD; Mujeres y Séniors $250 USD), pulsera de participante, 1 pulsera de invitado por las tres rondas y 2 boletos para la cena de cierre.\\n\\nPulsera para invitados: $1,200.00 por día o $3,000.00 por las tres rondas (incluye entrada al torneo, alimentos y bebidas). Cena de cierre: $1,500.00 por persona, se vende por separado.\\n\\nInscripciones: Ramón Macías · (656) 202 6595.\\nPAGO EN EFECTIVO EN PRO SHOP o transferencia a CAMPESTRE JUÁREZ A.C. — BANREGIO · No. de cuenta 067008210141 · CLABE 058164670082101410."}', 3, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias / premios especiales (O''Yeses y Hole in One)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(366, 'competencias', 'list', 'Competencias',
'{"items": [{"nombre": "O''YESES — Hoyos 6, 8, 12 y 17", "descripcion": "Premiación por acierto en cada uno de los cuatro hoyos designados.", "premios": "1er lugar $50,000.00 · 2do lugar $30,000.00 · 3er lugar $20,000.00 · 4to lugar Set de bastones · 5to lugar Driver · 6to lugar Televisión de 75\\"."}, {"nombre": "HOLE IN ONE — Hoyo 12", "descripcion": "Premio mayor del torneo, cortesía de Touché Motors.", "premios": "Mercedes Benz 2026."}, {"nombre": "HOLE IN ONE — Hoyo 6", "descripcion": "Premio cortesía de Club Car.", "premios": "Carrito de golf Club Car."}, {"nombre": "CRÉDITO EN MERCANCÍA", "descripcion": "Para todos los participantes, a elegir en el Pro Shop.", "premios": "$350 USD · Mujeres y Séniors $250 USD."}]}', 4, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación (Centenarios por categoría)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(366, 'premiacion', 'list', 'Premiación',
'{"items": [{"categoria": "CENTENARIOS — Primeros lugares de cada categoría (sujeto a un mínimo de 35 jugadores por categoría)", "premios": ["Primer lugar: Trofeo y un Centenario.", "Segundo lugar: Trofeo y $30,000 MXN.", "Tercer lugar: Trofeo e inscripción 2027."]}]}', 5, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates y términos generales
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(366, 'desempates', 'desempates', 'Desempates',
'{"intro": "El criterio de desempate será determinado por el Comité Organizador.", "showCorte": false, "showTrofeos": true, "paraCorte": [], "paraTrofeos": ["El criterio de desempate para trofeos será determinado por el Comité Organizador."], "nota": "La bolsa total de premios está basada en la participación de un mínimo de 35 jugadores amateurs. En caso de que el número de jugadores inscritos sea menor, la organización se reserva el derecho de ajustar proporcionalmente la cantidad a repartir. Todos los montos comunicados en la convocatoria o programa del torneo representan una estimación referencial de la distribución de los premios otorgados y no corresponden exclusivamente a una sola categoría. Los regalos, premios en especie y/o cortesías ofrecidos durante el torneo están sujetos a disponibilidad por parte de los patrocinadores y proveedores; la organización no garantiza su entrega ni se hace responsable por cambios, sustituciones, demoras o cancelaciones ajenas a su control. En caso de que algún regalo o premio no pueda ser entregado por causas de fuerza mayor, logística o decisión del patrocinador, la organización se reserva el derecho de sustituirlo por otro de valor equivalente o eliminarlo de manera permanente, sin que esto genere derecho a reclamo, compensación o reembolso por parte del participante. La inscripción al torneo implica la aceptación expresa de estos términos, así como del derecho de la organización a realizar ajustes logísticos, operativos o financieros necesarios para la realización del evento. Imágenes ilustrativas."}', 6, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;
