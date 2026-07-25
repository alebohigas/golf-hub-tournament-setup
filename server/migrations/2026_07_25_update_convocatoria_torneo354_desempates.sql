-- Torneo 354 (Atlas CC 2026) — Agrega criterios de DESEMPATES faltantes
-- Fuente: Terminos_de_competencia_TAG_2026-2.pdf (versión julio 2026)

UPDATE convocatoria_content
SET
  title = 'Desempates',
  content = '{"intro":"Criterios oficiales de desempate del Torneo Anual de Golf Atlas Country Club 2026.","paraCorte":[],"paraTrofeos":["Categoría Campeonato — 1er lugar: se define por muerte súbita comenzando en el hoyo que el comité decida, siempre y cuando el tiempo lo permita.","Para 2do y 3er lugar de Campeonato, todas las demás categorías y el score del día: se define conforme a las reglas de la USGA por sumatoria del último score, en el siguiente orden: hoyos 10 al 18; luego seis hoyos (13 al 18); luego tres hoyos (16 al 18); finalmente hoyo 18.","Si al llegar al hoyo 18 el empate persiste, se aplica la misma sumatoria en los hoyos 1 al 9 de la misma tarjeta.","Para las categorías que juegan formato Stableford se sumarán los puntos siguiendo el mismo sistema."],"nota":"Para efectos de premiación, cualquier controversia será resuelta por la dirección del torneo, cuya decisión será inapelable."}',
  enabled = 1,
  sort_order = 6
WHERE torneoid = 354 AND section_id = 'desempates';

-- Si por alguna razón no existiera el renglón, insertarlo
INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled)
SELECT 354, 'desempates', 'desempates', 'Desempates',
  '{"intro":"Criterios oficiales de desempate del Torneo Anual de Golf Atlas Country Club 2026.","paraCorte":[],"paraTrofeos":["Categoría Campeonato — 1er lugar: se define por muerte súbita comenzando en el hoyo que el comité decida, siempre y cuando el tiempo lo permita.","Para 2do y 3er lugar de Campeonato, todas las demás categorías y el score del día: se define conforme a las reglas de la USGA por sumatoria del último score, en el siguiente orden: hoyos 10 al 18; luego seis hoyos (13 al 18); luego tres hoyos (16 al 18); finalmente hoyo 18.","Si al llegar al hoyo 18 el empate persiste, se aplica la misma sumatoria en los hoyos 1 al 9 de la misma tarjeta.","Para las categorías que juegan formato Stableford se sumarán los puntos siguiendo el mismo sistema."],"nota":"Para efectos de premiación, cualquier controversia será resuelta por la dirección del torneo, cuya decisión será inapelable."}',
  6, 1
WHERE NOT EXISTS (
  SELECT 1 FROM convocatoria_content WHERE torneoid = 354 AND section_id = 'desempates'
);
