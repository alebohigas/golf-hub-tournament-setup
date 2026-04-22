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
  id: '51',
  name: 'V Torneo Anual Terralta 2026',
  club: 'Terralta Country Club',
  logoUrl: '',
  heroImageUrl: '',
  logoHeaderUrl: '',
  startDate: '2026-06-26',
  endDate: '2026-07-04',
  venue: 'Terralta Country Club',
  phone: '81 8093 1078',
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
  "Podrán participar Damas y Caballeros mayores de 18 años con estatus de amateur que tengan hándicap GHIN vigente registrado en la FMG, publicado al 15 de mayo del 2026 (el más bajo si pertenece a dos o más clubes). En las categorías Campeonato y Premier se permitirá participar a jugadores de 14 años en adelante con 0.0 de H.I., debiendo contar con registros en torneos juveniles con scores debajo de 85 golpes. En las dos categorías Seniors los jugadores deberán tener 50 años y los Super Seniors 65 años (cumplidos al 15 de mayo del 2026). En la 1ª categoría de Damas se permitirá participar a jugadoras de 14 años en adelante con +5.0 a 14.8 de H.I.";

/** Important notes for eligibility section */
export const notesText: string[] = [
  "Inicio de inscripciones — Socios: 16 de Abril de 2026. Invitados: 1 de Mayo de 2026. Cierre de inscripciones: 22 de Junio de 2026.",
  "Handicap: se jugará con el handicap federado del día 15 de mayo de 2026.",
  "Habrá corte en todas las categorías de Caballeros después de la 2ª ronda. En las 5 categorías de Damas no habrá corte.",
  "Si una categoría alcanza el número máximo de jugadores, se cerrará y los jugadores fuera entrarán en lista de espera.",
  "Durante el desarrollo del Torneo Anual queda restringido el acceso a menores de edad a la Casa Club, eventos sociales y premiación. Solo se autoriza el acceso a menores que jueguen en categoría Premier de caballeros y 1ª categoría de damas.",
  "El comité organizador se reserva el derecho de aceptar a cualquier jugador o sembrarlo en otra categoría. Jugador sin GHIN deberá firmar carta de aceptación.",
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
export const premiosText = "Premio Hole in One: $1,000,000 al primer Hole in One en cualquiera de los 5 hoyos par 3. Si no se logra durante el torneo, será rifado entre los jugadores inscritos durante la ceremonia de premiación del 4 de Julio (es indispensable estar presente para participar).";

/** Eventos adicionales */
export const eventosAdicionalesText = "Torneo de Putt Damas y Caballeros, Torneo de Approach Mixto, Torneo de Driver de Precisión Damas, Torneo de Driver de Distancia Caballeros, Torneo de Long Driver Caballeros, Premios de O'Yes.";

/** Inscripciones text */
export const inscripcionesText = "Inscripciones en https://terralta.speitour.com (información del torneo, salidas, programa de juego y resultados). Reservaciones e informes: 81 8093 1078.";

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

/** Pricing - V Torneo Anual Terralta 2026 */
export const sociosPricing: PricingTable[] = [
  {
    title: 'Costos de Inscripción — Socios',
    tiers: [
      { categoria: 'Caballeros Socios (incluye cónyuge en centros de consumo)', costo: '$14,500.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Damas Socias e hijas', costo: '$8,000.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Damas Socias (cónyuge juega — 50% aplicado)', costo: '$4,000.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Caballeros Hijos', costo: '$11,200.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Damas Hijas', costo: '$5,800.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Socios — Menores de 18 años', costo: '$4,000.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
    ],
  },
  {
    title: 'Costos de Inscripción — Invitados',
    tiers: [
      { categoria: 'Caballeros Invitados (incluye cónyuge en centros de consumo)', costo: '$17,500.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Damas Invitadas', costo: '$9,000.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Damas Invitadas (cónyuge juega — 50% aplicado)', costo: '$4,500.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Invitados — Menores de 18 años', costo: '$6,000.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
    ],
  },
  {
    title: 'Centros de Consumo (No Jugadores)',
    tiers: [
      { categoria: 'Acceso por día', costo: '$2,000.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
      { categoria: 'Acceso toda la semana', costo: '$8,000.00', mayo6: '', junio5: '', julio4: '', agosto3: '', sept2: '' },
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
export const pricingNote = "Cargos de inscripción para Socios: si se inscriben en Abril el cargo se realiza en 3 meses (Abril, Mayo y Junio); en Mayo en 2 meses (Mayo y Junio); en Junio en 1 solo mes. Invitados pagan en una sola exhibición. La inscripción no es transferible — no se aceptan cancelaciones posteriores al 25 de Mayo.";

/** Contact/banking info - Gómez Palacio */
export const contactInfo: ContactInfo = {
  bankName: 'Bancrea',
  clabe: '152580120000725303',
  cuenta: '12000072530',
  nombre: 'Terralta A.C.',
  email: '',
  telefono: '81 8093 1078',
  telefonoDirecto: '81 8093 1078',
};

/** Contact warning */
export const contactWarning = "Será indispensable el registro diario en la recepción del Club para contar con el brazalete que da acceso al servicio de alimentos y bebidas (uso obligatorio en la muñeca durante todo el torneo).";

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

/** Description text - V Torneo Anual Terralta 2026 */
export const convocatoriaDescripcion =
  "Terralta A.C. celebra su V Torneo Anual de invitación edición 2026, el cual se llevará a cabo del 26 de Junio al 4 de Julio de 2026.\n\n" +
  "La inscripción al Torneo Anual incluye: Kit de bienvenida, Torneo de Putt Damas y Caballeros, Torneo de Approach Mixto, Torneo de Driver de Precisión Damas, Torneo de Driver de Distancia Caballeros, Torneo de Long Driver Caballeros, Premios de O'Yes y alimentos y bebidas en los centros de consumo (jugador y cónyuge).\n\n" +
  "Premio Hole in One: $1,000,000 al primer Hole in One en cualquiera de los 5 hoyos par 3. Si no se realiza ningún Hole in One durante el torneo, el premio será rifado entre los jugadores inscritos el día 4 de Julio durante la ceremonia de premiación (es indispensable estar presente para participar). En caso de un segundo o más Hole in One, el Socio ganador recibirá un año de cuotas de mantenimiento sin costo; si no es socio, recibirá una membresía anual con cuota de mantenimiento incluida.";

/** Premiación data - structured prize descriptions */
export interface PremioCategoria {
  categoria: string;
  premios: string[];
}

/** Premiación data - V Torneo Anual Terralta 2026 */
export const premiacionData: PremioCategoria[] = [
  {
    categoria: 'Hole in One',
    premios: [
      '$1,000,000 al primer Hole in One en cualquiera de los 5 hoyos par 3',
      'Si no se logra durante el torneo, será rifado entre los jugadores inscritos (4 de Julio en la ceremonia de premiación)',
      'Segundo o más Hole in One — Socio: 1 año de cuotas de mantenimiento sin costo (≈ $226,200)',
      'Segundo o más Hole in One — Invitado: Membresía anual con cuota de mantenimiento incluida (≈ $226,200, no transferible)',
    ],
  },
  {
    categoria: 'Mejor O\'Yes del Torneo',
    premios: [
      'Sistema fotovoltaico de 20 paneles solares — 12,000 watts de potencia',
      'Incluye paneles, inversor, estructura, instalación, material eléctrico y trámite ante CFE',
      'No aplica para Hole in One',
    ],
  },
  {
    categoria: 'Premios de O\'Yes Diarios',
    premios: ['Se premiarán los mejores O\'Yes diarios del torneo en los hoyos 3, 5, 7, 12 y 16'],
  },
  {
    categoria: 'Torneo de Long Driver Caballeros',
    premios: ['1er Lugar: $10,000', '2do Lugar: $6,000', '3er Lugar: $4,000', '(Certificados de regalo Back 9)'],
  },
  {
    categoria: 'Torneo de Driver de Precisión Damas',
    premios: ['1er Lugar: $10,000', '2do Lugar: $6,000', '3er Lugar: $4,000', '(Certificados de regalo Back 9)'],
  },
  {
    categoria: 'Torneo de Driver de Distancia Caballeros',
    premios: ['Premio: Technogym Connected Dumbbells'],
  },
  {
    categoria: 'Torneo de Putt Caballeros',
    premios: ['1er Lugar: $10,000', '2do Lugar: $6,000', '3er Lugar: $4,000', '(Certificados de regalo Back 9)'],
  },
  {
    categoria: 'Torneo de Putt Damas',
    premios: ['1er Lugar: $10,000', '2do Lugar: $6,000', '3er Lugar: $4,000', '(Certificados de regalo Back 9)'],
  },
];

/** Reglas locales - structured rules */
export interface ReglaItem {
  titulo: string;
  contenido: string;
}

/** Reglas y notas — V Torneo Anual Terralta 2026 */
export const reglasData: ReglaItem[] = [
  {
    titulo: 'Brazalete y Acceso',
    contenido:
      'Será indispensable el registro diario en la recepción del Club para contar con el brazalete que da acceso al servicio de alimentos y bebidas. Deberá portarse sin excepción en la muñeca durante todo el torneo.',
  },
  {
    titulo: 'Cancelaciones',
    contenido:
      'No se aceptan bonificaciones por cancelación posterior al 25 de Mayo. La cancelación debe realizarse a través de https://terralta.speitour.com sin excepción. La inscripción no es transferible. Posterior a la fecha de cancelación no habrá bonificación, incluso por causa mayor, médica, personal o laboral.',
  },
  {
    titulo: 'Corte (Caballeros)',
    contenido:
      'Habrá corte en todas las categorías después de la 2ª ronda. Si por causas climatológicas no se logran jugar dos rondas de 18 hoyos, el comité organizador decidirá a cuántos hoyos se hará el corte. En las 5 categorías de Damas no habrá corte.',
  },
  {
    titulo: 'Cupo de Categoría',
    contenido:
      'Si una categoría alcanza el número máximo de jugadores se cerrará y los jugadores que se queden fuera entrarán en lista de espera. Si hay alguna cancelación o espacio se llamará al jugador para que se inscriba.',
  },
  {
    titulo: 'Desempate por el Primer Lugar',
    contenido:
      '1) Se jugará en el campo, iniciando en el hoyo que designe el Comité.\n2) Si hay triple empate o más: el desempate por 1er lugar será por juego en el campo (solo un ganador absoluto). El desempate por 2°, 3° y demás se realiza por comparación de tarjetas.\n3) Si no hay luz natural o el clima impide jugar, el desempate por 1er lugar se decide por comparación de tarjetas.\n4) Si la competencia es Gross y Neto, solo el trofeo Gross procede a desempate por juego en el campo. El 1° Neto se define por comparación de tarjetas.',
  },
  {
    titulo: 'Desempate por 2° Lugar y Demás Posiciones (Trofeo y Corte)',
    contenido:
      'Aplicando la Regla 5A (Método de comparación de tarjetas):\n1) Mejor ronda del último día.\n2) Si persiste: mejor score hoyos 10–18 → 13–18 → 16–18 → hoyo 18 → mismo procedimiento en la vuelta 1–9 → hoyo por hoyo del 18 al 1.\n3) Si la ronda oficial es de 9 hoyos, se aplica el mismo método sobre esos 9 hoyos.\nNota: en categorías con hándicap los desempates Neto se definen con score Neto, los Gross con score Gross. Se utiliza la misma modalidad de juego (Stroke Play o Stableford).',
  },
  {
    titulo: 'Notas para Categorías',
    contenido:
      '• Se declarará desierta una categoría si tiene menos de 9 participantes; la fecha límite para definir esto será el jueves 25 de junio 2026.\n• El Comité Organizador podrá fusionar la categoría con otra o declararla desierta si no hay mínimo de jugadores.\n• La ronda estipulada será de 9 hoyos cuando aplique.\n• Ningún jugador podrá solicitar cambio de horario o día de juego.',
  },
  {
    titulo: 'Notas para Cortes',
    contenido:
      '• El jugador que no pueda asistir a la ronda final por cualquier motivo deberá avisar a la oficina de golf inmediatamente al terminar su 2ª ronda para asignarle su retiro y permitir el ingreso del siguiente jugador en lista.\n• Un jugador que no pasó el corte oficialmente, una vez publicadas las listas, no podrá participar en la ronda final por ningún motivo.\n• Quien no avise, el Comité le asignará la categoría según su hándicap original o, si es mayor de 50, jugará en la categoría senior correspondiente.',
  },
  {
    titulo: 'Restricción a Menores de Edad',
    contenido:
      'Durante el desarrollo del Torneo Anual queda restringido el acceso a menores de edad a la Casa Club, eventos sociales y premiación. Solo está autorizado el acceso a menores que jueguen en categoría Premier de Caballeros y 1ª categoría de Damas.',
  },
];

/** Reglamento local - structured local rules with collapsible sections */
export interface ReglamentoLocalItem {
  titulo: string;
  contenido: string;
}

/** Reglamento local - Semana Santa Chilchota 2026 */
export const reglamentoLocalData: ReglamentoLocalItem[] = [
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
