/**
 * properName.ts
 * ---------------------------------------------------------------------------
 * Normalización de NOMBRE PROPIO para el formulario de Pre-Registro.
 *
 * Objetivo: si el jugador captura su nombre/apellido TODO EN MAYÚSCULAS o
 * todo en minúsculas, guardarlo con Nombre Propio (Title Case en español) y
 * con la ortografía correcta (acentos) cuando el nombre/apellido es conocido.
 *   Ej: "LOPEZ" -> "López",  "juan carlos" -> "Juan Carlos",  "de la o" -> "de la O"
 *
 * Si el texto ya viene con mayúsculas/minúsculas mezcladas (ej. "McDonald",
 * "LaTorre"), se respeta tal cual: asumimos que el usuario lo escribió a
 * propósito.
 */

/** Partículas que en español van en minúscula cuando no inician el texto. */
const PARTICULAS = new Set([
  'de', 'del', 'la', 'las', 'los', 'y', 'e', 'da', 'das', 'do', 'dos',
  'van', 'von', 'di', 'della', 'du', 'san', 'santa',
]);

/**
 * Diccionario de ortografía: forma sin acentos (minúsculas) -> forma correcta.
 * Cubre los nombres y apellidos acentuados más frecuentes en México.
 */
const ORTOGRAFIA: Record<string, string> = {
  // Apellidos
  lopez: 'López', gomez: 'Gómez', gonzalez: 'González', hernandez: 'Hernández',
  rodriguez: 'Rodríguez', martinez: 'Martínez', perez: 'Pérez', sanchez: 'Sánchez',
  ramirez: 'Ramírez', jimenez: 'Jiménez', gutierrez: 'Gutiérrez', diaz: 'Díaz',
  fernandez: 'Fernández', alvarez: 'Álvarez', vazquez: 'Vázquez', velazquez: 'Velázquez',
  chavez: 'Chávez', juarez: 'Juárez', suarez: 'Suárez', benitez: 'Benítez',
  dominguez: 'Domínguez', enriquez: 'Enríquez', estevez: 'Estévez', galvez: 'Gálvez',
  marquez: 'Márquez', mendez: 'Méndez', muniz: 'Muñiz', narvaez: 'Narváez',
  nunez: 'Núñez', ordonez: 'Ordóñez', pena: 'Peña', quinones: 'Quiñones',
  quintanilla: 'Quintanilla', tellez: 'Téllez', valdez: 'Valdez', vasquez: 'Vásquez',
  yanez: 'Yáñez', zuniga: 'Zúñiga', ibanez: 'Ibáñez', banuelos: 'Bañuelos',
  camacho: 'Camacho', cardenas: 'Cárdenas', cortes: 'Cortés', cuellar: 'Cuéllar',
  davila: 'Dávila', garcia: 'García', gandara: 'Gándara', gaona: 'Gaona',
  guzman: 'Guzmán', leon: 'León', luevano: 'Luévano', macias: 'Macías',
  medrano: 'Medrano', montano: 'Montaño', munoz: 'Muñoz', ochoa: 'Ochoa',
  osorio: 'Osorio', paez: 'Páez', pina: 'Piña', ramos: 'Ramos',
  rios: 'Ríos', rubalcava: 'Rubalcava', salcido: 'Salcido', solis: 'Solís',
  tovar: 'Tovar', trevino: 'Treviño', urena: 'Ureña', villasenor: 'Villaseñor',
  zamarripa: 'Zamarripa', anaya: 'Anaya', angulo: 'Angulo', aviles: 'Avilés',
  bermudez: 'Bermúdez', bonilla: 'Bonilla', cabanas: 'Cabañas', calderon: 'Calderón',
  ceballos: 'Ceballos', concepcion: 'Concepción', corona: 'Corona', escobedo: 'Escobedo',
  esparza: 'Esparza', felix: 'Félix', garza: 'Garza', godinez: 'Godínez',
  guajardo: 'Guajardo', hurtado: 'Hurtado', inzunza: 'Inzunza', lara: 'Lara',
  limon: 'Limón', llamas: 'Llamas', maldonado: 'Maldonado', melendez: 'Meléndez',
  monarrez: 'Monárrez', mondragon: 'Mondragón', obregon: 'Obregón', orozco: 'Orozco',
  pacheco: 'Pacheco', patino: 'Patiño', peralta: 'Peralta', rendon: 'Rendón',
  robledo: 'Robledo', saenz: 'Sáenz', salazar: 'Salazar', tapia: 'Tapia',
  tijerina: 'Tijerina', valdes: 'Valdés', vallejo: 'Vallejo', villanueva: 'Villanueva',
  // Nombres
  jose: 'José', maria: 'María', jesus: 'Jesús', ramon: 'Ramón', andres: 'Andrés',
  agustin: 'Agustín', angel: 'Ángel', angela: 'Ángela', adrian: 'Adrián',
  ines: 'Inés', joaquin: 'Joaquín', martin: 'Martín', nicolas: 'Nicolás',
  ruben: 'Rubén', sebastian: 'Sebastián', simon: 'Simón', tomas: 'Tomás',
  victor: 'Víctor', hector: 'Héctor', cesar: 'César', oscar: 'Óscar',
  omar: 'Omar', raul: 'Raúl', rocio: 'Rocío', concepcionn: 'Concepción',
  monica: 'Mónica', veronica: 'Verónica', anibal: 'Aníbal', asuncion: 'Asunción',
  beatriz: 'Beatriz', cristobal: 'Cristóbal', damian: 'Damián', dario: 'Darío',
  efrain: 'Efraín', eloisa: 'Eloísa', emilia: 'Emilia', estefania: 'Estefanía',
  fabian: 'Fabián', fatima: 'Fátima', german: 'Germán', gaston: 'Gastón',
  hilario: 'Hilario', jasmin: 'Jazmín', julian: 'Julián', leon2: 'León',
  lucia: 'Lucía', magdalena: 'Magdalena', marian: 'Marián', maximo: 'Máximo',
  milagros: 'Milagros', natalia: 'Natalia', noemi: 'Noemí', rafael: 'Rafael',
  rosario: 'Rosario', salome: 'Salomé', sofia: 'Sofía', valeria: 'Valeria',
  yolanda: 'Yolanda',
};

/** Quita diacríticos y baja a minúsculas (para buscar en el diccionario). */
const fold = (s: string): string =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** ¿El texto viene TODO MAYÚSCULAS o todo minúsculas? */
const isUniformCase = (s: string): boolean => {
  const letters = s.replace(/[^\p{L}]/gu, '');
  if (!letters) return false;
  return letters === letters.toUpperCase() || letters === letters.toLowerCase();
};

/** Capitaliza una palabra respetando guiones y apóstrofes (ej. "o'neill"). */
const capitalizeWord = (word: string): string =>
  word
    .split(/([-'’])/)
    .map(part =>
      /[-'’]/.test(part) || !part
        ? part
        : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
    )
    .join('');

/**
 * Convierte un nombre o apellido a NOMBRE PROPIO con ortografía correcta.
 * - Sólo actúa si el texto viene todo en mayúsculas o todo en minúsculas.
 * - Colapsa espacios múltiples y recorta extremos.
 * - Aplica el diccionario de acentos y minúsculas para partículas.
 */
export const toProperName = (raw: string | null | undefined): string => {
  const value = (raw ?? '').replace(/\s+/g, ' ').trim();
  if (!value) return '';
  if (!isUniformCase(value)) return value; // el usuario escribió su propio formato

  const words = value.split(' ');
  return words
    .map((word, index) => {
      const key = fold(word);
      if (ORTOGRAFIA[key]) return ORTOGRAFIA[key];
      if (index > 0 && PARTICULAS.has(key)) return key;
      return capitalizeWord(word);
    })
    .join(' ');
};
