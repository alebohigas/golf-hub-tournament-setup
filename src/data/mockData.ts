// Mock data service - Replace with actual API calls
// All data structures are ready for database integration

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  enabled: boolean;
  order: number;
}

export interface Sponsor {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  /**
   * Legacy 'logo_nombre' value from the DB — a human-readable identifier
   * (often the original logo filename). Shown under each logo in the
   * Patrocinadores page to make sponsors easy to identify.
   */
  logoName?: string;
}

export interface TournamentInfo {
  id: string;
  name: string;
  club: string;
  logoUrl: string;
  /** Background image for Hero section (from logo_fondo) */
  heroImageUrl: string;
  /** Logo for header/nav ribbon (from logo_header) */
  logoHeaderUrl: string;
  startDate: string;
  endDate: string;
  venue: string;
  phone: string;
  email: string;
  city: string;
  state: string;
}

export interface Category {
  id: string;
  name: string;
  handicapMin: number;
  handicapMax: number;
  format: 'STROKE PLAY' | 'STABLEFORD';
  ventajas: string;
  maxPlayers: number;
  rounds: string;
  teeMarker: string;
}

/** Stats for the history ribbon section */
export interface TournamentStats {
  totalHistoricalPlayers: number;
  yearsHistory: number;
  yearsHistoryDisplay: string;
  maxCategories: number;
}

// Menu Configuration - Binary enabled/disabled from DB
export const menuConfig: MenuItem[] = [
  { id: 'home', label: 'HOME', path: '/', enabled: true, order: 1 },
  { id: 'convocatoria', label: 'CONVOCATORIA', path: '/convocatoria', enabled: true, order: 2 },
  { id: 'eventos', label: 'EVENTOS', path: '/eventos', enabled: true, order: 3 },
  { id: 'jugadores', label: 'JUGADORES', path: '/jugadores', enabled: true, order: 4 },
  { id: 'salidas', label: 'SALIDAS', path: '/salidas', enabled: true, order: 5 },
  { id: 'live', label: 'LIVE', path: '/live', enabled: true, order: 6 },
  { id: 'resultados', label: 'RESULTADOS', path: '/resultados', enabled: true, order: 7 },
  { id: 'competicion', label: 'COMPETICIÓN', path: '/competicion', enabled: true, order: 8 },
  { id: 'calendario', label: 'CALENDARIO DE JUEGO', path: '/calendario', enabled: true, order: 10 },
  { id: 'horarios', label: 'HORARIOS DE SALIDAS', path: '/horarios', enabled: true, order: 15 },
  { id: 'avisos', label: 'AVISOS', path: '/avisos', enabled: true, order: 11 },
  { id: 'premios', label: 'PREMIOS', path: '/premios', enabled: true, order: 12 },
  { id: 'patrocinadores', label: 'PATROCINADORES', path: '/patrocinadores', enabled: true, order: 13 },
  { id: 'reglas', label: 'REGLAS Y CC', path: '/reglas', enabled: true, order: 14 },
];

/** Sponsors fallback - actual data comes from API via useSponsors hook */
export const sponsors: Sponsor[] = [
];

export const tournamentInfo: TournamentInfo = {
  id: '70',
  name: 'LXX Torneo Anual Valle Alto 2026',
  club: 'Club de Golf Valle Alto',
  logoUrl: '',
  heroImageUrl: '',
  logoHeaderUrl: '',
  startDate: '2026-04-24',
  endDate: '2026-05-02',
  venue: 'Club de Golf Valle Alto',
  phone: '',
  email: '',
  city: '',
  state: '',
};

export const categories: Category[] = [
  { id: '1', name: 'PRIMERA', handicapMin: 0.4, handicapMax: 6.9, format: 'STROKE PLAY', ventajas: '80%', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'AZULES' },
  { id: '2', name: 'A', handicapMin: 7.0, handicapMax: 11.5, format: 'STABLEFORD', ventajas: 'SIN VENTAJA', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'BLANCAS' },
  { id: '3', name: 'B', handicapMin: 11.6, handicapMax: 16.2, format: 'STABLEFORD', ventajas: 'SIN VENTAJA', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'BLANCAS' },
  { id: '4', name: 'C', handicapMin: 16.3, handicapMax: 20.8, format: 'STABLEFORD', ventajas: 'SIN VENTAJA', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'BLANCAS' },
  { id: '5', name: 'D', handicapMin: 20.9, handicapMax: 31.9, format: 'STABLEFORD', ventajas: '80%', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'BLANCAS' },
  { id: '6', name: 'SENIOR PRIMERA', handicapMin: 0.0, handicapMax: 15.0, format: 'STABLEFORD', ventajas: '80%', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'DORADAS' },
  { id: '7', name: 'SENIOR PRIMERA', handicapMin: 16.0, handicapMax: 29.0, format: 'STABLEFORD', ventajas: '80%', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'DORADAS' },
  { id: '8', name: 'DAMAS', handicapMin: 0.0, handicapMax: 35.2, format: 'STABLEFORD', ventajas: '80%', maxPlayers: 0, rounds: '18 HOYOS', teeMarker: 'ROJAS' },
  { id: '9', name: 'NOVATOS', handicapMin: 0, handicapMax: 54, format: 'STABLEFORD', ventajas: 'SIN VENTAJA', maxPlayers: 0, rounds: '9 HOYOS P/DÍA', teeMarker: 'BLANCAS' },
];

export const tournamentStats: TournamentStats = {
  totalHistoricalPlayers: 344,
  yearsHistory: 51,
  yearsHistoryDisplay: '50+',
  maxCategories: 12,
};

/** Eligibility requirements from convocatoria */
export const eligibilityText =
  "Podrán participar Damas y Caballeros amateurs mayores de 18 años que tengan hándicap registrado en la FMG o en el sistema interno del club, publicado al 1° de abril de 2026. En las categorías Campeonato y Premier se permitirá jugar a menores de 18 años que cuenten con el hándicap solicitado. Al jugador que no tenga hándicap registrado, los profesionales le podrán calcular uno siempre y cuando tengan un mínimo de 8 scores entregados.";

/** Important notes for eligibility section */
export const notesText: string[] = [
  "Asociados: inicio de inscripciones miércoles 1 de abril.",
  "Hijos de socios dependientes: a partir del miércoles 15 de abril.",
  "Invitados e Hijos no dependientes: a partir del domingo 19 de abril.",
  "Cierre de inscripciones: domingo 19 de abril o al completar el cupo de cada categoría.",
  "Cancelaciones: la fecha límite es el martes 21 de abril; después de esta fecha no se aceptan cancelaciones (no hay reembolso).",
  "Los jugadores que soliciten una categoría que no les corresponda según su hándicap deberán esperar hasta 2 días antes del inicio de juego de la categoría solicitada para asegurar que no se quede fuera otro jugador que sí cumpla con el hándicap requerido.",
  "Si una categoría alcanza el número máximo de jugadores se cerrará y los jugadores fuera entrarán en lista de espera; si hay alguna cancelación se llamará al jugador para inscribirse.",
];

export interface ScheduleSlot {
  turno: string;
  horario: string;
  martes: string[];
  miercoles: string[];
  jueves: string[];
  viernes: string[];
  sabado: string[];
}

/** Schedule data - Semana Santa Chilchota 2026 (no detailed schedule in flyer) */
export const scheduleData: ScheduleSlot[] = [];

/** Salidas description */
export const salidasText = "";

/** Handicap rules */
export const handicapText = "";

/** Desempates rules */
export const desempatesText = "";

/** Premios description */
export const premiosText = "";

/** Eventos adicionales */
export const eventosAdicionalesText = "";

/** Inscripciones text. Typed as string so consumers can call string methods
 *  even when the current tournament leaves it empty. */
export const inscripcionesText: string = "";

export interface PricingTier {
  categoria: string;
  costo: string;
  mayo6: string;
  junio5: string;
  julio4: string;
  agosto3: string;
  sept2: string;
}

export interface PricingTable {
  title: string;
  subtitle?: string;
  tiers: PricingTier[];
}

/** Pricing — LXX Torneo Anual Valle Alto 2026 (single table, single payment). */
export const sociosPricing: PricingTable[] = [
  {
    title: 'Costos de Inscripción',
    subtitle: 'Solamente para jugadores que quieran participar en el Torneo',
    tiers: [
      { categoria: 'Socios Titulares',           costo: '$6,000',  mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Eméritos',                   costo: '$5,000',  mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Damas',                      costo: '$5,000',  mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Dependientes',               costo: '$5,000',  mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Invitados Caballeros',       costo: '$18,500', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Invitados Damas y Juveniles',costo: '$10,500', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
    ],
  },
];

/** Foráneos pricing interface */
export interface ForaneosPricing {
  title: string;
  caballeros: string;
  damasSeniors: string;
}

/** Foráneos pricing - not applicable */
export const foraneosPricing: ForaneosPricing[] = [];

/** Contact info interface */
export interface ContactInfo {
  bankName: string;
  clabe: string;
  cuenta: string;
  nombre: string;
  email: string;
  telefono: string;
  telefonoDirecto: string;
}

/** Pricing note */
export const pricingNote = "";

/** Contact/banking info - Gómez Palacio */
export const contactInfo: ContactInfo = {
  bankName: '',
  clabe: '',
  cuenta: '',
  nombre: '',
  email: '',
  telefono: '',
  telefonoDirecto: '',
};

/** Contact warning */
export const contactWarning = "";

/** Día de práctica */
export const diaDePracticaText = "";

/** Información general disclaimer */
export const informacionGeneralText = "";

/** Convocatoria section configuration */
export interface ConvocatoriaSection {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

/** Default 8 sections for convocatoria page - disabled if no info */
export const convocatoriaSections: ConvocatoriaSection[] = [
  { id: 'descripcion', label: 'Descripción', enabled: true, order: 1 },
  { id: 'elegibilidad', label: 'Elegibilidad', enabled: false, order: 2 },
  { id: 'costos', label: 'Costos', enabled: true, order: 3 },
  { id: 'categorias', label: 'Categorías y Sistema de Juego', enabled: true, order: 4 },
  { id: 'premiacion', label: 'Premiación', enabled: true, order: 5 },
  { id: 'desempates', label: 'Desempates para Corte', enabled: true, order: 6 },
  { id: 'reglas', label: 'Reglas Locales', enabled: false, order: 7 },
  { id: 'competencias', label: 'Competencias Especiales', enabled: true, order: 8 },
  { id: 'servicios', label: 'Servicios y Horarios del Club', enabled: true, order: 9 },
  { id: 'calendarioJuego', label: 'Calendario y Horarios de Juego', enabled: true, order: 10 },
  { id: 'patrocinadoresOficiales', label: 'Patrocinadores Oficiales', enabled: true, order: 11 },
];

/** Description text — LXX Torneo Anual Valle Alto 2026 */
export const convocatoriaDescripcion =
  "Se convoca a todos los Asociados del Club de Golf Valle Alto e invitados a participar en su LXX Torneo Anual de Invitación, que se llevará a cabo del 24 de abril al 02 de mayo de 2026 en las instalaciones de nuestro club.\n\n" +
  "El torneo cuenta con categorías para Caballeros (Campeonato, Premier, AA, A, B, C, D), Seniors (Campeonato Mayores, A y B) y Damas (A, B, C, D, E y Estelares), así como competencias especiales: Tiro Espectacular de Approach, Torneo de Putt y Putt de 35 yardas, Torneo Driver Damas y Torneo Driver Caballeros.\n\n" +
  "#TORNEOANUAL70";

/** Premiación data - structured prize descriptions */
export interface PremioCategoria {
  categoria: string;
  premios: string[];
}

/** Premiación / Trofeos — LXX Torneo Anual Valle Alto 2026 */
export const premiacionData: PremioCategoria[] = [
  {
    categoria: 'Damas',
    premios: [
      'A — 1° y 2° Gross',
      'A — 1°, 2° y 3° Neto',
      'B — 1°, 2° y 3° Gross',
      'B — 1°, 2° y 3° Neto',
      'C — 1°, 2° y 3°',
      'D — 1°, 2° y 3°',
      'E — 1°, 2° y 3°',
      'Estelares — 1°, 2° y 3°',
    ],
  },
  {
    categoria: 'Caballeros',
    premios: ['Campeonato, Premier, AA, A, B, C y D — 1°, 2° y 3°'],
  },
  {
    categoria: 'Seniors',
    premios: [
      'Campeonato Mayores — 1° y 2° Gross',
      'Campeonato Mayores — 1° y 2° Neto',
      'A — 1°, 2° y 3°',
      'B — 1°, 2° y 3°',
    ],
  },
];

/**
 * Desempates para Corte — criterios oficiales de desempate
 * tomados de los Términos de la Competencia (LXX Anual Valle Alto 2026).
 */
export interface DesempatesData {
  /** Intro / encabezado mostrado arriba de las listas */
  intro: string;
  /** Criterios para desempate del corte (orden importa) */
  paraCorte: string[];
  /** Criterios para desempate de trofeos */
  paraTrofeos: string[];
  /** Nota final mostrada debajo */
  nota?: string;
}

/** Cómo decidir empates — Valle Alto 2026 */
export const desempatesData: DesempatesData = {
  intro: 'Se utilizarán los siguientes términos para definir corte',
  paraCorte: [
    'Se tomará como primer criterio el mejor score de la última ronda. Si persistiera el empate, el segundo criterio será comparar el score de los hoyos del 10 al 18 de la última ronda, continuando con los hoyos del 13 al 18, 16 al 18 y por último el hoyo 18. En caso de persistir el empate se hará lo mismo con los hoyos del 1 al 9.',
  ],
  paraTrofeos: [
    'Solo para el primer lugar en todas las categorías Gross o Neto se jugará a muerte súbita SIN VENTAJAS.',
    'Si por oscuridad o mal clima no se puede iniciar o continuar la muerte súbita, el desempate se resolverá con los mismos criterios usados para el corte.',
    'Para el resto de los empates se utilizan los mismos criterios que para el corte.',
  ],
  nota: 'Cualquier empate en el campo iniciará a la hora y por el hoyo establecidos por el Comité.',
};

/** Reglas locales - structured rules */
export interface ReglaItem {
  titulo: string;
  contenido: string;
}

/** Reglas locales y términos de la competencia — LXX Anual Valle Alto 2026. */
export const reglasData: ReglaItem[] = [
  {
    titulo: 'Aviso a los Jugadores',
    contenido:
      'Regirán las Reglas de Golf de la USGA adoptadas por la Federación Mexicana de Golf y las siguientes Reglas Locales mismas que dejan sin efecto las del club sede, se encuentren o no publicadas en cualquier parte, y cualquier versión anterior de este documento (24 de abril, 2026). Es responsabilidad de los jugadores conocer las Reglas de golf, las Reglas Locales y los Términos de la Competencia. La penalidad por violar una Regla Local es penalidad general, a menos que se indique otra cosa.\n\nComité de Reglas: Eduardo Topete Seňkowski (33 3100 1191 todos los días), Gina Mendoza (55 4393 5084 jueves 30 de abril, viernes 1 de mayo y sábado 2 de mayo) y cualquier persona designada por el Comité. Las decisiones del Comité son inapelables.',
  },
  {
    titulo: '1. Fuera de Límites',
    contenido:
      'Señalado por estacas y líneas blancas, bardas y contornos de caminos así señalados. El fuera de límites del lado izquierdo del Hoyo 2 se aplica únicamente al juego del Hoyo 2.',
  },
  {
    titulo: '2. Objetos Integrales (sin alivio sin penalidad)',
    contenido:
      'Los muros de contención de lagos, ríos, canales y plataformas de salida; jardineras y plantas de ornato no marcadas como terreno en reparación o no indicadas como obstrucciones; cajetes de los árboles; cualquier objeto unido a un árbol, esté atado o no. Además, los liners (o plástico) debajo de la arena en bunkers y del mulch alrededor de los árboles (no hay alivio sin penalidad de estos liners o plástico).\n\nExcepción: Los muros de contención de las áreas de salida en los Hoyos 11 y 13 NO son objetos integrales, son obstrucciones inamovibles (alivio sin penalidad de acuerdo con la Regla 16.1b).',
  },
  {
    titulo: '3. Áreas de Penalidad Rojas',
    contenido:
      'Identificadas con estacas y/o líneas rojas. Existen círculos de dropeo adicionales y opcionales en los hoyos 3 y 4; si el jugador decide dropear en un círculo, deberá hacerlo en el que corresponda de acuerdo a las líneas blancas que así lo indican.',
  },
  {
    titulo: '4. Condiciones Anormales del Campo (alivio sin penalidad)',
    contenido:
      'Terreno en Reparación:\n• Áreas identificadas con líneas blancas o estacas azules.\n• Zona Prohibida Para Jugar (alivio obligatorio sin penalidad, dropear dentro del largo de un bastón del punto de alivio completo más cercano sin acercarse al hoyo): el vivero (línea blanca) entre los hoyos 12, 13 y 14; y el vivero (línea blanca) entre los hoyos 5 y 13.\n• Ranuras alrededor de los greenes: está en efecto el MRL F-19. El alivio bajo esta Regla está permitido SOLO SI LA BOLA REPOSA SOBRE LA RANURA (dropear la bola dentro de un bastón del punto de alivio más cercano y no en green). No existe alivio por interferencia de la ranura por swing, stance o línea de juego.\n• Los tensores que sostienen algunos árboles son obstrucciones.\n• En los hoyos 12 y 18 los nuevos bunkers de fairway están en juego: si una bola reposa en ellos se deberá jugar desde ahí o tomar los alivios con penalidad de acuerdo a las Reglas. Las áreas marcadas fuera y junto a estos bunkers son terreno en reparación, por lo que se puede tomar alivio sin penalidad de acuerdo a la Regla 16.1b.\n\nObstrucciones Inamovibles:\n• Hoyo 6: el snack, el kiosko y las jardineras son una sola obstrucción. Si el jugador decide dropear en un círculo, deberá usar el que corresponda de acuerdo al hoyo que se esté jugando.\n• El área de la pizarra de yardaje definida con liner de plástico en la salida de cada hoyo.\n• El área de máquinas en el hoyo 14 (existe un círculo de dropeo como opción adicional de alivio).\n• Cuando una obstrucción inamovible se junta con otra condición anormal del campo, se considera como la misma (una sola) cuando se está tomando alivio bajo la Regla 16.1. Está en efecto el MRL 8F-3.\n• Las jardineras circundadas por caminos se consideran parte del camino.\n• Los muros de contención al lado izquierdo del hoyo 1, en las mesas de salida de los hoyos 11 y 13, y atrás del green del hoyo 16.\n\nObstrucciones inamovibles cerca del Green: está en efecto el MRL 8F-5. Alivio bajo la Regla 16.1. Adicionalmente, si una bola reposa en el área general y una obstrucción inamovible dentro del largo de dos bastones del green, y dentro de dos bastones de la bola, interviene con la línea de juego, el jugador podrá tomar alivio como sigue: levantar la bola y dropearla dentro del largo de un bastón del punto más cercano de alivio completo que (a) no se acerque al hoyo, (b) evite la intervención, y (c) no esté en un área de penalidad ni en un green.\n\nObstrucciones temporales inamovibles (TIO\u2019s): está en efecto el MRL 8F-23. Se consideran TIO\u2019s todas las carpas de promoción y recepción de scores, todos los automóviles de exhibición dentro o fuera del campo, todos los anuncios de publicidad, las cámaras de video en los greenes de los pares 3 y cualquier otra obstrucción que se encuentre temporalmente en el campo y no pueda ser removida con facilidad. Alivio a ambos lados de la obstrucción bajo la Regla correspondiente.',
  },
  {
    titulo: '5. Uniones de Pasto Recién Plantado',
    contenido:
      'Está en efecto el MRL 8F-7. Si la bola reposa en una unión de pasto recién plantado el jugador puede dropear la bola sin castigo dentro del largo de un bastón del punto de alivio completo más cercano sin acercarse al hoyo. Todas las uniones de pasto se consideran la misma para efectos del alivio. No hay alivio por interferencia solo por el stance.',
  },
  {
    titulo: '6. Zonas de Dropeo',
    contenido:
      'Son una opción adicional a la Regla aplicable. Además de los mencionados en el siguiente punto, existen dos círculos de dropeo en el hoyo 4, como opción adicional para una bola injugable en la jardinera atrás de green que colinda con la barda de "fuera de límites". Si una bola reposa en esta jardinera, el jugador puede, sin penalidad, tomar el alivio de acuerdo a la Regla 16.1b o utilizar uno de los círculos (el más cercano).\n\nÁreas de Penalidad Rojas: identificadas con estacas y/o líneas rojas. Existen círculos de dropeo adicionales y opcionales en los hoyos 3 y 4; si el jugador decide dropear en un círculo, deberá hacerlo en el que corresponda de acuerdo a las líneas blancas que así lo indican.',
  },
  {
    titulo: '7. Bastones Dañados',
    contenido:
      'Está en efecto el MRL 8F G-9. La Regla 4.1b(3) se modifica de la siguiente manera: el jugador podrá reemplazar un bastón dañado sólo si se quebró o se dañó significativamente durante la ronda ya sea por el jugador o su caddie, excepto que haya sido quebrado o dañado por abuso.',
  },
  {
    titulo: '8. Equipos para Medir Distancia',
    contenido:
      'Permitidos. Otras funciones como medir la velocidad del viento, slope, etc., no deben utilizarse (ver Regla 4.3a).',
  },
  {
    titulo: '9. Teléfonos Celulares',
    contenido:
      'Se permite el uso de teléfonos celulares siempre y cuando se haga con discreción, sin retrasar el juego y sin distraer a los demás jugadores; en caso de no cumplir con lo anterior el jugador podrá ser penalizado de acuerdo con la Regla 4.3.',
  },
  {
    titulo: '10. Música',
    contenido:
      'Durante cualquier ronda, está prohibido escuchar música.\n• Primera infracción: amonestación.\n• Segunda infracción: penalidad general.\n• Tercera infracción: descalificación.',
  },
  {
    titulo: '11. Política de Ritmo de Juego',
    contenido:
      'Los jugadores deberán jugar de acuerdo al Ritmo de Juego establecido por el Comité, el cual se indica en cada tarjeta de score del jugador (4 hrs 40 min en 18 hoyos). Si cualquier grupo está arriba del tiempo establecido y "fuera de posición", los jugadores serán cronometrados teniendo un máximo de 40 segundos para ejecutar su golpe.\n\nPenalidad: 1er mal tiempo, un golpe de castigo; 2do mal tiempo, penalidad general; 3er mal tiempo, descalificación.',
  },
  {
    titulo: '12. Cierre de la Competencia',
    contenido:
      'Se considera cerrada la competencia al iniciar la ceremonia de premiación.',
  },
  {
    titulo: 'Importante',
    contenido:
      'Las líneas verdes en el campo NO TIENEN NINGÚN SIGNIFICADO.',
  },
];

/** Reglamento local - structured local rules with collapsible sections */
export interface ReglamentoLocalItem {
  titulo: string;
  contenido: string;
}

/** Reglamento local — Valle Alto 2026 (no se publica en el PDF). */
export const reglamentoLocalData: ReglamentoLocalItem[] = [
  {
    titulo: 'Sistemas de Juego — Stroke Play',
    contenido:
      'CAMPEONATO, Premier y AA: 54 hoyos sin hándicap. Pasan el corte 12 jugadores (sin empates) después de 36 hoyos.\n\nCATEGORÍA A: 72 hoyos sin hándicap. Habrá 2 cortes: el primero a los 36 hoyos jugados pasando los mejores 24 jugadores sin empates y, el segundo corte, a 54 hoyos jugados pasando a la final los primeros 12 jugadores sin empates.\n\nCAMPEONATO MAYORES: 54 hoyos con hándicap al 80%. Pasan el corte los mejores 4 gross y los mejores 4 neto después de 36 hoyos. Los jugadores deberán tener 50 años o más cumplidos el primer día de juego.\n\nDAMAS A y B: 54 hoyos con el 80% de hándicap. Pasan el corte las mejores 4 gross y las mejores 4 neto después de 36 hoyos. En caso de que alguna jugadora pase a la final Gross y también a la final Neto, deberá jugar únicamente por el trofeo Gross; en este caso la quinta mejor jugadora en Neto, jugará por el trofeo Neto.',
  },
  {
    titulo: 'Sistemas de Juego — Stableford (acumulado)',
    contenido:
      'DAMAS C, D y E: 54 hoyos con el 80% de hándicap. Habrá corte a los 36 hoyos jugados. Las mejores 8 jugadoras sin empates pasarán a la final conservando el acumulado de puntos.\n\nB, C y D: 72 hoyos con hándicap al 80%. Habrá 2 cortes: el primero a los 36 hoyos jugados pasando los mejores 24 jugadores sin empates y, el segundo corte, a 54 hoyos jugados pasando a la final los primeros 12 jugadores sin empates.\n\nSENIORS A y B: 54 hoyos con hándicap al 80%. Pasan el corte los mejores 12 jugadores de cada categoría después de 36 hoyos. Los jugadores deberán tener 60 o más años cumplidos al primer día de juego.\n\nDAMAS ESTELARES: 27 hoyos sin hándicap con corte a los 18 hoyos jugados pasando las mejores 6 jugadoras sin empates.',
  },
  {
    titulo: 'Marcas de Salida',
    contenido:
      'CAMPEONATO: Negras.\nPremier y AA: Azules.\nA, B, C, D y CAMPEONATO MAYORES: Blancas.\nDAMAS: Rojas.\nDAMAS ESTELARES: Naranjas.',
  },
  {
    titulo: 'Hora de Salida',
    contenido:
      'Tanto en stroke play como en stableford, los jugadores deberán estar en su mesa de salida, listos para jugar, a la hora estipulada independientemente del orden en que les toque salir. Si el jugador se presenta hasta con cinco minutos de retraso a su mesa de salida, tendrá 2 golpes de penalidad en el primer hoyo. Después de estos 5 minutos, será descalificado.',
  },
  {
    titulo: 'Ronda Estipulada',
    contenido: '9 hoyos.',
  },
  {
    titulo: 'Vestimenta',
    contenido: 'Según el código interno del Reglamento de Golf.',
  },
  {
    titulo: 'Transportación Automotriz',
    contenido:
      'Los jugadores podrán utilizar transportación automotriz para ellos mismos, su equipo y su caddie.',
  },
  {
    titulo: 'Caddie',
    contenido:
      'Es obligatorio para todos los jugadores contratar los servicios de un caddie (siempre y cuando el club pueda proporcionarles uno), el cual puede ser compartido con otro jugador.',
  },
  {
    titulo: 'Puntuación Stableford',
    contenido:
      '• 2 golpes más que el par (doble bogey): sin puntos\n• 1 golpe más que el par (bogey): un punto\n• Par: dos puntos\n• 1 golpe menos que par (birdie): tres puntos\n• 2 golpes menos que par (águila): cuatro puntos\n• 3 golpes menos que par (albatros): cinco puntos',
  },
  {
    titulo: 'Suspensión de Juego',
    contenido:
      '• Suspensión inmediata del juego: una nota prolongada de sirena.\n• Suspensión del juego: tres notas consecutivas de sirena.\n• Reanudación del juego: dos notas consecutivas de sirena.\n\nCuando el juego ha sido suspendido por el Comité por una situación peligrosa (una nota prolongada de sirena), todos los jugadores deberán SUSPENDER DE INMEDIATO SU JUEGO. Si un jugador no interrumpe de inmediato su juego en esta circunstancia, será DESCALIFICADO.',
  },
  {
    titulo: 'Entrega de Scores',
    contenido:
      'Es responsabilidad del jugador que su tarjeta sea entregada. Ésta deberá entregarse en un lapso no mayor a 15 minutos a partir del momento en el que el grupo haya terminado de jugar el último hoyo de la ronda. Las tarjetas se entregarán en la mesa de recepción ubicada junto a la caseta del starter. Si el jugador no entrega su tarjeta de score en el tiempo indicado será descalificado.',
  },
  {
    titulo: 'Cómo Decidir Empates — Para el Corte',
    contenido:
      'Se tomará como primer criterio el mejor score de la última ronda. Si persistiera el empate, el segundo criterio será comparar el score de los hoyos del 10 al 18 de la última ronda, continuando con los hoyos del 13 al 18, 16 al 18 y por último el hoyo 18. En caso de persistir el empate se hará lo mismo con los hoyos del 1 al 9.',
  },
  {
    titulo: 'Cómo Decidir Empates — Para Trofeos',
    contenido:
      'Sólo para el primer lugar en todas las categorías Gross o Neto se jugará a muerte súbita SIN VENTAJAS (en caso de no poder iniciar o continuar con un desempate a muerte súbita por oscuridad o mal clima, el desempate se llevará a cabo como lo señalado para desempatar para el corte). Para decidir el resto de los empates se utilizarán los mismos criterios que para el corte. Cualquier empate en el campo iniciará a la hora y por el hoyo establecidos por el Comité.',
  },
  {
    titulo: 'Premios de O\u2019yes por Día',
    contenido:
      'Importante: un jugador no podrá ganar más de un O\u2019yes por día.',
  },
  {
    titulo: 'Cierre de la Competencia',
    contenido: 'Al iniciarse la ceremonia de premiación.',
  },
  {
    titulo: 'Recomendaciones',
    contenido:
      '• Marcar la bola antes de levantarla para identificarla (penalidad: 1 golpe si no se marca).\n• No hay "dadas", se debe embocar en todos los hoyos. En Stableford deberá embocarse toda bola que cuente para obtener puntos, de lo contrario podrá ser levantada sin embocar.\n• No se debe cambiar bola en green (penalidad: un golpe).\n• Máximo 14 bastones.\n• No se puede dar ni pedir consejo.\n• Presentarse en su hoyo de salida 5 minutos antes.',
  },
  {
    titulo: 'Aviso General',
    contenido:
      'ESTAS REGLAS LOCALES Y TÉRMINOS DE LA COMPETENCIA DEJAN SIN EFECTO CUALQUIER REGLA LOCAL O TÉRMINO DE LA COMPETENCIA QUE EL CLUB UTILIZA PARA EL JUEGO NORMAL DE SUS SOCIOS, SE ENCUENTREN O NO PUBLICADAS EN CUALQUIER PARTE.',
  },
];
const _reglamentoLocalDataArchived: ReglamentoLocalItem[] = [
  {
    titulo: 'Responsabilidad del Jugador',
    contenido: 'ES RESPONSABILIDAD DEL JUGADOR CONOCER LAS REGLAS DE GOLF, LAS CONDICIONES DE LA COMPETENCIA Y LAS REGLAS LOCALES.'
  },
  {
    titulo: 'Reglas Aplicables',
    contenido: 'Regirán las Reglas de Golf de la USGA adoptadas por FMG, así como las siguientes Condiciones de Competencia y Reglas Locales, mismas que dejan sin efecto otras utilizadas en otros torneos incluyendo las propias del Score Card del Club o cualquier otro documento. Se designa al comité de golf como Juez del Torneo.\n\nLa penalidad por infringir alguna de las presentes será de dos golpes.'
  },
  {
    titulo: 'Handicaps (R3.3)',
    contenido: 'El Comité será el encargado de registrar los hándicaps de los jugadores y ubicarlos en su categoría correspondiente, pero si un jugador sabe que el comité cometió un error con su hándicap deberá informarlo lo más pronto posible, de lo contrario este podría quedar descalificado de la competencia. La fecha de corte del hándicap es al día 15 de marzo 2026. El comité se reserva el derecho de aceptar la validez del hándicap.'
  },
  {
    titulo: 'Jugadores sin Handicap Oficial',
    contenido: 'Si un jugador no cuenta con un hándicap Oficial como GHIN O SPEI, deberá presentar una carta del profesional al club que pertenezca.'
  },
  {
    titulo: 'Hora de Salida (R5.3a)',
    contenido: 'Los jugadores deberán estar en su Área de salida, listos para jugar, a la hora estipulada independientemente del orden en que les toque salir. Si el jugador se presenta hasta con cinco minutos de retraso a su mesa de salida, tendrá dos golpes de castigo. Si el jugador se presenta después de los cinco minutos, será descalificado.'
  },
  {
    titulo: 'Retraso Injustificado (R5.6)',
    contenido: 'Par time para 18 hoyos es de 4:40 hrs. Penalidad por retraso injustificado: un golpe de castigo en primera ocasión, dos golpes en segunda y descalificación en tercera ocasión. Cuando un grupo se retrase, el tiempo para ejecutar su golpe es de 45 segundos al primer jugador en turno y de 40 segundos cada jugador restante.'
  },
  {
    titulo: 'Entrega de Scores (3.3)',
    contenido: 'El jugador deberá entregar la tarjeta lo más pronto posible; el tiempo máximo para entregar la tarjeta es de 15 minutos.'
  },
  {
    titulo: 'Lies Preferidos - Regla Local E-3',
    contenido: 'El jugador podrá tomar alivio colocando su bola a lo largo de una tarjeta score sin acercarse a la bandera y sin cambiar de área del campo en el área general y bunkers, no aplica para áreas de penalidad, ni greenes.'
  },
  {
    titulo: 'Puntuación Stableford',
    contenido: '• 1 golpe sobre par: 1 punto\n• Golpes en el par: 2 puntos\n• 1 golpe bajo el par: 3 puntos\n• 2 golpes bajo el par: 4 puntos\n• 3 golpes bajo el par: 5 puntos\n• 4 golpes bajo el par: 6 puntos'
  },
  {
    titulo: 'Obstrucciones Temporales Inamovibles (RL F-23)',
    contenido: 'Todas las instalaciones de publicidad, anuncios y carpas, que no se puedan mover, así como los vehículos en exhibición instalados especialmente para este Torneo, se consideran Obstrucciones Temporales Inamovibles y podrán tener alivio sin castigo incluyendo la línea de juego.'
  },
  {
    titulo: 'Zonas o Círculos de Dropeo',
    contenido: 'Son una opción más de alivio a la regla aplicable para una bola en área de penalidad, hoyo 12.'
  },
  {
    titulo: 'Equipo para Medir Distancia (R4.3,1)',
    contenido: 'Está permitido. No deberá tener alguna función adicional que pueda medir altura, humedad o temperatura o similar. Penalidad de descalificación.'
  },
  {
    titulo: 'Obstrucciones Inamovibles (R16)',
    contenido: 'Caminos con superficie artificial y jardineras rodeadas por estos; controles de riego, aspersores, bancas de descanso, casetas de bombeo, tapas de registro de cemento y metal. Snack del hoyo 5.'
  },
  {
    titulo: 'Green Equivocado / Zona de Juego Prohibido (2.4)',
    contenido: 'Alivio sin castigo obligatorio.'
  },
  {
    titulo: 'Obstrucciones Movibles (R-15)',
    contenido: 'Esta regla cubre el alivio sin penalidad que está permitido de objetos artificiales como rastrillos u cualquier objeto que cumplen con la definición de obstrucción movible.'
  },
  {
    titulo: 'Obstrucciones Inamovibles Alrededor de los Greenes (Regla Local F-5)',
    contenido: 'Cuando en la línea de juego exista intervención por una obstrucción que se encuentra dentro de dos bastones de la bola que está dentro del largo de dos bastones del Green, habrá alivio sin castigo dropeando la bola lo más cerca posible de su posición original más 1 bastón (R16), que no se acerque al hoyo, evite la intervención, y esta repose en el Área general.'
  },
  {
    titulo: 'Objetos Integrantes del Campo (R8.1a)',
    contenido: 'Todos los muros de contención de las mesas de salida incluyendo los setos del hoyo 9 se consideran objetos integrales del campo, por lo cual no tienen alivio.'
  },
  {
    titulo: 'Condiciones Anormales del Campo (R16)',
    contenido: 'Áreas que estén encerradas con líneas o puntos blancos definen terreno en reparación, Hormigueros, agujeros de animal, Agua Temporal. Los caminos de grava y terracería que involucran a los hoyos 6, 8, 15 y 17.\n\nLas áreas marcadas como terreno en reparación que terminan en caminos con superficie artificial son parte de la misma condición.'
  },
  {
    titulo: 'Bola Enterrada (R16.3)',
    contenido: 'Una bola tendrá alivio sin castigo si está enterrada por su propio impacto a través del campo en área general.'
  },
  {
    titulo: 'Áreas de Penalidad (R17)',
    contenido: 'Se encuentran identificados por estacas y/o líneas pintadas de rojo (lateral). Los cordones de concreto se consideran parte integrante del campo. Las líneas tienen prioridad sobre las estacas.'
  },
  {
    titulo: 'Fuera de Límites',
    contenido: 'Está marcado en la parte inferior interna con estacas, líneas blancas o bardas. Las líneas tienen prioridad sobre cualquier otra cosa.'
  },
  {
    titulo: 'Zonas de Juego Prohibido',
    contenido: 'Identificadas con estaca azul, alivio obligatorio sin castigo, algunas jardineras y árboles recién plantados.'
  },
  {
    titulo: 'Cierre de la Competencia',
    contenido: 'La Competencia se considera cerrada en el momento del inicio de la ceremonia de premiación.'
  },
  {
    titulo: 'Otras Recomendaciones',
    contenido: 'Recuerde que las Reglas contemplan:\n\n• Marcar su bola para identificación.\n• No hay dadas, hay que embocar.\n• No se puede cambiar la bola sobre el Green o en ninguna otra parte a menos que una Regla lo permita.\n• No se pueden usar más de 14 bastones.\n• Estar 10 minutos antes de su hora de salida.\n• No se puede dar o recibir consejo.'
  },
  {
    titulo: 'Desempates',
    contenido: 'Para el primer lugar en todas las categorías será en el campo hoyo por hoyo bajo el mismo sistema jugado durante la competencia con ventajas por el hoyo designado por el Oficial de Reglas y el Comité, el primer criterio será por comparación de tarjetas de la última ronda (mejor score) y como segundo criterio será (retrogresión) en la vuelta 10-18, de la última ronda, en caso de persistir el empate, de los hoyos: 13-18, 16-18, 18.'
  },
  {
    titulo: 'Suspensión',
    contenido: 'En caso de ser necesario la Suspensión de la ronda esta será avisada por medio de un escopetazo, al igual que la reanudación de la misma.'
  }
];

/** Competencias especiales data */
export interface CompetenciaEspecial {
  nombre: string;
  descripcion: string;
  premios?: string;
}

/** Competencias especiales — LXX Torneo Anual Valle Alto 2026. */
export const competenciasEspecialesData: CompetenciaEspecial[] = [
  {
    nombre: 'Tiro Espectacular de Approach',
    descripcion: 'Podrán participar únicamente jugadores inscritos al torneo. Cada participante tendrá derecho a realizar dos tiros en los días de calificación; pasarán a la final los mejores 10 resultados diarios. Calificación: sábado 25, domingo 26, lunes 27 y martes 28 de abril (11:00 a 17:00 hrs) en el área del par 3. Final: miércoles 29 de abril a partir de las 18:30 hrs en el Green del Hoyo 15. El ganador será el primer jugador que meta la pelota en el hoyo o quien deje la pelota más cerca.',
    premios: '1°: Auto 2026 (sólo se entregará un auto). 2°: Bolsa de Golf.',
  },
  {
    nombre: 'Torneo de Putt y Putt de 35 yardas',
    descripcion: 'Calificación diaria del sábado 25 al miércoles 29 de abril (11:00 a 17:00 hrs) en el Putting Green; cada jugador podrá participar 1 vez por día con derecho a 2 tiros. Pasan a la final los mejores 64 caballeros y las mejores 32 damas. Final: viernes 1 de mayo — 18:00 hrs damas y 19:30 hrs caballeros. El Putt Espectacular de 35 yardas se jugará el viernes 1 de mayo: el primer participante que la emboque gana 25,000 USD; el segundo en embocar (o el mejor O´Yes) recibe una bolsa de golf.',
    premios: '1° Damas: $10,000 Vales Back 9. 1° Caballeros: $10,000 Vales Back 9. 2° Damas: $7,000. 2° Caballeros: $7,000. 3° Damas: $5,000. 3° Caballeros: $5,000.',
  },
  {
    nombre: 'Torneo Driver Damas',
    descripcion: 'Día de juego: lunes 27 de abril en su primera ronda. Lugar: Hoyo 4. Driver de distancia: el más largo dentro del fairway del hoyo 4 entre las categorías A, B, C, D y E. Driver de precisión: la pelota más cercana a la línea marcada en el fairway del hoyo 4 entre A, B, C, D, E y Estelares. Una jugadora no podrá ganar ambos premios.',
    premios: '1° Distancia: 300 dlls. 1° Precisión: 300 dlls.',
  },
  {
    nombre: 'Torneo Driver Caballeros',
    descripcion: 'Podrán participar todos los jugadores inscritos con un mínimo de 280 yardas de distancia. Inscripciones el día del evento en la mesa de salida del hoyo 16. Habrá una sola categoría: cada jugador tendrá derecho a 2 tiros, se medirá el más largo dentro del fairway. Gana quien logre la mayor distancia dentro del fairway.',
    premios: '1°: 400 dlls. 2°: 300 dlls.',
  },
  {
    nombre: 'Premios O´Yes',
    descripcion: 'Mejor O´Yes general del día: Driver Ping G440. Mejor O´Yes de cada par 3 del día: Putt Scotty Cameron. Mejor O´Yes general del torneo: Certificado de regalo Back 9 por $50,000 MXN.',
    premios: 'Driver Ping G440 (Mejor O´Yes del día). Putt Scotty Cameron (Mejor O´Yes de cada par 3). $50,000 MXN en Certificado Back 9 (Mejor O´Yes del torneo).',
  },
];

// ============= Servicios y Horarios del Club =============

/** Schedule of meals/services for a single tournament day */
export interface ServicioDia {
  /** Day label, e.g. "Viernes 26 de Junio" */
  dia: string;
  /** Bullet list of meal/service slots */
  servicios: string[];
}

/**
 * Servicios y Horarios del Club — alimentos y bebidas por día.
 * Vacío para Valle Alto 2026 (no incluido en la convocatoria).
 * Editable from Admin → Convocatoria.
 */
export const serviciosHorariosData: ServicioDia[] = [];
const _serviciosHorariosArchived: ServicioDia[] = [
  {
    dia: 'Viernes 26 de Junio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
      'Cocktail de bienvenida — Terraza Bar "La Vista": 20:00 hrs',
    ],
  },
  {
    dia: 'Sábado 27 de Junio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
      'Cena buffet en el Salón Principal: 20:00 – 23:00 hrs',
    ],
  },
  {
    dia: 'Domingo 28 de Junio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
      'Domingo familiar — Asado y música en vivo: 14:00 – 18:00 hrs',
    ],
  },
  {
    dia: 'Lunes 29 de Junio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
    ],
  },
  {
    dia: 'Martes 30 de Junio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
    ],
  },
  {
    dia: 'Miércoles 1 de Julio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
      'Noche mexicana — Salón Principal: 20:00 hrs',
    ],
  },
  {
    dia: 'Jueves 2 de Julio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
      'Final Long Driver Caballeros — Terraza "La Vista": 17:00 – 19:30 hrs',
    ],
  },
  {
    dia: 'Viernes 3 de Julio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
      'Final Approach Mixto — Terraza "La Vista": 20:30 hrs',
    ],
  },
  {
    dia: 'Sábado 4 de Julio',
    servicios: [
      'Desayuno en la Casa Club: 06:00 – 11:00 hrs',
      'Comida en la Terraza: 13:00 – 18:00 hrs',
      'Snacks en el campo: 07:00 – 17:00 hrs',
      'Ceremonia de Premiación y cena de gala: 21:00 hrs',
    ],
  },
];

// ============= Patrocinadores Oficiales (Hole in One / Mejor O'Yes) =============

/** Single official sponsor card */
export interface PatrocinadorOficial {
  /** Premio o categoría que patrocinan, e.g. "Hole in One" */
  premio: string;
  /** Nombre del patrocinador */
  patrocinador: string;
  /** Descripción del premio aportado */
  descripcion: string;
}

/**
 * Patrocinadores oficiales del Mejor O´Yes — Valle Alto 2026.
 * No se especifica el patrocinador comercial en el PDF; se listan los
 * premios anunciados directamente por la marca/club.
 * Editable from Admin → Convocatoria.
 */
export const patrocinadoresOficialesData: PatrocinadorOficial[] = [
  {
    premio: 'Mejor O´Yes General del Torneo',
    patrocinador: 'Back 9',
    descripcion: 'Certificado de Regalo Back 9 por $50,000 MXN (Cincuenta mil pesos mexicanos).',
  },
  {
    premio: 'Mejor O´Yes General del Día',
    patrocinador: 'Ping',
    descripcion: 'Driver Ping modelo G440.',
  },
  {
    premio: 'Mejor O´Yes de cada Par 3 del Día',
    patrocinador: 'Scotty Cameron',
    descripcion: 'Putt Scotty Cameron.',
  },
];

// ============= Eventos Sociales (Lifestyle) =============

/** Single social/lifestyle event entry */
export interface EventoSocial {
  /** Day label, e.g. "Viernes 26 de Junio" */
  dia: string;
  /** Time, e.g. "20:00 hrs" */
  hora: string;
  /** Event title */
  titulo: string;
  /** Optional venue */
  lugar?: string;
  /** Optional extra detail */
  descripcion?: string;
}

/**
 * Eventos sociales / lifestyle del torneo.
 * Vacío para Valle Alto 2026 (no listados en el PDF).
 * Mostrados en /eventos como subsección "Sociales".
 */
export const eventosSocialesData: EventoSocial[] = [];
const _eventosSocialesArchived: EventoSocial[] = [
  {
    dia: 'Viernes 26 de Junio',
    hora: '20:00 hrs',
    titulo: 'Cocktail de bienvenida',
    lugar: 'Terraza Bar "La Vista"',
    descripcion: 'Inauguración oficial del torneo con cocktail, música en vivo y bocadillos.',
  },
  {
    dia: 'Sábado 27 de Junio',
    hora: '20:00 hrs',
    titulo: 'Cena de gala',
    lugar: 'Salón Principal',
    descripcion: 'Cena buffet con barra abierta y entretenimiento.',
  },
  {
    dia: 'Domingo 28 de Junio',
    hora: '14:00 hrs',
    titulo: 'Domingo familiar',
    lugar: 'Terraza y Áreas Verdes',
    descripcion: 'Asado, actividades para niños y música en vivo.',
  },
  {
    dia: 'Miércoles 1 de Julio',
    hora: '20:00 hrs',
    titulo: 'Noche mexicana',
    lugar: 'Salón Principal',
    descripcion: 'Cena temática con mariachi y folclor mexicano.',
  },
  {
    dia: 'Sábado 4 de Julio',
    hora: '21:00 hrs',
    titulo: 'Ceremonia de Premiación y Cena de Gala',
    lugar: 'Salón Principal',
    descripcion: 'Entrega de premios, cena de gala y rifa del Hole in One.',
  },
];
// API simulation functions - replace with actual fetch calls
export const fetchMenuConfig = async (): Promise<MenuItem[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  return menuConfig.filter(item => item.enabled).sort((a, b) => a.order - b.order);
};

export const fetchSponsors = async (): Promise<Sponsor[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return sponsors;
};

export const fetchTournamentInfo = async (): Promise<TournamentInfo> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return tournamentInfo;
};

export const fetchCategories = async (): Promise<Category[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return categories;
};

export const fetchTournamentStats = async (): Promise<TournamentStats> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return tournamentStats;
};

// Events data
export interface EventItem {
  time: string;
  event: string;
}

export interface EventDay {
  date: string;
  dayName: string;
  events: EventItem[];
  sorteos: string[];
}

export const eventosData: EventDay[] = [
  {
    date: '30 de Septiembre',
    dayName: 'Martes',
    events: [
      { time: '6:40 y 11:20 HRS', event: 'INICIO DE SALIDAS - DÍA 1' },
      { time: '20:00 HRS', event: 'INAUGURACIÓN' },
      { time: '20:30 HRS', event: 'INAUGURACIÓN GALERÍA DE ARTE' },
      { time: '21:00 HRS', event: 'TORNEO DE APPROACH' },
      { time: '21:00 HRS', event: 'SHOOTOUT' },
      { time: '', event: 'PREMIACIÓN SCORE DIARIO Y RIFAS' },
    ],
    sorteos: ['CARRITO DE GOLF', 'REGALOS PATROCINADORES'],
  },
  {
    date: '1 de Octubre',
    dayName: 'Miércoles',
    events: [
      { time: '6:40 y 11:20 HRS', event: 'INICIO DE SALIDAS - DÍA 2' },
      { time: '19:00 HRS', event: 'TORNEO DE APPROACH' },
      { time: '19:00 HRS', event: 'SHOOTOUT' },
      { time: '19:30 HRS', event: 'DESFILE CIMACO' },
      { time: '', event: 'PREMIACIÓN SCORE DIARIO Y RIFAS' },
    ],
    sorteos: ['CARRITO DE GOLF', 'REGALOS PATROCINADORES'],
  },
  {
    date: '2 de Octubre',
    dayName: 'Jueves',
    events: [
      { time: '6:40 y 11:20 HRS', event: 'INICIO DE SALIDAS - DÍA 3' },
      { time: '19:00 HRS', event: 'TORNEO DE PUTT' },
      { time: '21:00 HRS', event: 'TORNEO DE DRIVER - FINAL' },
      { time: '', event: 'PREMIACIÓN SCORE DIARIO Y RIFAS' },
    ],
    sorteos: ['REGALOS PATROCINADORES'],
  },
  {
    date: '3 de Octubre',
    dayName: 'Viernes',
    events: [
      { time: '6:40 y 11:20 HRS', event: 'INICIO DE SALIDAS - DÍA 4' },
      { time: '20:00 HRS', event: 'FINAL SHOOTOUT' },
      { time: '', event: 'PREMIACIÓN SCORE DIARIO Y RIFAS' },
    ],
    sorteos: ['CARRITO DE GOLF', 'REGALOS PATROCINADORES'],
  },
  {
    date: '4 de Octubre',
    dayName: 'Sábado',
    events: [
      { time: '6:40 y 11:20 HRS', event: 'INICIO DE SALIDAS - DÍA 5' },
      { time: '21:30 HRS', event: 'CEREMONIA DE PREMIACIÓN' },
      { time: '23:00 HRS', event: 'SHOW DE CLAUSURA: MARÍA JOSÉ' },
    ],
    sorteos: ['AUTOMÓVIL', 'CARRITO DE GOLF'],
  },
];

export const fetchEventos = async (): Promise<EventDay[]> => {
  await new Promise(resolve => setTimeout(resolve, 100));
  return eventosData;
};
