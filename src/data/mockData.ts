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
export const eligibilityText = "";

/** Important notes for eligibility section */
export const notesText: string[] = [];

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
export const premiosText = "Se entregarán trofeos al 1°, 2° y 3° lugar de cada categoría y primer Gross a la Primera categoría. Pantallas, estancias en Mazatlán y muchos premios más en ceremonia de premiación.";

/** Eventos adicionales */
export const eventosAdicionalesText = "Automóvil 2026 Hole in One, Premios O'Yes General, Torneo de Putt, Torneo de Approach.";

/** Inscripciones text */
export const inscripcionesText = "Informes e inscripciones: Oficinas del Club Campestre de Gómez Palacio. Tel: 87 17 14 20 35. WhatsApp: 871 158 8744.";

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

/** Pricing - Semana Santa Chilchota 2026 */
export const sociosPricing: PricingTable[] = [
  {
    title: 'Costo de Inscripción',
    tiers: [
      { categoria: 'Inscripción General', costo: '$3,500.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
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
  nombre: 'Club Campestre de Gómez Palacio',
  email: '',
  telefono: '87 17 14 20 35',
  telefonoDirecto: '871 158 8744',
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
  { id: 'calendario', label: 'Calendario y Horario', enabled: false, order: 6 },
  { id: 'reglas', label: 'Reglas Locales', enabled: false, order: 7 },
  { id: 'competencias', label: 'Competencias Especiales', enabled: true, order: 8 },
];

/** Description text - Semana Santa Chilchota 2026 */
export const convocatoriaDescripcion = "Se convoca a todos los socios e invitados a participar en el Torneo Anual de Golf Semana Santa Chilchota 2026, que se llevará a cabo los días 1, 2, 3 y 4 de abril de 2026 en las instalaciones del Club Campestre de Gómez Palacio.";

/** Premiación data - structured prize descriptions */
export interface PremioCategoria {
  categoria: string;
  premios: string[];
}

/** Premiación data - Semana Santa Chilchota 2026 */
export const premiacionData: PremioCategoria[] = [
  {
    categoria: 'Todas las Categorías',
    premios: ['1°, 2° y 3° Lugar - Trofeo', 'Primer Gross a la Primera Categoría - Trofeo'],
  },
  {
    categoria: 'Premios Adicionales',
    premios: ['Pantallas, estancias en Mazatlán y muchos premios más en ceremonia de premiación'],
  },
];

/** Reglas locales - structured rules */
export interface ReglaItem {
  titulo: string;
  contenido: string;
}

/** Reglas locales - Semana Santa (no detailed rules in flyer) */
export const reglasData: ReglaItem[] = [];

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
