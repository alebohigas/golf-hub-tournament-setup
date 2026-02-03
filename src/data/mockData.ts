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
  logoUrl: string;
  heroImageUrl: string;
  startDate: string;
  endDate: string;
  venue: string;
  phone: string;
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

export interface TournamentStats {
  totalParticipants: number;
  holes: number;
  categories: number;
  yearsHistory: number;
}

// Menu Configuration - Binary enabled/disabled from DB
export const menuConfig: MenuItem[] = [
  { id: 'home', label: 'HOME', path: '/', enabled: true, order: 1 },
  { id: 'convocatoria', label: 'CONVOCATORIA', path: '/convocatoria', enabled: true, order: 2 },
  { id: 'eventos', label: 'EVENTOS', path: '/eventos', enabled: true, order: 3 },
  { id: 'jugadores', label: 'JUGADORES', path: '/jugadores', enabled: true, order: 4 },
  { id: 'salidas', label: 'SALIDAS', path: '/salidas', enabled: true, order: 5 },
  { id: 'live-scoring', label: 'LIVE-SCORING', path: '/live-scoring', enabled: false, order: 6 },
  { id: 'resultados', label: 'RESULTADOS', path: '/resultados', enabled: true, order: 7 },
  { id: 'competicion', label: 'COMPETICIÓN', path: '/competicion', enabled: true, order: 8 },
  { id: 'calendario', label: 'CALENDARIO DE JUEGO', path: '/calendario', enabled: true, order: 9 },
  { id: 'avisos', label: 'AVISOS', path: '/avisos', enabled: true, order: 10 },
  { id: 'premios', label: 'PREMIOS', path: '/premios', enabled: true, order: 11 },
  { id: 'patrocinadores', label: 'PATROCINADORES', path: '/patrocinadores', enabled: true, order: 12 },
  { id: 'reglas', label: 'REGLAS Y CC', path: '/reglas', enabled: true, order: 13 },
];

export const sponsors: Sponsor[] = [
  { id: '1', name: 'BMW', logoUrl: 'https://www.carlogos.org/car-logos/bmw-logo-2020-grey.png' },
  { id: '2', name: 'Rolex', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/09/Rolex-Logo.png' },
  { id: '3', name: 'Titleist', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/11/Titleist-Logo.png' },
  { id: '4', name: 'Callaway', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/11/Callaway-Logo.png' },
  { id: '5', name: 'TaylorMade', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/11/TaylorMade-Logo.png' },
  { id: '6', name: 'Ping', logoUrl: 'https://logos-world.net/wp-content/uploads/2020/11/Ping-Logo.png' },
];

export const tournamentInfo: TournamentInfo = {
  id: '51',
  name: '51° Torneo Anual de Golf',
  logoUrl: '/tournament-logo.png',
  heroImageUrl: '/hero-golf.jpg',
  startDate: '2025-09-30',
  endDate: '2025-10-04',
  venue: 'Club Campestre Torreón',
  phone: '(52) 871 721 2323',
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
  totalParticipants: 344,
  holes: 18,
  categories: 12,
  yearsHistory: 51,
};

export const eligibilityText = "Ser golfista amateur, mayor de 18 años cumplidos al 1° de octubre de 2025, excepto en la categoría Campeonato donde podrán jugar juveniles de 14 a 17 años.";

export const notesText = [
  "Las Damas se dividirán en 2 categorías, de acuerdo al número de participantes y en base al hándicap índice.",
  "Los campeones del Torneo Anual 2022−2023 jugarán en la categoría inmediata superior.",
  "En la categoría Campeonato sólo podrán participar jugadores invitados por el Club.",
  "Las categorías Seniors serán de 60 años cumplidos a la fecha del Torneo. Súper Seniors será de 70 y mayores.",
  "En la categoría que se inscriban menos de 10 jugadores se declarará desierta; sin embargo, los jugadores afectados pasarán a la categoría inmediata superior, siempre y cuando en esta haya cupo.",
  "El cupo máximo del Torneo será de 344 jugadores.",
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

export const scheduleData: ScheduleSlot[] = [
  {
    turno: 'MATUTINO',
    horario: 'A PARTIR DE 6:40 AM',
    martes: ['Damas 2da.', 'Damas 1ra.', 'Seniors Camp.', 'Seniors A', 'Seniors B', 'Super Seniors'],
    miercoles: ['Damas 1ra.', 'Damas 2da.', 'Seniors Camp.', 'Seniors A', 'Seniors B', 'Super Seniors'],
    jueves: ['E', 'C', 'B', '', '', ''],
    viernes: ['Damas 1ra.', 'Damas 2da.', 'Seniors Camp.', 'Seniors A', 'Seniors B', 'Super Seniors'],
    sabado: ['D', 'C', 'B', '', '', ''],
  },
  {
    turno: 'VESPERTINO',
    horario: 'A PARTIR DE 11:30 AM',
    martes: ['E', 'D', 'C'],
    miercoles: ['E', 'D', 'B'],
    jueves: ['A', 'AA', 'CAMPEONATO'],
    viernes: ['A', 'AA', 'CAMPEONATO'],
    sabado: ['A', 'AA', 'CAMPEONATO'],
  },
];

export const salidasText = "Por horario en el turno correspondiente.";

export const handicapText = "La competencia se jugará con los hándicaps del 1 de septiembre de 2025, de la Federación Mexicana de Golf como primer referente. Como segunda opción, será una carta de su Club. El Comité se reserva el derecho de aceptar la validez del hándicap. Jugadores que no comprueben debidamente su handicap no podrán pelear por los trofeos de los primeros lugares.";

export const desempatesText = "Para el primer lugar de todas las categorías será \"muerte súbita\" en los hoyos asignados por el Comité. Las categorías Damas, Seniors y E que juegan con hándicap, las ventajas serán en los hoyos correspondientes. Para las demás posiciones el desempate será determinado por comparación de tarjetas.";

export const premiosText = "Trofeo al primero, segundo y tercer lugar de cada categoría. En la categoría Seniors Campeonato y 1ra. Damas habrá 1er. Lugar Gross por stroke play y stableford, respectivamente. Copa Challenger en la categoría Campeonato. El jugador que la gane 3 veces la tendrá definitivamente.";

export const eventosAdicionalesText = "Torneo de Putt, Torneo de Aproach, Torneo de Drive, Shootout y rifas.";

export const inscripcionesText = "En Coordinación Deportiva a partir del 1 de mayo de 2025. Cierre de inscripciones el 24 de septiembre de 2025 a las 2 pm o al completarse el cupo de jugadores por categoría.";

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

export const sociosPricing: PricingTable[] = [
  {
    title: 'Socios que jugaron anual 2024 y 2023',
    tiers: [
      { categoria: 'CABALLEROS', costo: '$13,500.00', mayo6: '$2,250.00', junio5: '$2,700.00', julio4: '$3,375.00', agosto3: '$4,500.00', sept2: '$6,750.00' },
      { categoria: 'DAMAS/SENIORS', costo: '$12,500.00', mayo6: '$2,083.33', junio5: '$2,500.00', julio4: '$3,125.00', agosto3: '$4,166.66', sept2: '$6,250.00' },
    ],
  },
  {
    title: 'Socios que jugaron anual 2024 o 2023',
    tiers: [
      { categoria: 'CABALLEROS', costo: '$14,500.00', mayo6: '$2,416.66', junio5: '$2,900.00', julio4: '$3,625.00', agosto3: '$4,833.33', sept2: '$7,250.00' },
      { categoria: 'DAMAS/SENIORS', costo: '$13,500.00', mayo6: '$2,250.00', junio5: '$2,700.00', julio4: '$3,375.00', agosto3: '$4,500.00', sept2: '$6,750.00' },
    ],
  },
  {
    title: 'Socios que no jugaron anual 2024 y 2023',
    tiers: [
      { categoria: 'CABALLEROS', costo: '$16,500.00', mayo6: '$2,833.33', junio5: '$3,400.00', julio4: '$4,250.00', agosto3: '$5,666.66', sept2: '$8,500.00' },
      { categoria: 'DAMAS/SENIORS', costo: '$15,500.00', mayo6: '$2,666.66', junio5: '$3,200.00', julio4: '$4,000.00', agosto3: '$5,333.33', sept2: '$8,000.00' },
    ],
  },
];

export interface ForaneosPricing {
  title: string;
  caballeros: string;
  damasSeniors: string;
}

export const foraneosPricing: ForaneosPricing[] = [
  { title: 'Jugaron 2023 y 2024', caballeros: '$14,500.00', damasSeniors: '$13,500.00' },
  { title: 'Jugaron 2023 o 2024', caballeros: '$15,500.00', damasSeniors: '$14,500.00' },
  { title: 'No jugaron 2022 ni 2023', caballeros: '$17,000.00', damasSeniors: '$16,000.00' },
];

export const pricingNote = "Estas cantidades se podrán pagar en 6, 5, 4, 3 ó 2 mensualidades, dejando forzosamente un pago inicial y los documentos correspondientes a los pagos futuros.";

export interface ContactInfo {
  bankName: string;
  clabe: string;
  cuenta: string;
  nombre: string;
  email: string;
  telefono: string;
  telefonoDirecto: string;
}

export const contactInfo: ContactInfo = {
  bankName: 'BANREGIO',
  clabe: '058080800000090114',
  cuenta: '800-000-90011',
  nombre: 'CAMPESTRE TORREÓN, S.A. DE C.V.',
  email: 'coordinaciondeportiva@campestretorreon.com.mx',
  telefono: '(871) 7-21-23-23 Ext. 119 y 155',
  telefonoDirecto: '(871) 7-21-05-41',
};

export const contactWarning = "Cheque devuelto o cargo de tarjeta no autorizado por el banco, causará baja automática del jugador al Torneo. A partir del 4 de septiembre por ningún motivo se reembolsará el costo de la inscripción por cancelaciones.";

export const diaDePracticaText = "Los jugadores inscritos no socios tendrán derecho a un día de práctica que son 20, 21, 27 y 28 de septiembre del 2025. El lunes 29 de septiembre será la práctica para jugadores foráneos y Campeonato, de clubes fuera de la Laguna.";

export const informacionGeneralText = "El Comité Organizador se reserva el derecho de hacer los cambios que juzgue necesarios para el mejor desarrollo del Torneo. Cualquier punto no considerado en la presente convocatoria será resuelto por el Comité de Golf y su decisión será final e inapelable.";

export const convocatoriaSections = [
  { id: 'elegibilidad', label: 'Elegibilidad' },
  { id: 'categorias', label: 'Categorías' },
  { id: 'horarios', label: 'Horarios' },
  { id: 'info-importante', label: 'Información Importante' },
  { id: 'costos', label: 'Costos' },
  { id: 'contacto', label: 'Contacto' },
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
