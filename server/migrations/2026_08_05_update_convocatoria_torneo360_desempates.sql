-- =====================================================================
-- Update: sección `desempates` de la convocatoria — torneoid = 360
-- Torneo Anual de Golf Club Campestre de Durango 2026 (05-08 Ago 2026)
-- Fuente: PDF "ANUAL_2026_CONVOCATORIA-4-2" — apartados VII (Corte)
-- y IX (Desempate para ganador de trofeo).
-- Idempotente: UPDATE + INSERT condicional.
-- =====================================================================

START TRANSACTION;

-- Contenido JSON compartido por el UPDATE y el INSERT (ver DesempatesSection.tsx):
--   intro       -> párrafo introductorio
--   paraCorte   -> criterios para definir quiénes pasan el corte
--   paraTrofeos -> criterios para los primeros 3 lugares
--   nota        -> cierre / reserva del comité

UPDATE convocatoria_content SET
  section_type = 'desempates',
  title = 'Desempates',
  content = '{"intro":"Criterios oficiales de desempate del Torneo Anual de Golf Club Campestre de Durango 2026, tanto para definir el corte del sábado como para los ganadores de trofeo en cada categoría.","paraCorte":["Habrá corte en TODAS las categorías varoniles: Campeonato, Premier y AA (18 jugadores); Cat. A, B y C (16 jugadores); Cat. D, Senior A, Senior B y Súper Senior (12 jugadores). Las categorías de Damas son SIN corte.","Para motivos del corte, en caso de empates, para decidir a los jugadores que jueguen el sábado se usará la 2ª ronda de competencia como criterio de desempate inicial.","Se aplicará el método de retrogresión 9, 6, 3, 1: comenzando por la vuelta del Hoyo 10 al 18, sin importar por dónde hayan comenzado su ronda; después los últimos 6 hoyos (13 al 18), después los últimos 3 hoyos (16 al 18) y finalmente el último hoyo (18).","Si el empate persiste, se usará la 1ª ronda de competencia exactamente de la misma manera (9, 6, 3, 1).","En las categorías que juegan Stableford la comparación se realiza CON PUNTOS (a mayor puntaje, mejor posición); en las categorías de Stroke Play se compara por menor score."],"paraTrofeos":["En todas las categorías se premia 1º, 2º y 3er lugar NETO (con HCP), y 1er lugar GROSS en la categoría Campeonato. El mismo jugador no puede ganar GROSS y NETO.","Para los primeros 3 lugares de cada categoría, en caso de empate se usará la 3ª ronda de competencia como criterio de desempate inicial.","Se aplicará el método de retrogresión 9, 6, 3, 1: comenzando por la vuelta del Hoyo 10 al 18, sin importar por dónde hayan comenzado; después del Hoyo 13 al 18, después del Hoyo 16 al 18 y finalmente el Hoyo 18.","Si el empate persiste, se usará la 2ª ronda de la misma manera y así sucesivamente hasta la 1ª ronda.","En Stableford la comparación se hace con puntos (mayor puntaje gana); en Stroke Play gana el menor score.","El ganador GROSS de la Cat. Campeonato será acreedor a la Copa Challenge."],"nota":"Todas las controversias que se originen sobre cualquier punto relacionado con la aplicación de las reglas y la presente convocatoria serán resueltas por el juez de reglas y su fallo será inapelable. El Comité se reserva el derecho de hacer los cambios necesarios para el mejor desarrollo del Torneo."}',
  enabled = 1
WHERE torneoid = 360 AND section_id = 'desempates';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, enabled)
SELECT 360, 'desempates', 'desempates', 'Desempates',
  '{"intro":"Criterios oficiales de desempate del Torneo Anual de Golf Club Campestre de Durango 2026, tanto para definir el corte del sábado como para los ganadores de trofeo en cada categoría.","paraCorte":["Habrá corte en TODAS las categorías varoniles: Campeonato, Premier y AA (18 jugadores); Cat. A, B y C (16 jugadores); Cat. D, Senior A, Senior B y Súper Senior (12 jugadores). Las categorías de Damas son SIN corte.","Para motivos del corte, en caso de empates, para decidir a los jugadores que jueguen el sábado se usará la 2ª ronda de competencia como criterio de desempate inicial.","Se aplicará el método de retrogresión 9, 6, 3, 1: comenzando por la vuelta del Hoyo 10 al 18, sin importar por dónde hayan comenzado su ronda; después los últimos 6 hoyos (13 al 18), después los últimos 3 hoyos (16 al 18) y finalmente el último hoyo (18).","Si el empate persiste, se usará la 1ª ronda de competencia exactamente de la misma manera (9, 6, 3, 1).","En las categorías que juegan Stableford la comparación se realiza CON PUNTOS (a mayor puntaje, mejor posición); en las categorías de Stroke Play se compara por menor score."],"paraTrofeos":["En todas las categorías se premia 1º, 2º y 3er lugar NETO (con HCP), y 1er lugar GROSS en la categoría Campeonato. El mismo jugador no puede ganar GROSS y NETO.","Para los primeros 3 lugares de cada categoría, en caso de empate se usará la 3ª ronda de competencia como criterio de desempate inicial.","Se aplicará el método de retrogresión 9, 6, 3, 1: comenzando por la vuelta del Hoyo 10 al 18, sin importar por dónde hayan comenzado; después del Hoyo 13 al 18, después del Hoyo 16 al 18 y finalmente el Hoyo 18.","Si el empate persiste, se usará la 2ª ronda de la misma manera y así sucesivamente hasta la 1ª ronda.","En Stableford la comparación se hace con puntos (mayor puntaje gana); en Stroke Play gana el menor score.","El ganador GROSS de la Cat. Campeonato será acreedor a la Copa Challenge."],"nota":"Todas las controversias que se originen sobre cualquier punto relacionado con la aplicación de las reglas y la presente convocatoria serán resueltas por el juez de reglas y su fallo será inapelable. El Comité se reserva el derecho de hacer los cambios necesarios para el mejor desarrollo del Torneo."}',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM (SELECT 1 FROM convocatoria_content WHERE torneoid = 360 AND section_id = 'desempates') AS t
);

COMMIT;
