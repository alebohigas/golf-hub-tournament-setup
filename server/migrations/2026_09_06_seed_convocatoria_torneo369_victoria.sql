-- =====================================================================
-- Seed: /convocatoria para torneoid = 369
-- 63° TORNEO ANUAL DE GOLF (Caballeros) — 15 al 18 de octubre de 2026
-- XXIX TORNEO ANUAL FEMENIL (Damas)     — 12 al 14 de octubre de 2026
-- Club Campestre Victoria A.C.
-- Fuente: PDF oficial "Convocatoria Victoria 2026" (14 páginas).
--
-- La convocatoria está dividida en dos ramas (CABALLEROS / DAMAS) y el
-- contenido se publica con ese encabezado explícito en cada sección.
-- EXCEPCIÓN: las CATEGORÍAS y el CALENDARIO DE JUEGO NO se siembran aquí
-- porque ya están publicados en la base de datos (torneos.categorias /
-- torneos.caljuego) y esas páginas los leen directamente.
--
-- Idempotente vía ON DUPLICATE KEY UPDATE (clave única torneoid+section_id).
-- NOTA: sin GRANT/privilegios (MySQL IONOS).
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general (sede, fechas y sistema de juego por rama)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'descripcion', 'generic', 'Descripción',
'{"text": "CLUB CAMPESTRE VICTORIA A.C. — TORNEO ANUAL 2026\\n\\n▌CABALLEROS — 63° TORNEO ANUAL DE GOLF\\nDel 15 al 18 de octubre de 2026 en las instalaciones del Club.\\nSe convoca a todos los socios del Club Campestre Victoria A. C. y a sus invitados.\\nSistema de juego: Stroke Play a 54 hoyos, con corte después de la segunda ronda. Pasan a la final los mejores 12 por categoría. Trofeos para 1°, 2° y 3° lugar.\\nLas categorías Campeonato, AA, A, B y C juegan sin hándicap; las categorías D y Senior juegan con el 80% del hándicap.\\n\\n▌DAMAS — XXIX TORNEO ANUAL FEMENIL\\n12, 13 y 14 de octubre de 2026.\\nEl Comité Femenil de Golf invita a las damas golfistas a participar en el Torneo de Aniversario 2026.\\nSistema de juego: categorías A, B, C y D bajo Stroke Play a 36 hoyos con el 80% del hándicap al 1 de octubre. Categoría Estrellitas bajo Stableford a 18 hoyos sin hándicap (bogey 1 punto, par 2, birdie 3, eagle 4).\\nPráctica: lunes 12 de octubre a partir de las 15:00 horas.\\n\\nLas categorías y el calendario de juego oficial se publican en las páginas de Categorías y Calendario de juego de este sitio."}', 1, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad (bases por rama + notas importantes)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'elegibilidad', 'elegibilidad', 'Elegibilidad',
'{"eligibilityText": "CABALLEROS (63° Torneo Anual): podrán participar caballeros mayores de 18 años con hándicap vigente registrado por sus clubes, publicado al 1 de octubre de 2026. Se permitirá participar a jugadores juveniles que tengan hándicap registrado en su club, únicamente en la categoría de Campeonato.\\n\\nDAMAS (XXIX Torneo Anual Femenil): podrán participar las jugadoras amateurs que lo deseen, quedando registradas en la categoría correspondiente de acuerdo con el hándicap registrado al 1 de octubre. Las jugadoras deberán contar con su hándicap registrado en GHIN o SPEI.", "notesText": ["CABALLEROS — Cupo máximo de 18 jugadores por categoría y corte a los mejores 12 en todas las categorías.", "CABALLEROS — Se declarará desierta una categoría si tiene menos de 6 participantes; la fecha límite para definirla será el 14 de octubre de 2026. En caso de no tener el mínimo de jugadores, el comité organizador podrá fusionar la categoría con alguna otra.", "CABALLEROS — Categoría B: si son demasiados jugadores, se jugará el viernes AM y PM por sorteo; la salida del sábado será por scores.", "CABALLEROS — En los O''Yes sólo se podrá ganar un premio por participante; en caso de empate, ganará quien lo haya realizado primero.", "DAMAS — Para considerar abiertas las categorías deberá haber mínimo cuatro jugadoras inscritas.", "DAMAS — Práctica: lunes 12 de octubre a partir de las 15:00 horas.", "Las rondas y días de juego están sujetos a cambio sin previo aviso para beneficio general del torneo. El comité organizador se reserva el derecho de hacer los cambios necesarios y sus decisiones serán inapelables."], "inscripcionesText": "CABALLEROS — Inscripciones abiertas para socios e invitados a partir del 10 de agosto de 2026. Fecha límite: miércoles 14 de octubre de 2026. Administración del Club con Rosario, Tel. (834) 316 0618 ext. 114.\\n\\nDAMAS — La jugadora deberá inscribirse en la oficina del Club Campestre Victoria A. C. Cierre de inscripciones: 30 de septiembre. Contacto: María del Rosario Mata Barrón, Tels. (834) 316 0618, (834) 316 3856 y (834) 217 2429.\\n\\nPAGO (ambas ramas): Banco Banregio, a nombre de Club Campestre Victoria, A. C. · Cuenta 74889900010 · CLABE 058810748899000100. Enviar comprobante de pago con el nombre del jugador(a) al correo rosario69_3@hotmail.com."}', 2, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos de inscripción (columna Caballeros / columna Damas)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'costos', 'generic', 'Costos',
'{"sociosPricing": [{"title": "Pre-inscripción Damas (hasta el 18 de septiembre)", "caballeros": "0.00", "damasSeniors": "4000.00"}, {"title": "Inscripción Caballeros (hasta el 30 de septiembre)", "caballeros": "7900.00", "damasSeniors": "4500.00"}, {"title": "Inscripción Caballeros (del 1 de octubre en adelante)", "caballeros": "8500.00", "damasSeniors": "4500.00"}], "foraneosPricing": [{"title": "Invitados / Invitadas", "caballeros": "8500.00", "damasSeniors": "5000.00"}], "pricingNote": "CABALLEROS: socios $7,900.00 hasta el 30 de septiembre; $8,500.00 del 1 de octubre en adelante; invitados $8,500.00. Caddies $600.00 por 18 hoyos.\\n\\nDAMAS: pre-inscripción hasta el 18 de septiembre — socias $4,000.00 e invitadas $4,500.00; inscripción normal — socias $4,500.00 e invitadas $5,000.00. Caddies $500.00 por 9 hoyos y $800.00 por 18 hoyos. Renta de carrito por día $500.00 (informes en la Oficina de Golf o reservaciones (834) 115 6150).", "inscripcionesText": "CABALLEROS — Cierre: miércoles 14 de octubre de 2026 · Administración del Club con Rosario, Tel. (834) 316 0618 ext. 114.\\nDAMAS — Cierre: 30 de septiembre.\\n\\nPago: Banregio, Club Campestre Victoria, A. C. · Cuenta 74889900010 · CLABE 058810748899000100. Comprobante al correo rosario69_3@hotmail.com."}', 3, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias y premios especiales (divididos por rama)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'competencias', 'list', 'Competencias',
'{"items": [{"nombre": "CABALLEROS — HOLE IN ONE", "descripcion": "Un automóvil para el primer Hole in One. En caso de haber más de un Hole in One durante el torneo, se considerará con un O''Yes de 0.0 metros. Si no existe Hole in One, el automóvil se rifa en la premiación.", "premios": "Automóvil."}, {"nombre": "CABALLEROS — O''YES GENERAL (hoyos 6, 8, 15 y 17)", "descripcion": "Sólo se podrá ganar un O''Yes por jugador: el de mayor valor. En caso de empate gana quien lo haya realizado primero.", "premios": "1° $30,000.00 · 2° Set de fierros TM Qi Acero · 3° TV 85\\" · 4° Driver TM QiD4 · 5° TV 70\\" · 6° Bolsa Ghost · 7° Putter TM · 8° Reloj Garmin · 9° Bolsa TaylorMade · 10° Rangefinder."}, {"nombre": "CABALLEROS — PEOR O''YES, hoyo 6", "descripcion": "Premio especial al peor O''Yes del hoyo 6 haciendo 2 putts.", "premios": "TV 100\\"."}, {"nombre": "CABALLEROS — TORNEO DE PUTT", "descripcion": "Jueves 15 de octubre, 7:00 p. m. en el Putting Green. Circuito de putt en Match Play: el ganador pasa a la siguiente ronda y así sucesivamente.", "premios": "1° Putter Spyder ZT · 2° Putter TM · 3° Bolsa TM · 4° Rangefinder."}, {"nombre": "CABALLEROS — DRIVER DE DISTANCIA Y PRECISIÓN", "descripcion": "16 de octubre en la Terraza. Distancia: califican los 16 tiros más largos entre camino y camino en el hoyo 1. Precisión: califican los 16 tiros más cercanos a la línea pintada en el fairway del hoyo 10. Sólo se podrá calificar a una de las dos modalidades. Desempate: gana el jugador que haya tirado primero.", "premios": "Premio al primer y segundo lugar de cada modalidad."}, {"nombre": "CABALLEROS — TORNEO DE APPROACH", "descripcion": "Sábado 17 de octubre, 7:00 p. m. en la Terraza. Ronda de clasificación: los 16 jugadores más cercanos a la bandera pasan a la ronda de matches, determinada al azar, con dos tiros por jugador en matches. En la clasificación cada participante tiene derecho a 1 tiro y puede comprar dos tiros adicionales de $150.00 c/u.", "premios": "Hole in One $25,000.00 · 1° Set de fierros TM · 2° Wedges (2) · 3° Bolsa de golf TM · 4° Rangefinder."}, {"nombre": "DAMAS — O''YES (pares 3: hoyos 6, 8, 15 y 17)", "descripcion": "Mejor O''Yes en cada uno de los pares 3. Una jugadora no puede ganar más de un O''Yes. En caso de empate gana la primera que marque en tiempo.", "premios": "$5,000.00 por cada O''Yes."}, {"nombre": "DAMAS — DRIVER DE PRECISIÓN, hoyo 1", "descripcion": "Gana la jugadora que deje la pelota del drive más cerca de la línea marcada en el hoyo 1. Se lleva a cabo el primer día de juego. En caso de empate gana la de mayor distancia.", "premios": "$7,000.00."}, {"nombre": "DAMAS — TORNEO DE APPROACH", "descripcion": "Martes 13 de octubre durante el rompehielo. Cada jugadora cuenta con una oportunidad gratis y hasta dos oportunidades adicionales de $100.00 c/u. El premio se otorga a la bola más cercana al hoyo.", "premios": "$5,000.00."}]}', 4, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación (trofeos por rama)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'premiacion', 'list', 'Premiación',
'{"items": [{"categoria": "CABALLEROS — Todas las categorías", "premios": ["Trofeos para 1°, 2° y 3° lugar.", "Final: los mejores 12 jugadores por categoría después del corte."]}, {"categoria": "DAMAS — Categoría A", "premios": ["1er lugar Gross.", "1° y 2° lugar Neto."]}, {"categoria": "DAMAS — Categorías B, C y D", "premios": ["1°, 2° y 3er lugar Neto."]}, {"categoria": "DAMAS — Categoría Estrellitas", "premios": ["1°, 2° y 3er lugar por mejor puntuación (Stableford)."]}]}', 5, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Programa de actividades (eventos nocturnos y sociales por rama)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'servicios', 'list', 'Programa',
'{"items": [{"nombre": "DAMAS — Lunes 12 de octubre", "descripcion": "8:00 a. m. 1ª ronda categoría Estrellitas · 3:00 p. m. ronda de práctica categorías A, B, C y D."}, {"nombre": "DAMAS — Martes 13 de octubre", "descripcion": "8:00 a. m. 2ª ronda categoría Estrellitas · 12:00 p. m. inauguración · 1:00 p. m. 1ª ronda categorías A, B, C y D · 7:00 p. m. rompehielo con cena en los asadores del Club y Torneo de Approach."}, {"nombre": "DAMAS — Miércoles 14 de octubre", "descripcion": "7:00 a. m. desayuno · 9:00 a. m. 2ª ronda categorías A, B, C y D · 2:00 p. m. comida, premiación y rifa."}, {"nombre": "CABALLEROS — Jueves 15 de octubre", "descripcion": "7:00 p. m. Torneo de Putt en el Putting Green."}, {"nombre": "CABALLEROS — Viernes 16 de octubre", "descripcion": "Torneo Driver de Distancia y Precisión en la Terraza."}, {"nombre": "CABALLEROS — Sábado 17 de octubre", "descripcion": "7:00 p. m. Torneo de Approach en la Terraza."}, {"nombre": "CABALLEROS — Domingo 18 de octubre", "descripcion": "Ronda final y premiación."}]}', 6, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates (corte y trofeos, con reglas específicas de cada rama)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'desempates', 'desempates', 'Desempates',
'{"intro": "CABALLEROS (63° Torneo Anual) y DAMAS (XXIX Torneo Anual Femenil) manejan criterios propios de desempate, descritos a continuación.", "showCorte": true, "showTrofeos": true, "paraCorte": ["CABALLEROS — Para corte: comparación de tarjetas (últimos 9 hoyos, 6 hoyos, 3 hoyos y hoyo 18), de la vuelta del hoyo 10 al 18."], "paraTrofeos": ["CABALLEROS — Para trofeos: sólo para el primer lugar se jugará a muerte súbita iniciando por el hoyo 18; si persiste el empate se continuará en el hoyo 1 y 18.", "CABALLEROS — En las categorías D y Senior el desempate se jugará gross (sin hándicap).", "CABALLEROS — El resto de los empates se resuelven por comparación de tarjetas y, de persistir, por retrogresión. En las categorías que se juegan con hándicap los desempates se definen con el score neto.", "DAMAS — Primer lugar: muerte súbita en el campo por el hoyo 1; si persiste, hoyo 9 y así sucesivamente (1 y 9) en caso de ser necesario.", "DAMAS — Segundo lugar: por tarjeta (regla 33-6), comparando la suma de los últimos 9 hoyos, después 6 hoyos, después 3 hoyos y luego el último hoyo, con la tarjeta del último día.", "DAMAS — En los desempates se jugará Gross, mismo caso para los que se lleven a cabo por tarjeta."], "nota": "El comité organizador se reserva el derecho de hacer los cambios necesarios para el mejor desarrollo del torneo y sus decisiones serán inapelables."}', 7, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Condiciones de competencia y reglas locales (aplican a ambas ramas)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled) VALUES
(369, 'reglas', 'list', 'Condiciones de competencia',
'{"items": [{"nombre": "Publicación", "descripcion": "Las condiciones y reglas se publicarán en los pizarrones de avisos y se entregarán junto con las tarjetas de score."}, {"nombre": "Reglas aplicables", "descripcion": "Las reglas del torneo serán las que rigen en la USGA, adoptadas por la Federación Mexicana de Golf, y las reglas locales del Club."}, {"nombre": "Controversias", "descripcion": "Las controversias serán resueltas por el Director de Reglas y su fallo será definitivo. Las decisiones del Comité Organizador y del Comité de Reglas son inapelables."}, {"nombre": "Rondas y días de juego", "descripcion": "Están sujetos a cambio sin previo aviso para beneficio general del torneo. En caso de condiciones climatológicas adversas, se tomará como primer criterio rondas de 9 hoyos cuando aplique."}, {"nombre": "Entrega de tarjetas", "descripcion": "Los jugadores deberán entregar sus tarjetas firmadas dentro de los 15 minutos siguientes a la finalización de la ronda, con el score gross claramente escrito y firmadas por su anotador."}]}', 8, 1)
ON DUPLICATE KEY UPDATE section_type=VALUES(section_type), title=VALUES(title), content=VALUES(content), enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;
