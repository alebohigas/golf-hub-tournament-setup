-- =====================================================================
-- Seed: /convocatoria content for torneoid=360
-- Torneo Anual de Golf Club Campestre de Durango 2026 (05 al 08 de Agosto)
-- Reglas locales, categorías y desempates viven en /reglas
-- (ver seed reglas_torneo360_campestre_durango).
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Descripción general (I. CONVOCATORIA)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'descripcion', 'generic', '{"text": "El Club Campestre de Durango, A.C., se complace en invitar a los golfistas aficionados de la República Mexicana y del extranjero, a participar en el tradicional Torneo Anual de Golf ''Fiestas de la Ciudad'' del Campestre de Durango, edición 2026, del 05 al 08 de agosto de 2026.\\n\\nCupo máximo de 260 jugadores.\\n\\nEl ganador GROSS de la categoría Campeonato será acreedor a la Copa Challenge. El mismo jugador no puede ganar GROSS y NETO en la misma categoría."}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Elegibilidad (II. ELEGIBILIDAD + VI. HANDICAP + fechas de inscripción)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'elegibilidad', 'generic', '{"eligibilityText": "Podrán participar todos los golfistas aficionados de 18 años cumplidos al 26 de Julio del 2026, excepto en la categoría Campeonato donde podrán jugar juveniles con 14 años cumplidos a la misma fecha. Damas juveniles entre 14 y 18 años podrán jugar en la categoría Damas A, pero jugarán de marcas Blancas.", "notesText": ["Las categorías de Senior serán de 55 años o más cumplidos a la fecha del torneo.", "La categoría Súper Senior será de 70 años o más cumplidos a la fecha del torneo.", "Handicap: la competencia se jugará con el hándicap índice del martes 1° de Julio del 2026 en la FMG o SPEI.", "Jugadores sin hándicap índice oficial podrán entrar bajo condición y aceptación del Comité Organizador; este hándicap índice podrá ser sujeto a modificación.", "Es responsabilidad del jugador acreditar debidamente su hándicap índice.", "Jugadores con hándicap negativo se les aplicará conforme resulte su conversión. Este torneo no aplica el cero de hándicap como hándicap mínimo.", "En las categorías de Damas y Súper Senior el cupo mínimo será de 8 jugadores; en el resto de categorías el cupo mínimo será de 12 jugadores. Si no se llega al límite, las categorías se podrán juntar según lo considere adecuado el Comité."], "inscripcionesText": "Cierre de Inscripciones: Martes 21 de Julio de 2026 o al llenar el cupo máximo del evento (260 jugadores)."}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Competencias / Premios especiales (X. O'YES + XII. HOLE IN ONE)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'competencias', 'list', '{"items": [{"nombre": "Premios O''YES", "descripcion": "Los premios de O''Yes se otorgan por mejor posición en los 4 días de competencia. No son acumulables en el mismo hoyo, pero sí se puede ganar premio en varios hoyos (se toma en cuenta solo el de mayor valor en cada hoyo). En caso de empate en O''Yes, el primero al turno será el ganador.", "premios": "1° $50,000 pesos · 2° $30,000 pesos · 3° $20,000 pesos · 4° Driver TaylorMade · 5° Range Finder Bushnell."}, {"nombre": "Hole In One — Hoyo 5", "descripcion": "Premio al primer Hole In One registrado en el hoyo 5. A partir del segundo Hole In One en el mismo hoyo, se considera como O''Yes y se define por la bola más cercana al hoyo. Cada marca de salida estará colocada en la distancia mínima requerida por el seguro.", "premios": "Carrito de golf ZYCAR."}, {"nombre": "Hole In One — Hoyo 8", "descripcion": "Premio al primer Hole In One registrado en el hoyo 8. A partir del segundo Hole In One en el mismo hoyo, se considera como O''Yes.", "premios": "Carrito de golf GOAT."}, {"nombre": "Hole In One — Hoyo 11", "descripcion": "Premio al primer Hole In One registrado en el hoyo 11. A partir del segundo Hole In One en el mismo hoyo, se considera como O''Yes.", "premios": "Membresía Vitalicia en el desarrollo Campestre LA SANTA VID (Querétaro, QRO) con valor de $650,000 pesos."}, {"nombre": "Hole In One — Hoyo 17", "descripcion": "Premio al primer Hole In One registrado en el hoyo 17. A partir del segundo Hole In One en el mismo hoyo, se considera como O''Yes.", "premios": "$200,000 pesos en efectivo."}, {"nombre": "Rifas", "descripcion": "Rifas diversas durante el Cóctel de Bienvenida (Rompehielos), los Eventos Nocturnos y la Ceremonia de Premiación.", "premios": "IMPORTANTE: En todas las rifas es obligatorio estar presente para poder ser acreedor del premio. En caso de no estar presente, se continuará con el siguiente número."}]}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Premiación (VIII. TROFEOS)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'premiacion', 'list', '{"items": [{"categoria": "Todas las Categorías", "premios": ["1er, 2do y 3er lugar NETO (con HCP)."]}, {"categoria": "Categoría Campeonato", "premios": ["1er lugar GROSS (Copa Challenge).", "1er, 2do y 3er lugar NETO."]}, {"categoria": "Regla general", "premios": ["El mismo jugador NO puede ganar GROSS y NETO en la misma categoría."]}]}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Eventos / Actividades sociales (XIV. EVENTOS Y ACTIVIDADES)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'servicios', 'list', '{"items": [{"nombre": "Domingo 02 de Agosto — Día de práctica", "descripcion": "Reservación obligatoria."}, {"nombre": "Lunes 03 de Agosto — Día de práctica (SOLO SOCIOS)", "descripcion": "Exclusivo para Socios del Club."}, {"nombre": "Martes 04 de Agosto — Día de práctica FORÁNEOS", "descripcion": "Reservación obligatoria."}, {"nombre": "Miércoles 05 de Agosto — 1er día de competencia", "descripcion": "Evento Nocturno: Rompehielos y Calcuta de jugadores."}, {"nombre": "Jueves 06 de Agosto — 2° día de competencia", "descripcion": "Evento Nocturno: Noche de Convivencia."}, {"nombre": "Viernes 07 de Agosto — CORTE", "descripcion": "Corte para los mejores jugadores de cada categoría. Evento Nocturno: Baile Tema Fiesta."}, {"nombre": "Sábado 08 de Agosto — Ronda FINAL", "descripcion": "Cena de Premiación y Evento Nocturno: Noche de Celebración."}, {"nombre": "Áreas de Eventos Nocturnos", "descripcion": "Espacios exclusivos para participantes del torneo y 1 invitado."}]}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Costos (XV. COSTO DE INSCRIPCIÓN + formas de pago)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'costos', 'generic', '{"sociosPricing": [{"title": "Socios Federados — Damas y Caballeros", "subtitle": "Costo regular: $9,000.00. Promociones vigentes solo con pago en efectivo.", "tiers": [{"categoria": "Pago en su totalidad al 15 de Junio 2026 (solo efectivo)", "costo": "$8,000.00"}, {"categoria": "Pago en su totalidad al 10 de Julio 2026 (solo efectivo)", "costo": "$8,500.00"}, {"categoria": "Cuota regular", "costo": "$9,000.00"}]}, {"title": "Socios — Damas y Caballeros", "subtitle": "Costo regular: $9,500.00. Promociones vigentes solo con pago en efectivo.", "tiers": [{"categoria": "Pago en su totalidad al 15 de Junio 2026 (solo efectivo)", "costo": "$8,500.00"}, {"categoria": "Pago en su totalidad al 10 de Julio 2026 (solo efectivo)", "costo": "$9,000.00"}, {"categoria": "Cuota regular", "costo": "$9,500.00"}]}], "foraneosPricing": [{"title": "Invitados y Foráneos", "caballeros": "$10,500", "damasSeniors": "$10,500"}], "pricingNote": "La renta del carrito de golf NO está incluida en el costo de inscripción. Cierre de inscripciones: Martes 21 de Julio 2026 o al llenar el cupo máximo (260 jugadores). Una vez realizado el pago, no habrá devoluciones después del VIERNES 24 de Julio 2026. Todas las devoluciones autorizadas se harán hasta después del 10 de Septiembre de 2026 para dar tiempo de cerrar los números del torneo.", "contactInfo": {"bankName": "BANAMEX", "clabe": "002190701827996274", "cuenta": "7018 2799627", "nombre": "Club Campestre de Durango, AC", "email": "inscripciones.ccdgo@gmail.com", "telefono": "(618) 167 7554", "telefonoDirecto": "Pro. Jorge González — WhatsApp (618) 167 7554"}, "contactWarning": "OBLIGATORIO enviar ficha de depósito por WhatsApp (618) 167 7554 o al correo inscripciones.ccdgo@gmail.com. En el concepto de la transferencia escribir: Nombre COMPLETO del jugador y ''ANUAL CCD 2026''.", "inscripcionesText": "Formas de pago:\\n• EFECTIVO — Oficina de Golf (Terraza Restaurante Hacienda Sta. Cruz, Martes a Domingo) o Cobranza/Caja (frente a Caseta de acceso, Lunes a Domingo). Única forma de pago admitida para la promoción.\\n• TARJETA — Cobranza/Caja (frente a Caseta de acceso, Lunes a Domingo).\\n• TRANSFERENCIA — BANAMEX, CLABE 002190701827996274, Cuenta 7018 2799627 a nombre de Club Campestre de Durango, AC."}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Contacto (información del Director de Golf)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'contacto', 'generic', '{"text": "Director de Golf: Pro. Jorge González Alcalá.\\nTeléfono / WhatsApp: (618) 167 7554.\\nCorreo: jorge.gonzalezalcala@gmail.com\\nInscripciones: inscripciones.ccdgo@gmail.com\\n\\nEL COMITÉ SE RESERVA EL DERECHO DE HACER LOS CAMBIOS NECESARIOS PARA EL MEJOR DESARROLLO DEL TORNEO. CUALQUIER PUNTO NO CONSIDERADO EN LA PRESENTE CONVOCATORIA SERÁ RESUELTO POR EL COMITÉ DE GOLF Y SU DECISIÓN FINAL SERÁ INAPELABLE."}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;