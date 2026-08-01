-- =====================================================================
-- Torneo 361 (Club Campestre de Saltillo, Edición 71)
-- Amplía los CRITERIOS DE DESEMPATE de /convocatoria conforme al PDF
-- "convocatoria_final2" (bloque de tres criterios: Stableford,
-- Stroke Play y Match Play), respetando encabezados y ortografía
-- en español (UTF-8).
--
-- SOLO afecta al torneoid = 361, sección `desempates`.
-- Idempotente: UPDATE + INSERT condicional.
-- =====================================================================

START TRANSACTION;

SET NAMES utf8mb4;

UPDATE convocatoria_content
SET
  section_type = 'desempates',
  title = 'Desempate',
  content = '{"intro":"Criterios de desempate del Torneo Anual Edición 71, conforme a la convocatoria oficial.","paraCorte":["CRITERIOS DE DESEMPATE PARA PASAR A LA TERCERA RONDA Y SIEMBRA EN EL BRACKET DE MATCH PLAY — CATEGORÍAS CABALLEROS A, B, C, D Y E. MODALIDAD STABLEFORD: los desempates para estas Categorías serán por comparación de tarjetas; el primer criterio será quien obtenga más puntos en la última ronda jugada; de persistir el empate, el jugador que realizó mayor puntaje en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate se comparará el puntaje obtenido en el Hoyo 18, posteriormente el del Hoyo 17, Hoyo 16 y así sucesivamente hasta el Hoyo 1.","CRITERIOS DE DESEMPATE PARA PASAR A TERCERA RONDA — CATEGORÍAS CABALLEROS CAMPEONATO, PREMIER Y AA. MODALIDAD STROKE PLAY: los desempates para estas Categorías serán por comparación de tarjetas; el primer criterio será quien obtenga el menor score en la última ronda jugada; de persistir el empate, el menor score obtenido en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate ganará el menor score obtenido en el Hoyo 18, si persiste el empate en el Hoyo 17 y así sucesivamente hasta el Hoyo 1 para definir al ganador.","CRITERIOS DE DESEMPATE SISTEMA MATCH PLAY: los desempates serán a muerte súbita iniciando por el Hoyo donde se inició su ronda de juego, aplicando ventajas."],"paraTrofeos":["Solo por el 1er Lugar (Gross o Neto) se jugará a muerte súbita, por el hoyo que el Director de Reglas designe, y se hará el desempate bajo la misma modalidad de juego.","El resto de los desempates se harán por comparación de tarjetas contando el score del último día jugado.","De persistir el empate, el score obtenido del Hoyo 10 al 18.","Si persiste el empate, del Hoyo 13 al 18.","De continuar, del Hoyo 16 al 18.","Si persiste el empate se comparará el score del Hoyo 18, después el del Hoyo 17 y así sucesivamente hasta el Hoyo 1."],"nota":"El Comité Organizador del Torneo se reserva el derecho de hacer cambios a la presente convocatoria, a las reglas locales y a las condiciones de la competencia en beneficio del mejor desarrollo del Torneo, y su decisión será inapelable."}',
  enabled = 1
WHERE torneoid = 361 AND section_id = 'desempates';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, enabled)
SELECT 361, 'desempates', 'desempates', 'Desempate',
  '{"intro":"Criterios de desempate del Torneo Anual Edición 71, conforme a la convocatoria oficial.","paraCorte":["CRITERIOS DE DESEMPATE PARA PASAR A LA TERCERA RONDA Y SIEMBRA EN EL BRACKET DE MATCH PLAY — CATEGORÍAS CABALLEROS A, B, C, D Y E. MODALIDAD STABLEFORD: los desempates para estas Categorías serán por comparación de tarjetas; el primer criterio será quien obtenga más puntos en la última ronda jugada; de persistir el empate, el jugador que realizó mayor puntaje en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate se comparará el puntaje obtenido en el Hoyo 18, posteriormente el del Hoyo 17, Hoyo 16 y así sucesivamente hasta el Hoyo 1.","CRITERIOS DE DESEMPATE PARA PASAR A TERCERA RONDA — CATEGORÍAS CABALLEROS CAMPEONATO, PREMIER Y AA. MODALIDAD STROKE PLAY: los desempates para estas Categorías serán por comparación de tarjetas; el primer criterio será quien obtenga el menor score en la última ronda jugada; de persistir el empate, el menor score obtenido en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate ganará el menor score obtenido en el Hoyo 18, si persiste el empate en el Hoyo 17 y así sucesivamente hasta el Hoyo 1 para definir al ganador.","CRITERIOS DE DESEMPATE SISTEMA MATCH PLAY: los desempates serán a muerte súbita iniciando por el Hoyo donde se inició su ronda de juego, aplicando ventajas."],"paraTrofeos":["Solo por el 1er Lugar (Gross o Neto) se jugará a muerte súbita, por el hoyo que el Director de Reglas designe, y se hará el desempate bajo la misma modalidad de juego.","El resto de los desempates se harán por comparación de tarjetas contando el score del último día jugado.","De persistir el empate, el score obtenido del Hoyo 10 al 18.","Si persiste el empate, del Hoyo 13 al 18.","De continuar, del Hoyo 16 al 18.","Si persiste el empate se comparará el score del Hoyo 18, después el del Hoyo 17 y así sucesivamente hasta el Hoyo 1."],"nota":"El Comité Organizador del Torneo se reserva el derecho de hacer cambios a la presente convocatoria, a las reglas locales y a las condiciones de la competencia en beneficio del mejor desarrollo del Torneo, y su decisión será inapelable."}',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM (SELECT 1 FROM convocatoria_content WHERE torneoid = 361 AND section_id = 'desempates') AS t
);

COMMIT;