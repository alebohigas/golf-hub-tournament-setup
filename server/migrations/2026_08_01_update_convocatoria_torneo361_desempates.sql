-- =====================================================================
-- Torneo 361 — Club Campestre de Saltillo, Torneo Anual Edición 71
-- Publica los CRITERIOS DE DESEMPATE tal como aparecen en el PDF
-- "convocatoria_final2" (páginas 6 y 7) y habilita la sección de
-- VALORES STABLEFORD (los valores se leen de torneos.valorstable).
--
-- Estructura del JSON de la sección `desempates`:
--   intro       -> texto introductorio
--   paraCorte[] -> criterios para pasar a tercera ronda / siembra bracket
--   paraTrofeos[] -> criterios de desempate para trofeo
--   nota        -> nota de cierre
--
-- Todo el texto va en ESPAÑOL con acentos correctos (UTF-8).
-- Idempotente: UPDATE + INSERT condicional.
-- =====================================================================

START TRANSACTION;

SET NAMES utf8mb4;

-- ---------------------------------------------------------------- Desempates
UPDATE convocatoria_content
SET
  section_type = 'desempates',
  title = 'Desempate',
  content = '{"intro":"Criterios de desempate del Torneo Anual Edición 71, conforme a la convocatoria oficial.","paraCorte":["MODALIDAD STABLEFORD — Categorías Caballeros A, B, C, D y E (para pasar a la tercera ronda y siembra en el bracket de Match Play): el desempate será por comparación de tarjetas; el primer criterio será quien obtenga más puntos en la última ronda jugada; de persistir el empate, el jugador que realizó mayor puntaje en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate se comparará el puntaje obtenido en el Hoyo 18, posteriormente el del Hoyo 17, Hoyo 16 y así sucesivamente hasta el Hoyo 1.","MODALIDAD STROKE PLAY — Categorías Caballeros Campeonato, Premier y AA (para pasar a la tercera ronda): el desempate será por comparación de tarjetas; el primer criterio será quien obtenga el menor score en la última ronda jugada; de persistir el empate, el menor score obtenido en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate ganará el menor score obtenido en el Hoyo 18, después el Hoyo 17 y así sucesivamente hasta el Hoyo 1 para definir al ganador.","MODALIDAD MATCH PLAY: los desempates serán a muerte súbita iniciando por el hoyo donde se inició su ronda de juego, aplicando ventajas."],"paraTrofeos":["Solo por el 1er Lugar (Gross o Neto) se jugará a muerte súbita, por el hoyo que el Director de Reglas designe, y se hará el desempate bajo la misma modalidad de juego.","El resto de los desempates se harán por comparación de tarjetas contando el score del último día jugado.","De persistir el empate, el score obtenido del Hoyo 10 al 18.","Si persiste el empate, del Hoyo 13 al 18.","De continuar, del Hoyo 16 al 18.","Si persiste el empate se comparará el score del Hoyo 18, después el del Hoyo 17 y así sucesivamente hasta el Hoyo 1."],"nota":"El Comité Organizador del Torneo se reserva el derecho de hacer cambios a la presente convocatoria, a las reglas locales y a las condiciones de la competencia en beneficio del mejor desarrollo del Torneo, y su decisión será inapelable."}',
  enabled = 1
WHERE torneoid = 361 AND section_id = 'desempates';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, enabled)
SELECT 361, 'desempates', 'desempates', 'Desempate',
  '{"intro":"Criterios de desempate del Torneo Anual Edición 71, conforme a la convocatoria oficial.","paraCorte":["MODALIDAD STABLEFORD — Categorías Caballeros A, B, C, D y E (para pasar a la tercera ronda y siembra en el bracket de Match Play): el desempate será por comparación de tarjetas; el primer criterio será quien obtenga más puntos en la última ronda jugada; de persistir el empate, el jugador que realizó mayor puntaje en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate se comparará el puntaje obtenido en el Hoyo 18, posteriormente el del Hoyo 17, Hoyo 16 y así sucesivamente hasta el Hoyo 1.","MODALIDAD STROKE PLAY — Categorías Caballeros Campeonato, Premier y AA (para pasar a la tercera ronda): el desempate será por comparación de tarjetas; el primer criterio será quien obtenga el menor score en la última ronda jugada; de persistir el empate, el menor score obtenido en la vuelta del Hoyo 10 al 18; si persiste el empate, del 13 al 18; de continuar, del 16 al 18. Si persiste el empate ganará el menor score obtenido en el Hoyo 18, después el Hoyo 17 y así sucesivamente hasta el Hoyo 1 para definir al ganador.","MODALIDAD MATCH PLAY: los desempates serán a muerte súbita iniciando por el hoyo donde se inició su ronda de juego, aplicando ventajas."],"paraTrofeos":["Solo por el 1er Lugar (Gross o Neto) se jugará a muerte súbita, por el hoyo que el Director de Reglas designe, y se hará el desempate bajo la misma modalidad de juego.","El resto de los desempates se harán por comparación de tarjetas contando el score del último día jugado.","De persistir el empate, el score obtenido del Hoyo 10 al 18.","Si persiste el empate, del Hoyo 13 al 18.","De continuar, del Hoyo 16 al 18.","Si persiste el empate se comparará el score del Hoyo 18, después el del Hoyo 17 y así sucesivamente hasta el Hoyo 1."],"nota":"El Comité Organizador del Torneo se reserva el derecho de hacer cambios a la presente convocatoria, a las reglas locales y a las condiciones de la competencia en beneficio del mejor desarrollo del Torneo, y su decisión será inapelable."}',
  1
WHERE NOT EXISTS (
  SELECT 1 FROM (SELECT 1 FROM convocatoria_content WHERE torneoid = 361 AND section_id = 'desempates') AS t
);

-- ------------------------------------------------- Valores Stableford (BD)
-- La tabla de valores se lee de torneos.valorstable; aquí solo se asegura
-- que la sección esté visible en /convocatoria del torneo 361.
UPDATE convocatoria_content
SET section_type = 'stableford', title = 'Valores Stableford', enabled = 1
WHERE torneoid = 361 AND section_id = 'stableford';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, enabled)
SELECT 361, 'stableford', 'stableford', 'Valores Stableford', '{}', 1
WHERE NOT EXISTS (
  SELECT 1 FROM (SELECT 1 FROM convocatoria_content WHERE torneoid = 361 AND section_id = 'stableford') AS t
);

COMMIT;
