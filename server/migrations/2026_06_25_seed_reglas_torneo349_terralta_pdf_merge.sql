-- =====================================================================
-- Seed/MERGE: /reglas content for torneoid=349
--   Source: "REGLAS Y CONDICIONES V TORNEO ANUAL TERRALTA-2026.pdf"
--   (Condiciones de Competencia + Reglas Locales — 26 jun a 04 jul 2026)
--
-- Estrategia:
--   * Reemplaza `reglas_locales` con un set consolidado que combina
--     las reglas locales del PDF + reglas administrativas previas.
--   * Agrega un nuevo `reglas_intro_cards` (Asistencia de Reglas,
--     USGA/FMG, Penalidad estándar).
--   * Conserva `reglamento_local` y `desempates` existentes (no se tocan).
--
-- Idempotente vía ON DUPLICATE KEY UPDATE.
-- =====================================================================
START TRANSACTION;

-- ---------- Intro Cards (top of /reglas) ------------------------------
SET @intro := '[
  {"icon":"BookOpen","title":"Reglas USGA / FMG","body":"Regirán las Reglas de Golf de la USGA adoptadas por la FMG, así como las Condiciones de la Competencia y Reglas Locales del torneo, mismas que dejan sin efecto cualquier otra utilizada en otros torneos (incluyendo la Score Card del Club)."},
  {"icon":"Scale","title":"Penalidad estándar","body":"La penalidad por infringir cualquiera de las presentes Condiciones o Reglas Locales será de dos golpes, salvo que la regla indique algo distinto."},
  {"icon":"AlertTriangle","title":"Asistencia de Reglas","body":"Árbitro del Torneo: Sr. Alberto Glez. Margaín — Tel. 871 235 3828. Asistencia: Miguel Quijano — Tel. 833 100 2902. Es responsabilidad del jugador conocer las Reglas de Golf, las Condiciones de la Competencia y las Reglas Locales."}
]';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled)
VALUES (349, 'reglas_intro_cards', 'cards', @intro, 1)
ON DUPLICATE KEY UPDATE section_type='cards', content=@intro, enabled=1, updated_at=CURRENT_TIMESTAMP;

-- ---------- Reglas Locales (accordion) --------------------------------
SET @locales := '[
  {"titulo":"Handicaps (R3.3)","contenido":"El Comité registra los hándicaps de los jugadores y los ubica en su categoría. Puede ajustar un hándicap de ser necesario; si un jugador detecta un error, deberá informarlo lo antes posible. El Comité se reserva el derecho de aceptar la validez del hándicap."},
  {"titulo":"Jugadores sin hándicap oficial","contenido":"El jugador sin hándicap oficial (GHIN, SPEI o similar) jugará con el mínimo de hándicap de la categoría en la que se inscribió."},
  {"titulo":"Cartas de hándicap","contenido":"El Comité se reserva el derecho de validar o invalidar la carta si las tarjetas del jugador no corresponden al hándicap declarado."},
  {"titulo":"Rondas","contenido":"Se jugarán rondas de 18 hoyos. El Comité se reserva el derecho de reducir la cantidad de hoyos por mal tiempo."},
  {"titulo":"Descalificación","contenido":"Un jugador descalificado por cualquier regla no podrá seguir en la competencia en rondas posteriores. Conserva los premios obtenidos antes de la descalificación y puede seguir participando en rifas, sorteos y competencias externas a las rondas."},
  {"titulo":"Hora de salida (R5.3a)","contenido":"Los jugadores deben estar en su área de salida listos para jugar a la hora estipulada. Hasta 5 minutos de retraso = dos golpes de penalidad. Más de 5 minutos = descalificación."},
  {"titulo":"Retraso injustificado (R5.6)","contenido":"Par time para 18 hoyos: 4:50 hrs. Penalidad: 1 golpe (1ª), 2 golpes (2ª), descalificación (3ª). Cuando un grupo se retrasa, el tiempo para ejecutar el golpe es de 45 s al primer jugador en turno y 40 s a cada uno de los restantes."},
  {"titulo":"Entrega de scores (R3.3)","contenido":"El jugador deberá entregar la tarjeta lo más pronto posible; tiempo máximo: 20 minutos."},
  {"titulo":"Obstrucciones temporales inamovibles (MRL F-23)","contenido":"Instalaciones de publicidad, anuncios, carpas, torres de iluminación, cámaras de video, gradas y vehículos en exhibición instalados para el Torneo son Obstrucciones Temporales Inamovibles. Hay alivio sin penalidad (incluida la línea de juego). Si la obstrucción interfiere con el stance o swing, se toma alivio sin penalidad al punto más cercano más el largo de un palo, sin acercarse al hoyo."},
  {"titulo":"Equipo para medir distancia (R4.3.1)","contenido":"Permitido. No debe tener funciones adicionales (altura, viento, humedad, temperatura o similar). Penalidad: descalificación."},
  {"titulo":"Obstrucciones inamovibles (R16)","contenido":"Caminos con superficie artificial, muros pegados a estos y jardineras rodeadas por ellos; controles de riego, aspersores, bancas, casetas de bombeo, tapas de registro de cemento o metal y snacks: alivio sin penalidad al punto más cercano más el largo de un palo, no más cerca del hoyo."},
  {"titulo":"Obstrucciones inamovibles alrededor de greenes (MRL F-5)","contenido":"Si en la línea de juego hay intervención de una obstrucción a menos de dos palos de la bola y la bola está a menos de dos palos del green, hay alivio sin penalidad: dropear la bola lo más cerca de su posición original más un palo (R16), sin acercarse al hoyo, evitando la intervención y reposando en el área general."},
  {"titulo":"Objetos integrantes del campo (R8.1a)","contenido":"Cajetes de árboles, muros de contención, todos los objetos que delimitan el campo y muros de áreas de penalidad."},
  {"titulo":"Condiciones anormales del campo (R16)","contenido":"Áreas encerradas con líneas o puntos blancos = terreno en reparación. También: hormigueros, agujeros de animal, agua temporal y uniones de pasto recién sembrado. Las áreas marcadas como terreno en reparación que terminan en caminos con superficie artificial son parte de la misma condición."},
  {"titulo":"Bola enterrada (R16.3)","contenido":"Una bola tendrá alivio sin penalidad si está enterrada por su propio impacto a través del campo en el área general."},
  {"titulo":"Áreas de penalidad (R17)","contenido":"Identificadas por estacas y/o líneas pintadas de rojo (laterales). Los muros que las delimitan son parte integrante del campo. Las líneas tienen prioridad sobre las estacas."},
  {"titulo":"Fuera de límites","contenido":"Marcado en la parte inferior interna con estacas, líneas blancas, bardas, cercas, postes o mallas. Las líneas tienen prioridad sobre cualquier otra cosa. Cuando la línea está sobre un camino, es la parte externa del camino la que delimita el fuera de límites."},
  {"titulo":"Teléfonos celulares","contenido":"Solo podrán usarse para solicitar reglas o consultar la aplicación oficial del torneo."},
  {"titulo":"Cierre de la competencia","contenido":"La competencia se considera cerrada al inicio de la ceremonia de premiación."},
  {"titulo":"Otras recomendaciones","contenido":"• Marca tu bola para identificación.\\n• No acomodes la bola en ningún momento.\\n• No hay dadas — hay que embocar.\\n• No puedes cambiar la bola sobre el green ni en ninguna otra parte salvo que una regla lo permita.\\n• Máximo 14 bastones.\\n• Solo un caddie a la vez.\\n• No se puede dar ni recibir consejo."},
  {"titulo":"Puntuación en Stableford","contenido":"Un golpe sobre par: 1 punto. Par: 2. Birdie: 3. Eagle: 4. Albatros: 5. Cuatro bajo par: 6."},
  {"titulo":"Zonas o círculos de dropeo (MRL E-1)","contenido":"Son una opción adicional de alivio a la regla aplicable para una bola en área de penalidad."},
  {"titulo":"Hoyo 3","contenido":"Zona de dropeo ubicada junto al camino a 60 yardas del green."},
  {"titulo":"Hoyo 8 — Zona de juego prohibido (MRL E-8.1)","contenido":"El área de penalidad del hoyo 8 es Zona de Juego Prohibido. El jugador deberá tomar alivio obligatorio con un golpe de penalidad bajo alguna de las tres opciones de la Regla 17, o bien en la zona de dropeo a 230 yardas del green. Si la bola reposa fuera de la zona de juego prohibido, se juega como esté."},
  {"titulo":"Hoyo 14","contenido":"Para una bola que repose dentro del área de snack delimitada con pintura azul, hay zona de dropeo a un costado del camino."},
  {"titulo":"Hoyo 15","contenido":"Para una bola en el área de penalidad atrás del green, zona de dropeo ubicada detrás del green lado izquierdo."},
  {"titulo":"Hoyo 16","contenido":"Zona de dropeo ubicada en la última plataforma junto al camino a 60 yardas del green."},
  {"titulo":"Hoyo 17","contenido":"Para una bola que no cruce el área de penalidad frontal, zona de dropeo a un costado del área de salida de las marcas Doradas."},
  {"titulo":"Categorías de Damas — hoyos 5 y 7","contenido":"En caso de no cruzar el área de penalidad frontal, podrán tomar alivio dropeando la bola en la plataforma original de las marcas de salida rojas."},
  {"titulo":"Suspensión de la ronda","contenido":"En caso necesario, la suspensión se avisa con un toque prolongado de sirena; dos toques anuncian la reanudación."}
]';

INSERT INTO convocatoria_content (torneoid, section_id, section_type, content, enabled)
VALUES (349, 'reglas_locales', 'accordion', @locales, 1)
ON DUPLICATE KEY UPDATE section_type='accordion', content=@locales, enabled=1, updated_at=CURRENT_TIMESTAMP;

COMMIT;
