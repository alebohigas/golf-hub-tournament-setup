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

/** Inscripciones text */
export const inscripcionesText = "";

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

/** Reglas locales - structured rules */
export interface ReglaItem {
  titulo: string;
  contenido: string;
}

/** Reglas locales y términos de la competencia — LXX Anual Valle Alto 2026. */
export const reglasData: ReglaItem[] = [
  {
    titulo: 'Reglas Aplicables',
    contenido:
      'Se jugará bajo las Reglas de la USGA adoptadas por la Federación Mexicana de Golf, así como las reglas locales y términos de la competencia que se publicarán para el torneo. Las controversias serán resueltas por el Oficial de Reglas y/o el Comité Organizador, su fallo será definitivo e inapelable. Las rondas de juego estipuladas para este torneo son de 9 hoyos.',
  },
  {
    titulo: 'Desempates para Corte',
    contenido:
      'Primer término: ganará el jugador con mejor score del último día.\nSegundo término: se tomará la tarjeta del último día para desempatar por el sistema de comparación de tarjetas (9-6-3-1), de la vuelta del hoyo 10 al 18. Si persiste el empate, se aplicará lo mismo a la 1ª vuelta.',
  },
  {
    titulo: 'Desempates para Trofeos',
    contenido:
      'Sólo para el primer lugar de todas las categorías Gross o Neto se jugará a muerte súbita sin ventajas. El resto de los empates se definirá primero por el mejor score del último día y, en segundo término, por comparación de tarjetas del último día (hoyos 10 al 18) bajo el sistema 9-6-3-1.',
  },
  {
    titulo: 'Nota Importante — Corte y Doble Categoría',
    contenido:
      'El jugador que no pasó el corte oficialmente una vez publicadas las listas de resultados no podrá participar en la ronda final por ningún motivo. En el caso de jugadores participando en dos categorías que pasen el corte en ambas, el jugador deberá avisar al final cuál de las dos categorías quiere jugar para la ronda final.',
  },
];

/** Reglamento local - structured local rules with collapsible sections */
export interface ReglamentoLocalItem {
  titulo: string;
  contenido: string;
}

/** Reglamento local — Valle Alto 2026 (no se publica en el PDF). */
export const reglamentoLocalData: ReglamentoLocalItem[] = [];
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

/** Competencias especiales - V Torneo Anual Terralta 2026 */
export const competenciasEspecialesData: CompetenciaEspecial[] = [
  {
    nombre: 'Hole in One — $1,000,000',
    descripcion: 'Premio de Un Millón de Pesos al primer Hole in One en cualquiera de los 5 hoyos par 3. Si no se logra durante el torneo, el premio será rifado entre los jugadores inscritos el sábado 4 de Julio durante la ceremonia de premiación. Es indispensable estar presente para participar.',
    premios: '$1,000,000 MXN.',
  },
  {
    nombre: 'Torneo de Driver de Distancia (Caballeros)',
    descripcion: 'Sistema de juego: tendrá solo el primer golpe en el Hoyo 1. Días de competencia: viernes 26 de Junio al viernes 3 de Julio. Categorías: Seniors, D, C, B, A, AA.',
    premios: 'Technogym Connected Dumbbells.',
  },
  {
    nombre: 'Torneo de Driver de Precisión (Damas)',
    descripcion: 'Sistema de juego: tendrá solo el primer golpe en el Hoyo 10 de los tres días de competencia. Días: viernes 26, lunes 29 de Junio y miércoles 1 de Julio.',
    premios: '1°: $10,000. 2°: $6,000. 3°: $4,000. (Certificados Back 9).',
  },
  {
    nombre: 'Torneo de Long Driver (Caballeros)',
    descripcion: 'Día de competencia: jueves 2 de Julio (17:00 a 19:30 hrs). Lugar: Terraza Bar "La Vista".',
    premios: '1°: $10,000. 2°: $6,000. 3°: $4,000. (Certificados Back 9).',
  },
  {
    nombre: 'Torneo de Approach Mixto',
    descripcion: 'Calificación: viernes 26 de Junio al jueves 2 de Julio (14:00 a 18:00 hrs) en el Tee de Práctica. Cada jugador tendrá 3 oportunidades por día y calificarán los 7 mejores tiros diarios. Final: viernes 3 de Julio a las 20:30 hrs en Terraza Bar "La Vista". Califican a la final 42 caballeros y 10 damas.',
    premios: 'Se premiará a los 3 mejores lugares. Si hay Hole in One, será el mejor tiro y ganará el primer lugar.',
  },
  {
    nombre: 'Torneo de Putt Caballeros',
    descripcion: 'Calificación: viernes 26, sábado 27, domingo 28 de Junio y jueves 2 de Julio (14:00 a 18:30 hrs). Final: viernes 3 de Julio a las 18:00 hrs. Lugar: Putting Green.',
    premios: '1°: $10,000. 2°: $6,000. 3°: $4,000. (Certificados Back 9).',
  },
  {
    nombre: 'Torneo de Putt Damas',
    descripcion: 'Fecha: lunes 29 de Junio. Horario: 16:00 hrs. Lugar: Putting Green.',
    premios: '1°: $10,000. 2°: $6,000. 3°: $4,000. (Certificados Back 9).',
  },
  {
    nombre: 'Premios de O\'Yes Diarios',
    descripcion: 'Se premiarán los mejores O\'Yes diarios del torneo en los hoyos 3, 5, 7, 12 y 16.',
    premios: 'Premios diarios por hoyo.',
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
 * Source: V Torneo Anual Terralta 2026 PDF (sección 5).
 * Editable from Admin → Convocatoria.
 */
export const serviciosHorariosData: ServicioDia[] = [
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
 * Patrocinadores oficiales del Hole in One y Mejor O'Yes.
 * Source: V Torneo Anual Terralta 2026 PDF.
 * Editable from Admin → Convocatoria.
 */
export const patrocinadoresOficialesData: PatrocinadorOficial[] = [
  {
    premio: 'Hole in One',
    patrocinador: 'Terralta Country Club & Patrocinadores Oficiales',
    descripcion:
      '$1,000,000 MXN al primer Hole in One en cualquiera de los 5 hoyos par 3. En caso de un segundo Hole in One: 1 año de cuotas de mantenimiento (Socio) o membresía anual (Invitado), valor aproximado $226,200 MXN.',
  },
  {
    premio: 'Mejor O\'Yes del Torneo',
    patrocinador: 'Solartec Energía Renovable',
    descripcion:
      'Sistema fotovoltaico de 20 paneles solares — 12,000 watts de potencia. Incluye paneles, inversor, estructura, instalación, material eléctrico y trámite ante CFE. No aplica para Hole in One.',
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
 * Mostrados en /eventos como subsección "Sociales".
 * Source: V Torneo Anual Terralta 2026 PDF.
 */
export const eventosSocialesData: EventoSocial[] = [
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
