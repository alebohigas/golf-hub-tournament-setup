-- =====================================================================
-- Seed: /reglas content for torneoid=360
-- Torneo Anual de Golf Club Campestre de Durango 2026
-- Reusa la tabla convocatoria_content con section_ids reglas_intro_cards,
-- reglas_locales, reglamento_local y desempates.
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- Tarjetas resumen (reglas_intro_cards)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'reglas_intro_cards', 'cards', '[{"icon": "BookOpen", "title": "Reglas USGA / FMG", "body": "Se jugará bajo las reglas que rigen la U.S.G.A., adoptadas por la Federación Mexicana de Golf, y las reglas locales del Club Campestre de Durango publicadas en las pantallas y entregadas junto con la tarjeta de score."}, {"icon": "Scale", "title": "Sistema de Hándicap", "body": "Se utiliza el Hándicap Índice del martes 1° de Julio de 2026 en la FMG o SPEI. Las categorías D y E juegan al 80%, Seniors al 90%, Súper Senior al 100% y Damas al 90%. Es responsabilidad del jugador acreditar su hándicap índice."}, {"icon": "ShieldCheck", "title": "Comité de Reglas", "body": "Todas las controversias sobre la aplicación de las reglas y la presente convocatoria serán resueltas por el Juez de Reglas y su fallo será inapelable. El Comité se reserva el derecho de hacer los cambios necesarios para el mejor desarrollo del torneo."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Reglas locales (V. SALIDAS, VII. CORTE, XIII. INFO GENERAL)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'reglas_locales', 'accordion', '[{"titulo": "Salidas", "contenido": "Todos los días, las salidas serán por horario en el turno correspondiente (matutino a partir de las 6:30am y vespertino a partir de las 11:30am). La distribución y horarios de las categorías puede cambiar dependiendo del field."}, {"titulo": "Handicap", "contenido": "La competencia se jugará con el hándicap índice del martes 1° de Julio del 2026 en la FMG o SPEI. Jugadores sin hándicap índice oficial podrán entrar bajo condición y aceptación del Comité Organizador; este hándicap índice podrá ser modificado. Es responsabilidad del jugador acreditar su hándicap índice. Los jugadores con hándicap negativo se les aplicará conforme resulte su conversión; el torneo no aplica el cero de hándicap como hándicap mínimo."}, {"titulo": "Corte", "contenido": "Habrá corte en TODAS las categorías varoniles después de la 3ª ronda:\\n• Campeonato, Premier y AA: pasan 18 jugadores.\\n• Categorías A, B y C: pasan 16 jugadores.\\n• Categorías D, Senior A, Senior B y Súper Seniors: pasan 12 jugadores.\\n• Todas las categorías de Damas: sin corte."}, {"titulo": "Desempate para el Corte", "contenido": "En caso de empates para decidir a los jugadores que jueguen el sábado, se usará la 2ª ronda de competencia como criterio inicial utilizando el método de retrogresión 9, 6, 3, 1 comenzando por la vuelta del 10 al 18 (sin importar por dónde hayan comenzado). Si el empate persiste, se usará la 1ª ronda de la misma manera. En categorías Stableford el desempate se realiza CON PUNTOS."}, {"titulo": "Trofeos", "contenido": "En todas las categorías se premiará al 1°, 2° y 3er lugar NETO (con HCP). En la categoría Campeonato adicionalmente se premia el 1er lugar GROSS. El mismo jugador NO puede ganar GROSS y NETO en la misma categoría."}, {"titulo": "Copa Challenge", "contenido": "El ganador GROSS de la categoría Campeonato será acreedor a la Copa Challenge."}, {"titulo": "Renta de carrito", "contenido": "La renta del carrito de golf NO está incluida en el costo de inscripción y debe cubrirse por separado."}, {"titulo": "Vestimenta", "contenido": "Se deberá utilizar ropa adecuada para la práctica del deporte del golf. Se prohíbe el uso de mezclilla y de playeras sin cuello durante el juego."}, {"titulo": "Controversias", "contenido": "Todas las controversias que se originen sobre cualquier punto relacionado con la aplicación de las reglas y la presente convocatoria serán resueltas por el Juez de Reglas y su fallo será inapelable."}, {"titulo": "Reservas del Comité", "contenido": "El Comité se reserva el derecho de hacer los cambios necesarios para el mejor desarrollo del torneo. Cualquier punto no considerado en la presente convocatoria será resuelto por el Comité de Golf y su decisión final será inapelable."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Reglamento por categoría (III. CATEGORÍAS)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'reglamento_local', 'accordion', '[{"titulo": "Campeonato", "contenido": "H.I. hasta 0.9. Formato: Stroke Play. Marcas: Negras. Ventaja: Sin Handicap (S.H.). Cupo máximo: 18 jugadores. Corte: 18. Se permite juveniles con 14 años cumplidos al 26 de Julio 2026."}, {"titulo": "Premier", "contenido": "H.I. 1.0 a 3.9. Formato: Stroke Play. Marcas: Azules. Ventaja: S.H. Cupo máximo: 18. Corte: 18."}, {"titulo": "AA", "contenido": "H.I. 4.0 a 7.0. Formato: Stroke Play. Marcas: Azules. Ventaja: S.H. Cupo máximo: 18. Corte: 18."}, {"titulo": "A", "contenido": "H.I. 7.1 a 10.5. Formato: Stroke Play. Marcas: Blancas. Ventaja: S.H. Cupo máximo: 24. Corte: 16."}, {"titulo": "B", "contenido": "H.I. 10.6 a 14.5. Formato: Stableford. Marcas: Blancas. Ventaja: S.H. Cupo máximo: 30. Corte: 16."}, {"titulo": "C", "contenido": "H.I. 14.6 a 19.5. Formato: Stableford. Marcas: Blancas. Ventaja: S.H. Cupo máximo: 34. Corte: 16."}, {"titulo": "D", "contenido": "H.I. 19.6 a 24.5. Formato: Stableford. Marcas: Blancas. Ventaja: 80%. Cupo máximo: 22. Corte: 12."}, {"titulo": "E", "contenido": "H.I. 24.6 en adelante. Formato: Stableford. Marcas: Doradas. Ventaja: 80%. Cupo máximo: 22. Corte: 12."}, {"titulo": "Senior A (55 años o más)", "contenido": "H.I. hasta 16.7. Formato: Stableford. Marcas: Doradas. Ventaja: 90%. Cupo máximo: 16. Corte: 12. Deben tener 55 años cumplidos a la fecha del torneo."}, {"titulo": "Senior B (55 años o más)", "contenido": "H.I. 16.8 a 40.1. Formato: Stableford. Marcas: Doradas. Ventaja: 90%. Cupo máximo: 16. Corte: 12."}, {"titulo": "Súper Senior (70 años o más)", "contenido": "H.I. hasta 40.1. Formato: Stableford. Marcas: Plateadas. Ventaja: 100%. Cupo máximo: 12. Corte: 12. Cupo mínimo 8 jugadores."}, {"titulo": "Damas A", "contenido": "H.I. hasta 13.5. Formato: Stableford. Marcas: Rojas. Ventaja: 90%. Cupo máximo: 10. Corte: 10. Damas juveniles entre 14 y 18 años pueden jugar en esta categoría pero jugarán de marcas Blancas."}, {"titulo": "Damas B", "contenido": "H.I. 13.6 a 26.9. Formato: Stableford. Marcas: Rojas. Ventaja: 90%. Cupo máximo: 10. Corte: 10."}, {"titulo": "Damas C", "contenido": "H.I. 27.0 a 40.1. Formato: Stableford. Marcas: Rojas. Ventaja: 90%. Cupo máximo: 10. Corte: 10."}, {"titulo": "Cupo mínimo por categoría", "contenido": "En las categorías de Damas y Súper Senior el cupo mínimo será de 8 jugadores. En el resto de las categorías el cupo mínimo será de 12 jugadores. Si no se llega al límite, las categorías se podrán juntar según lo considere adecuado el Comité."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

-- ---------------------------------------------------------------------
-- Desempates (IX. DESEMPATE PARA GANADOR DE TROFEO)
-- ---------------------------------------------------------------------
INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled) VALUES (360, 'desempates', 'accordion', '[{"titulo": "Desempate para 1°, 2° y 3er lugar de cada categoría", "contenido": "Se usará la 3ª ronda de competencia como criterio de desempate inicial utilizando el método de retrogresión 9, 6, 3, 1 comenzando por la vuelta del 10 al 18 (sin importar por dónde hayan comenzado). Si el empate persiste, se usará la 2ª ronda de la misma manera, y así sucesivamente hacia la 1ª ronda."}, {"titulo": "Desempate para el Corte", "contenido": "Para decidir a los jugadores que jueguen el sábado, se usará la 2ª ronda de competencia como criterio de desempate inicial utilizando el método de retrogresión 9, 6, 3, 1 comenzando por la vuelta del 10 al 18. Si el empate persiste, se usará la 1ª ronda de la misma manera. En categorías Stableford el desempate se realiza CON PUNTOS."}, {"titulo": "Empate en O''Yes", "contenido": "En caso de empate en O''Yes, el primero al turno será el ganador."}, {"titulo": "Empate en Hole In One", "contenido": "En caso de registrarse más de un Hole In One en el mismo hoyo, únicamente el primero será reconocido como tal para efectos de premiación. A partir del segundo Hole In One, los resultados serán considerados como O''Yes y se definirán en función de la bola más cercana al hoyo."}]', 1)
ON DUPLICATE KEY UPDATE
  section_type = VALUES(section_type),
  content = VALUES(content),
  enabled = 1,
  updated_at = CURRENT_TIMESTAMP;

COMMIT;