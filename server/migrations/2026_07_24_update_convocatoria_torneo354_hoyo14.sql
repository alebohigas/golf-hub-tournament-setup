-- =====================================================================
-- Update: Convocatoria torneoid=354 (Atlas Country Club — TAG 2026)
--   Source: "Terminos_de_competencia_TAG_2026.pdf" (versión final 2026)
--
-- Cambios respecto al seed anterior:
--   * HOLE IN ONE — Hoyo 14: se ELIMINA "Carrito de golf Hardy Carts"
--     y se actualiza "Automóvil de lujo" -> "Mercedes Benz A 200 2026
--     (Mercedes Benz STAR Patria)".
--   * Se refleja el mismo cambio en la sección "competencias" y en
--     "patrocinadoresOficiales" (patrocinador Mercedes Benz STAR Patria
--     en lugar de Hardy Carts).
--
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================
START TRANSACTION;

-- ---------- Premiación (structured prize list) -----------------------
SET @premiacion := '{"items":[{"categoria":"Trofeos por Categoría","premios":["Trofeos de colección, obra del escultor jalisciense Álvaro Cuevas, a los tres primeros lugares de cada categoría."]},{"categoria":"Premio Adicional — Mejor Score del Día","premios":["$7,750.00 (siete mil setecientos cincuenta pesos 00/100 M.N.) al mejor score del día por categoría. No repetible.","En categorías formato Stableford (Damas, D, E y Seniors) el ganador será la tarjeta con el mayor puntaje."]},{"categoria":"O´YES — Hoyos 4, 7, 14 y 17 (Premios por hoyo par 3)","premios":["1° Lugar: $350,000 pesos","2° Lugar: $155,000 pesos","3° Lugar: $75,000 pesos","4° Lugar: $37,500 pesos","5° Lugar: Inscripción Anual 2027","6° Lugar: Reloj Hamilton","7° Lugar: Apple iPad 10.2\\"","8° Lugar: Apple iPad 10.2\\"","9° Lugar: Bocina Bose","10° Lugar: Bocina Bose","En caso de empate en O´yes se calificará en orden cronológico, considerando mejor posicionado al que se haya marcado primero. El O´yes no podrá ser repetible por la misma persona en el mismo hoyo."]},{"categoria":"HOLE IN ONE — Hoyo 4","premios":["SUV Geely Monjaro GF 2026","Carrito de golf SEVEN 2026","Motocicleta Triumph Speed 400 2026"]},{"categoria":"HOLE IN ONE — Hoyo 7","premios":["SUV GAC Enkoo HEV 2025","Carrito de golf Club Car 2026","Motocicleta Indian Sixty Bobber"]},{"categoria":"HOLE IN ONE — Hoyo 14","premios":["Mercedes Benz A 200 2026 (Mercedes Benz STAR Patria)","Moto Triumph Scrambler 400 2026","1.5 millones de pesos al primer Hole In One en el Hoyo 14 durante la última ronda del torneo (premio especial)."]},{"categoria":"HOLE IN ONE — Hoyo 17","premios":["BMW 220i Coupé 2027","Moto Triumph Scrambler 1200 X 2026","Carrito de golf Golf Lozano"]},{"categoria":"Notas Hole In One","premios":["En caso de un segundo Hole In One se considerará como mejor O´yes y así sucesivamente, siguiendo el orden cronológico del evento.","El deducible será pagado por el ganador.","El premio de 1.5 millones de pesos del Hoyo 14 aplica únicamente en la última ronda de juego de cada una de las categorías."]}]}';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled)
VALUES (354, 'premiacion', 'premiacion', 'Premiación', @premiacion, 5, 1)
ON DUPLICATE KEY UPDATE section_type='premiacion', content=@premiacion, enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------- Competencias Especiales ----------------------------------
SET @competencias := '{"items":[{"nombre":"O´YES (Closest to the Pin)","descripcion":"Premios en los hoyos par 3 (4, 7, 14 y 17). En caso de empate se califica en orden cronológico (mejor posicionado el que se marcó primero). El O´yes no es repetible por la misma persona en el mismo hoyo.","premios":"1°: $350,000 · 2°: $155,000 · 3°: $75,000 · 4°: $37,500 · 5°: Inscripción Anual 2027 · 6°: Reloj Hamilton · 7°-8°: Apple iPad 10.2\\" · 9°-10°: Bocina Bose."},{"nombre":"Hole In One — Hoyo 4","descripcion":"Premio al primer Hole In One en el Hoyo 4. El deducible será pagado por el ganador.","premios":"SUV Geely Monjaro GF 2026 + Carrito SEVEN 2026 + Motocicleta Triumph Speed 400 2026."},{"nombre":"Hole In One — Hoyo 7","descripcion":"Premio al primer Hole In One en el Hoyo 7.","premios":"SUV GAC Enkoo HEV 2025 + Carrito Club Car 2026 + Motocicleta Indian Sixty Bobber."},{"nombre":"Hole In One — Hoyo 14","descripcion":"Premio al primer Hole In One en el Hoyo 14. El premio especial de 1.5 millones aplica únicamente en la última ronda de juego de cada categoría.","premios":"Mercedes Benz A 200 2026 (Mercedes Benz STAR Patria) + Moto Triumph Scrambler 400 2026 + 1.5 millones de pesos (última ronda)."},{"nombre":"Hole In One — Hoyo 17","descripcion":"Premio al primer Hole In One en el Hoyo 17.","premios":"BMW 220i Coupé 2027 + Moto Triumph Scrambler 1200 X 2026 + Carrito Golf Lozano."},{"nombre":"Premio Adicional — Mejor Score del Día","descripcion":"Premio al mejor score del día por categoría. No repetible. En categorías Stableford (Damas, D, E y Seniors) gana la tarjeta con mayor puntaje.","premios":"$7,750.00 por día por categoría."},{"nombre":"¡Grandes Sorpresas!","descripcion":"Rifas durante la feria del pueblo y la ceremonia de premiación entre los participantes inscritos.","premios":"Diversos premios sorpresa."}]}';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, section_title, content, sort_order, enabled)
VALUES (354, 'competencias', 'competencias', 'Competencias Especiales', @competencias, 8, 1)
ON DUPLICATE KEY UPDATE section_type='competencias', content=@competencias, enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------- Patrocinadores Oficiales ---------------------------------
SET @patrocinadores := '{"items":[{"premio":"Hole In One — Hoyo 4","patrocinador":"Geely / SEVEN / Triumph","descripcion":"SUV Geely Monjaro GF 2026, Carrito SEVEN 2026 y Motocicleta Triumph Speed 400 2026."},{"premio":"Hole In One — Hoyo 7","patrocinador":"GAC / Club Car / Indian Motorcycle","descripcion":"SUV GAC Enkoo HEV 2025, Carrito Club Car 2026 y Motocicleta Indian Sixty Bobber."},{"premio":"Hole In One — Hoyo 14","patrocinador":"Mercedes Benz STAR Patria / Triumph / Atlas Country Club","descripcion":"Mercedes Benz A 200 2026, Moto Triumph Scrambler 400 2026 y $1.5 millones de pesos al primer Hole In One en la última ronda."},{"premio":"Hole In One — Hoyo 17","patrocinador":"BMW / Triumph / Golf Lozano","descripcion":"BMW 220i Coupé 2027, Moto Triumph Scrambler 1200 X 2026 y Carrito Golf Lozano."},{"premio":"World Amateur Golf Ranking","patrocinador":"WAGR","descripcion":"Torneo reconocido por el World Amateur Golf Ranking."}]}';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, section_title, content, sort_order, enabled)
VALUES (354, 'patrocinadoresOficiales', 'patrocinadores', 'Patrocinadores Oficiales', @patrocinadores, 11, 1)
ON DUPLICATE KEY UPDATE section_type='patrocinadores', content=@patrocinadores, enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;