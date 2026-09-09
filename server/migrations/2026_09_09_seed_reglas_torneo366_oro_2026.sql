-- =====================================================================
-- Seed/actualización: Reglas e Información General
-- TORNEO DE ORO 2026 — Club Campestre Juárez — torneoid = 366
-- Fuente: REGLAS_ORO_2026_TORNEO_366.pdf (7 al 12 de septiembre de 2026)
-- Reemplaza el seed anterior (Campeonato del Club, abril 2026).
-- Publica en /reglas: reglas_intro_cards + reglas_locales + etiqueta PDF.
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- Tarjetas introductorias: formato, categorías/tees, topes y juego lento.
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (366, 'reglas_intro_cards', 'cards', '[{"icon": "BookOpen", "title": "Reglas USGA", "body": "Se aplicarán las reglas U.S.G.A. complementadas con las reglas locales del Torneo de Oro 2026, del 7 al 12 de septiembre de 2026. El campo se jugará Par 72, Campo San Marcos."}, {"icon": "Trophy", "title": "Formato del torneo", "body": "Se jugarán 54 hoyos Stroke Play."}, {"icon": "ShieldCheck", "title": "Hándicaps y tees de salida", "body": "7 categorías: Campeonato hasta 3.0 (negras); AA 3.1–6.6, A 6.7–10.4 y B 10.5–14.3 (azules); C 14.4–18.2, D 18.3–22.8 y E 22.9 en adelante (blancas)."}, {"icon": "AlertTriangle", "title": "Topes por categoría (primeros dos días)", "body": "Campeonato: libre. AA: 72. A: 76. B: 80. C: 84. D: 88. Damas, E y Senior: 68 con hándicap. Juego lento (Regla 6.7): se amonesta al grupo una vez; la segunda ocasión se aplica castigo (puntos extra en su score total). Prohibido el uso de bocinas durante la ronda."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- Reglas locales (acordeón).
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (366, 'reglas_locales', 'accordion', '[{"titulo": "Drops sin castigo", "contenido": "Los indicadores que marcan las yardas en el fairway, válvulas de riego, rehiletes, oasis en el campo, el camino grande de terracería y baby trees pintados."}, {"titulo": "Hoyo 3", "contenido": "Si su bola cae arriba o dentro de la casa, deberá dropear sin castigo un bastón al lugar más cercano en la línea en donde está la pelota."}, {"titulo": "Hoyo 4", "contenido": "Si su bola pega solamente en los cables de la corriente eléctrica, deberá tirar otra bola independientemente de dónde termine su bola. El poste y el transformador son parte del campo."}, {"titulo": "Hoyo 6", "contenido": "Cualquier bola que quede en el camino puede jugarse desde ahí sin castigo y sin apoyar su bastón. Si cae en una de las lagunas usará el drop zone que le corresponde; se indicará en un dibujo para mejor información. Este hoyo se juega con regla local."}, {"titulo": "Hoyo 9", "contenido": "Independientemente de dónde repose su bola no hay drop sin castigo, a menos que esté debidamente identificado o marcado por el Comité Organizador. La malla será drop con castigo. Si los cables tensores y las bases de los mismos estorban en el stance o swing se otorgará el free drop."}, {"titulo": "Juego lento (Regla 6.7)", "contenido": "Se amonestará al grupo una vez; la segunda ocasión se aplicará castigo (puntos extra en su score total)."}, {"titulo": "Fuera de límites", "contenido": "Pasando cualquier pared, cerca o estacas blancas."}, {"titulo": "En caso de duda", "contenido": "En cualquier situación: en caso de duda juegue una segunda bola y pregunte al profesional tan pronto como sea posible (termine el hoyo jugando con las dos bolas)."}, {"titulo": "Obstáculos de agua", "contenido": "Obstáculos de agua frontal: estacas amarillas.\\nObstáculos de agua lateral: estacas rojas."}, {"titulo": "Desempates", "contenido": "Si se cuenta con luz solar natural se jugará a muerte súbita iniciando en el hoyo que asigne el Comité de Golf, hoyo por hoyo hasta tener un ganador. De no contar con luz natural será por tarjeta."}, {"titulo": "Topes por categoría (primeros dos días)", "contenido": "Campeonato: libre.\\nAA: 72.\\nA: 76.\\nB: 80.\\nC: 84.\\nD: 88.\\nDamas, E y Senior: 68 con hándicap."}, {"titulo": "Bocinas", "contenido": "Prohibido el uso de bocinas durante la ronda."}, {"titulo": "Zonas drop — Regla local hoyo 3", "contenido": "1. Si su golpe de salida o acercamiento a green queda dentro del área identificada con cal o pintura blanca, su drop deberá ser un bastón fuera del área delimitada de blanco sin acercarse a la bandera.\\n2. Si el golpe de salida o de acercamiento quedara en el techo o área de maquinaria, el drop deberá ser en el área de drop más cercana designada para tal efecto, pudiendo ser su drop en área blanca, roja o anaranjada que se indica, dependiendo de dónde descanse su bola (ver cuadro)."}, {"titulo": "Zonas drop — Regla local hoyo 6", "contenido": "1. Lagunas ubicadas en tees de salida (identificadas en amarillo): el drop deberá ser en la zona circular identificada en amarillo.\\n2. Lagunas de green (rodeando el green), el drop deberá ser:\\na. Si el golpe de salida no rebasa las áreas marcadas en la ilustración con rojo, el drop será en las zonas circulares identificadas en rojo.\\nb. Si el golpe de salida pasa por cualquier área de green rebasando las líneas marcadas por rojo, independientemente si la bola toque o no tierra, el drop deberá ser en las zonas de drop identificadas en azul, siempre y cuando el golpe de salida no rebase la marca que existe para tal efecto en las orillas de green; si rebasa dicha marca, el drop será en la zona marcada con color morado (ver línea blanca). Existirá una persona del Comité Organizador que auxilie en señalar el área de entrada al agua del golpe de salida.\\nc. Si el golpe de salida queda en el puente posterior al green, el drop será en la zona circular identificada en la ilustración con color amarillo."}, {"titulo": "Derecho de cambios", "contenido": "El Comité de Golf se reserva el derecho de hacer los cambios necesarios para el mejor desarrollo del torneo."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- Etiqueta del botón de descarga del PDF oficial.
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (366, 'reglas_pdf_label', 'generic', '{"label": "Ver Reglas e Información General (PDF)"}', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;
