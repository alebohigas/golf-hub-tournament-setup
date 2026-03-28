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
}

export interface TournamentInfo {
  id: string;
  name: string;
  club: string;
  logoUrl: string;
  heroImageUrl: string;
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
  { id: 'competencias', label: 'COMPETENCIAS', path: '/competencias', enabled: true, order: 9 },
  { id: 'calendario', label: 'CALENDARIO DE JUEGO', path: '/calendario', enabled: true, order: 10 },
  { id: 'avisos', label: 'AVISOS', path: '/avisos', enabled: true, order: 11 },
  { id: 'premios', label: 'PREMIOS', path: '/premios', enabled: true, order: 12 },
  { id: 'patrocinadores', label: 'PATROCINADORES', path: '/patrocinadores', enabled: true, order: 13 },
  { id: 'reglas', label: 'REGLAS Y CC', path: '/reglas', enabled: true, order: 14 },
];

/** Sponsors fallback - actual data comes from API via useSponsors hook */
export const sponsors: Sponsor[] = [
];

export const tournamentInfo: TournamentInfo = {
  id: '51',
  name: '51° Torneo Anual de Golf',
  club: 'Club Campestre Torreón',
  logoUrl: '',
  heroImageUrl: '',
  startDate: '2025-09-30',
  endDate: '2025-10-04',
  venue: 'Club Campestre Torreón',
  phone: '(52) 871 721 2323',
  email: '',
  city: '',
  state: '',
};

export const categories: Category[] = [
  { id: '1', name: 'CAMPEONATO', handicapMin: -5, handicapMax: 1.8, format: 'STROKE PLAY', ventajas: 'SIN VENTAJAS', maxPlayers: 36, rounds: '54 HOYOS', teeMarker: 'AZULES' },
  { id: '2', name: 'AA', handicapMin: 1.9, handicapMax: 5.3, format: 'STROKE PLAY', ventajas: 'SIN VENTAJAS', maxPlayers: 32, rounds: '54 HOYOS', teeMarker: 'AZULES' },
  { id: '3', name: 'A', handicapMin: 5.4, handicapMax: 9.5, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 40, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '4', name: 'B', handicapMin: 9.6, handicapMax: 13.9, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 36, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '5', name: 'C', handicapMin: 14.0, handicapMax: 18.3, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 36, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '6', name: 'D', handicapMin: 18.4, handicapMax: 22.7, format: 'STABLEFORD', ventajas: 'SIN VENTAJAS', maxPlayers: 32, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '7', name: 'E', handicapMin: 22.8, handicapMax: 32.4, format: 'STABLEFORD', ventajas: 'AL 70%', maxPlayers: 24, rounds: '54 HOYOS', teeMarker: 'BLANCAS' },
  { id: '8', name: 'SENIORS CAMPEONATO', handicapMin: 0.1, handicapMax: 9.4, format: 'STROKE PLAY', ventajas: '80%', maxPlayers: 16, rounds: '54 HOYOS', teeMarker: 'DORADAS' },
  { id: '9', name: 'SENIORS A', handicapMin: 9.5, handicapMax: 18.0, format: 'STABLEFORD', ventajas: '70%', maxPlayers: 20, rounds: '54 HOYOS', teeMarker: 'DORADAS' },
  { id: '10', name: 'SENIORS B', handicapMin: 18.1, handicapMax: 37.9, format: 'STABLEFORD', ventajas: 'AL 70%', maxPlayers: 20, rounds: '54 HOYOS', teeMarker: 'DORADAS' },
  { id: '11', name: 'SUPER SENIORS 70 Y MÁS', handicapMin: 3.5, handicapMax: 33, format: 'STABLEFORD', ventajas: 'AL 70%', maxPlayers: 20, rounds: '54 HOYOS', teeMarker: 'AMARILLAS' },
  { id: '12', name: 'DAMAS 1ra. 2da.', handicapMin: 3.5, handicapMax: 33, format: 'STABLEFORD', ventajas: 'AL 80%', maxPlayers: 32, rounds: '54 HOYOS', teeMarker: 'ROJAS' },
];

export const tournamentStats: TournamentStats = {
  totalHistoricalPlayers: 344,
  yearsHistory: 51,
  yearsHistoryDisplay: '50+',
  maxCategories: 12,
};

/** Eligibility requirements from convocatoria */
export const eligibilityText = "Podrán participar damas y caballeros amateurs mayores de 18 años que tengan hándicap registrado en la FMG o en el sistema interno del club, publicado al 1° de abril de 2026. En categoría \"Campeonato y Premier\" se permitirá jugar a menores de 18 años, que cuenten con el hándicap solicitado. Al jugador que no tenga hándicap registrado, los profesionales le podrán calcular uno siempre y cuando tengan un mínimo de 8 scores entregados.";

/** Important notes for eligibility section */
export const notesText = [
  "La fecha límite de inscripción será el domingo 19 de abril o al completar el cupo límite de cada categoría.",
  "La fecha límite para recibir cancelaciones será el martes 21 de abril y en su caso les será reembolsado el pago de las inscripciones. Después de esta fecha no se aceptan cancelaciones.",
  "Los jugadores que soliciten participar en una categoría que no les corresponda con su hándicap, tendrán que esperar hasta 2 días antes del inicio de juego de la categoría solicitada, para asegurar que no quede fuera otro jugador que sí cumpla con el hándicap requerido.",
  "Si una categoría alcanza el número máximo de jugadores se cerrará y los jugadores que se queden fuera entrarán en una lista de espera.",
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

/** Schedule data from convocatoria PDF - Valle Alto */
export const scheduleData: ScheduleSlot[] = [
  {
    turno: 'MATUTINO',
    horario: 'A PARTIR DE 06:10 HRS',
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: ['Campeonato', 'Premier', 'AA'],
    sabado: ['A'],
  },
  {
    turno: 'VESPERTINO',
    horario: 'A PARTIR DE 11:00 HRS',
    martes: [],
    miercoles: [],
    jueves: [],
    viernes: [],
    sabado: [],
  },
];

/** Salidas description */
export const salidasText = "Las salidas del turno matutino serán a partir de las 06:10hrs. Las salidas del turno vespertino serán a partir de las 11:00hrs.";

/** Handicap rules */
export const handicapText = "Los jugadores deberán tener hándicap registrado en la FMG o en el sistema interno del club, publicado al 1° de abril de 2026. Al jugador que no tenga hándicap registrado, los profesionales le podrán calcular uno siempre y cuando tengan un mínimo de 8 scores entregados.";

/** Desempates rules from PDF */
export const desempatesText = "Primer término: ganará el jugador con mejor score del último día. Segundo término: se tomará la tarjeta del último día para desempatar por el sistema de comparación de tarjetas (9-6-3-1), de la vuelta del hoyo 10 al 18. En caso de persistir el empate, se hará lo mismo para la 1ª vuelta. Para trofeos: Solo para el primer lugar en todas las categorías Gross o Neto se jugará a muerte súbita sin ventajas. El resto de los empates se definirá en primer término por el mejor score del último día. En segundo término será por comparación de tarjetas, comparando las tarjetas del último día del hoyo 10 al 18 bajo el sistema antes mencionado.";

/** Premios description */
export const premiosText = "Trofeos para primero, segundo y tercer lugar en cada categoría según se detalla.";

/** Eventos adicionales */
export const eventosAdicionalesText = "Tiro Espectacular de Approach, Torneo de Putt, Putt de 35yds, Torneo Driver Damas, Torneo Driver Caballeros.";

/** Inscripciones text from PDF */
export const inscripcionesText = "Asociados a partir del miércoles 01 de abril. Hijos de socios dependientes a partir del miércoles 15 de abril. Invitados e Hijos no dependientes a partir del domingo 19 de abril.";

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

/** Pricing tables - Valle Alto (simple structure from PDF) */
export const sociosPricing: PricingTable[] = [
  {
    title: 'Costos de Inscripción',
    subtitle: 'Solamente para jugadores que quieran participar en el Torneo',
    tiers: [
      { categoria: 'Socios Titulares', costo: '$6,000', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Eméritos', costo: '$5,000', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Damas', costo: '$5,000', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Dependientes', costo: '$5,000', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Invitados Caballeros', costo: '$18,500', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Invitados Damas y Juveniles', costo: '$10,500', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
    ],
  },
];

/** Foráneos pricing interface */
export interface ForaneosPricing {
  title: string;
  caballeros: string;
  damasSeniors: string;
}

/** Foráneos pricing - not applicable for Valle Alto, empty */
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

/** Contact/banking info */
export const contactInfo: ContactInfo = {
  bankName: '',
  clabe: '',
  cuenta: '',
  nombre: 'Club de Golf Valle Alto',
  email: '',
  telefono: '',
  telefonoDirecto: '',
};

/** Contact warning */
export const contactWarning = "";

/** Día de práctica - not specified in Valle Alto PDF */
export const diaDePracticaText = "";

/** Información general disclaimer */
export const informacionGeneralText = "El comité Organizador se reserva el derecho de hacer cualquier cambio que juzgue necesario para el mejor desarrollo del torneo y cualquier punto no previsto en la presente convocatoria o que no esté redactado con claridad, será resuelto por el Comité Organizador y su decisión será inapelable.";

/** Convocatoria section configuration */
export interface ConvocatoriaSection {
  id: string;
  label: string;
  enabled: boolean;
  order: number;
}

/** Default 8 sections for convocatoria page */
export const convocatoriaSections: ConvocatoriaSection[] = [
  { id: 'descripcion', label: 'Descripción', enabled: true, order: 1 },
  { id: 'elegibilidad', label: 'Elegibilidad', enabled: true, order: 2 },
  { id: 'costos', label: 'Costos', enabled: true, order: 3 },
  { id: 'categorias', label: 'Categorías y Sistema de Juego', enabled: true, order: 4 },
  { id: 'premiacion', label: 'Premiación', enabled: true, order: 5 },
  { id: 'calendario', label: 'Calendario y Horario', enabled: true, order: 6 },
  { id: 'reglas', label: 'Reglas Locales', enabled: true, order: 7 },
  { id: 'competencias', label: 'Competencias Especiales', enabled: true, order: 8 },
];

/** Description text shown below tournament header - from PDF page 2 */
export const convocatoriaDescripcion = "Se convoca a todos los Asociados del club de golf Valle Alto e invitados, a participar en su LXX Torneo Anual de Invitación, que se llevará a cabo del 24 de abril al 02 de mayo 2026 en las instalaciones de nuestro club.";

/** Premiación data - structured prize descriptions */
export interface PremioCategoria {
  categoria: string;
  premios: string[];
}

/** Premiación data from PDF page 5 - Trofeos */
export const premiacionData: PremioCategoria[] = [
  {
    categoria: 'Damas A',
    premios: ['1° y 2° Gross - Trofeo', '1°, 2° y 3° Neto - Trofeo'],
  },
  {
    categoria: 'Damas B',
    premios: ['1°, 2° y 3° Gross - Trofeo', '1°, 2° y 3° Neto - Trofeo'],
  },
  {
    categoria: 'Damas C',
    premios: ['1°, 2° y 3° - Trofeo'],
  },
  {
    categoria: 'Damas D',
    premios: ['1°, 2° y 3° - Trofeo'],
  },
  {
    categoria: 'Damas E',
    premios: ['1°, 2° y 3° - Trofeo'],
  },
  {
    categoria: 'Damas Estelares',
    premios: ['1°, 2° y 3° - Trofeo'],
  },
  {
    categoria: 'Caballeros (todas las categorías)',
    premios: ['1°, 2° y 3° - Trofeo'],
  },
  {
    categoria: 'Seniors Campeonato Mayores',
    premios: ['1° y 2° Gross - Trofeo', '1° y 2° Neto - Trofeo'],
  },
  {
    categoria: 'Seniors A',
    premios: ['1°, 2° y 3° - Trofeo'],
  },
  {
    categoria: 'Seniors B',
    premios: ['1°, 2° y 3° - Trofeo'],
  },
];

/** Reglas locales - structured rules */
export interface ReglaItem {
  titulo: string;
  contenido: string;
}

/** Reglas locales from PDF page 5 */
export const reglasData: ReglaItem[] = [
  { titulo: 'Reglas de Juego', contenido: 'Se jugará bajo las reglas de la USGA adoptadas por la Federación Mexicana de Golf, así como las reglas locales y términos de la competencia que se publicarán para el torneo. Las controversias que se originen sobre cualquier punto relacionado con la aplicación de las reglas serán resueltas por el Oficial de Reglas y/o el Comité organizador y su fallo será definitivo e inapelable. Las rondas de juego estipuladas para este torneo son de 9 hoyos.' },
  { titulo: 'Desempates para Corte', contenido: desempatesText },
  { titulo: 'Nota Importante', contenido: 'Jugador que no pasó el corte oficialmente una vez publicadas las listas de resultados no podrá participar en la ronda final por ningún motivo. En el caso de jugadores participando en dos categorías si pasan el corte en ambas categorías el jugador deberá dar aviso al final aclarando cual de las dos categorías quiere jugar para la ronda final.' },
  { titulo: 'Información General', contenido: informacionGeneralText },
];

/** Competencias especiales data */
export interface CompetenciaEspecial {
  nombre: string;
  descripcion: string;
  premios?: string;
}

/** Competencias especiales from PDF pages 7-10 */
export const competenciasEspecialesData: CompetenciaEspecial[] = [
  {
    nombre: 'Tiro Espectacular de Approach',
    descripcion: 'Podrán participar únicamente jugadores inscritos al torneo. Cada participante tendrá derecho a realizar dos tiros en los días de calificación. Pasarán a la final los mejores 10 resultados diarios. Calificación: sábado 25, domingo 26, lunes 27 y martes 28 de abril en el área del par 3, de 11:00 a 17:00hrs. Final: miércoles 29 de abril a las 18:30hrs en el Green del Hoyo 15.',
    premios: '1er Lugar: Auto 2026 (solo se entregará un auto). 2do Lugar: Bolsa de Golf.',
  },
  {
    nombre: 'Torneo de Putt',
    descripcion: 'Podrán participar únicamente jugadores inscritos al torneo. Cada participante tendrá derecho a realizar 2 tiros en los días de calificación (cada jugador solo podrá participar 1 vez en el día). Calificaciones diarias del sábado 25 al miércoles 29 de abril de 11:00 a 17:00hrs en el putting green. Pasarán a la final los mejores 64 caballeros y las mejores 32 damas. Final: viernes 1 de mayo (18:00hrs damas, 19:30hrs caballeros).',
    premios: '1er Lugar Damas: $10,000 en Vales. 1er Lugar Caballeros: $10,000 en Vales. 2do Lugar: $7,000 en Vales. 3er Lugar: $5,000 en Vales.',
  },
  {
    nombre: 'Putt Espectacular de 35 Yardas',
    descripcion: 'Participarán las 4 finalistas del Torneo de Putt damas y los 8 finalistas del torneo de Putt caballeros. Se jugará el viernes 1 de mayo durante el torneo de Putt. 1 Putt de 35 yardas en el Putting Green de la Terraza. Se sortea el turno de participación.',
    premios: 'Primer jugador que emboque: 25,000 USD. Segundo jugador que emboque o mejor O\'yes: Bolsa de Golf.',
  },
  {
    nombre: 'Torneo Driver Damas',
    descripcion: 'Driver de distancia: se premiará al driver más largo dentro del fairway del hoyo 4 entre categorías A, B, C, D y E. Driver de precisión: se premiará al driver más cerca de la línea marcada entre categorías A, B, C, D, E y Estelares. Una jugadora no podrá ganar ambos premios. Día de juego: lunes 27 de abril. Lugar: Hoyo 4.',
    premios: '1er lugar de precisión: 300 dlls. 1er lugar de distancia: 300 dlls.',
  },
  {
    nombre: 'Torneo Driver Caballeros',
    descripcion: 'Podrán participar todos los jugadores inscritos con un mínimo de distancia de 280 yardas. Inscripciones el día del evento en la mesa de salida del hoyo 16. Cada jugador tendrá derecho a realizar dos tiros. Día de competencia: jueves 30 de abril a las 18:30hrs en la tee del hoyo 16.',
    premios: '1er lugar: 400 Dlls. 2do lugar: 300 Dlls.',
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
