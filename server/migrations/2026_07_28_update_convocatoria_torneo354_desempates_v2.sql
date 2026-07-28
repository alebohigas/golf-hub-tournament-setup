-- Torneo 354 — Desempates (versión textual exacta según convocatoria TAG 2026)
UPDATE convocatoria_content
SET
  title = 'Desempates',
  content = '{"intro":"En categoría campeonato, en caso de empate en el primer lugar, este será definido por muerte súbita comenzando en el hoyo que el comité decida, siempre y cuando el tiempo lo permita.","paraCorte":[],"paraTrofeos":["Para segundo y tercer lugar de campeonato, las demás categorías y el score del día, se definirá conforme a las reglas de la USGA de acuerdo al último score, por sumatoria, como sigue:","Hoyos 10 al 18.","Seis hoyos (13 al 18).","Tres hoyos (16 al 18).","Finalmente, al hoyo 18, si el empate persiste, se sumará de la misma forma en los hoyos del 1 al 9 de la misma tarjeta.","Para las categorías que juegan el formato stableford se sumarán los puntos de acuerdo con el mismo sistema."],"nota":"Para efectos de premiación, cualquier controversia será resuelta por la dirección del torneo, cuya decisión será inapelable."}',
  enabled = 1,
  sort_order = 6
WHERE torneoid = 354 AND section_id = 'desempates';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, title, content, sort_order, enabled)
SELECT 354, 'desempates', 'desempates', 'Desempates',
  '{"intro":"En categoría campeonato, en caso de empate en el primer lugar, este será definido por muerte súbita comenzando en el hoyo que el comité decida, siempre y cuando el tiempo lo permita.","paraCorte":[],"paraTrofeos":["Para segundo y tercer lugar de campeonato, las demás categorías y el score del día, se definirá conforme a las reglas de la USGA de acuerdo al último score, por sumatoria, como sigue:","Hoyos 10 al 18.","Seis hoyos (13 al 18).","Tres hoyos (16 al 18).","Finalmente, al hoyo 18, si el empate persiste, se sumará de la misma forma en los hoyos del 1 al 9 de la misma tarjeta.","Para las categorías que juegan el formato stableford se sumarán los puntos de acuerdo con el mismo sistema."],"nota":"Para efectos de premiación, cualquier controversia será resuelta por la dirección del torneo, cuya decisión será inapelable."}',
  6, 1
WHERE NOT EXISTS (
  SELECT 1 FROM convocatoria_content WHERE torneoid = 354 AND section_id = 'desempates'
);