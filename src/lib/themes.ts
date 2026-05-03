// Catálogo central de temas festivos para la tienda.
// Cada tema corresponde a una clase CSS .theme-<id> definida en globals.css.
// "none" significa "sin tema" — la página se renderiza idéntica al diseño base.

export type ThemeId =
  | 'none'
  | 'san-valentin'
  | 'flor-amarilla'
  | 'dia-nino'
  | 'dia-mama'
  | 'dia-papa'
  | 'independencia'
  | 'halloween'
  | 'dia-muertos'
  | 'navidad'
  | 'reyes';

export interface ThemeMeta {
  id: ThemeId;
  label: string;
  date: string;       // texto corto de fecha mostrado en el banner (ej. "10 DE MAYO")
  message: string;    // frase festiva que acompaña a la fecha
  description: string;
  swatch: string;        // color principal del tema (vista previa)
  swatchAccent?: string; // color secundario (mini-degradado en el selector)
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'none',
    label: 'Sin tema',
    date: '',
    message: '',
    description: 'Diseño base, sin decoración festiva',
    swatch: '#FFFDF7',
  },
  {
    id: 'san-valentin',
    label: 'San Valentín',
    date: '14 DE FEBRERO',
    message: 'Día del Amor y la Amistad — regala con corazón',
    description: 'Tonos rojos y rosados',
    swatch: '#FF4D6D',
    swatchAccent: '#FFB3BD',
  },
  {
    id: 'flor-amarilla',
    label: 'Día de la Flor Amarilla',
    date: '21 DE MARZO',
    message: 'Floreció la primavera, regala alegría',
    description: 'Amarillos y dorados de primavera',
    swatch: '#F5C518',
    swatchAccent: '#FFE066',
  },
  {
    id: 'dia-nino',
    label: 'Día del Niño',
    date: '30 DE ABRIL',
    message: 'La alegría hecha a mano, para los más pequeños',
    description: 'Multicolor pastel',
    swatch: '#5BC0EB',
    swatchAccent: '#FF8FA3',
  },
  {
    id: 'dia-mama',
    label: 'Día de las Madres',
    date: '10 DE MAYO',
    message: 'Para la mujer que lo es todo, con amor',
    description: 'Rosas pastel y dorados',
    swatch: '#FF8FA3',
    swatchAccent: '#FFD0DC',
  },
  {
    id: 'dia-papa',
    label: 'Día del Padre',
    date: 'TERCER DOMINGO DE JUNIO',
    message: 'Detalles que no se olvidan, hechos para él',
    description: 'Azules sobrios',
    swatch: '#3B6EA5',
    swatchAccent: '#7CC4F5',
  },
  {
    id: 'independencia',
    label: 'Independencia',
    date: '16 DE SEPTIEMBRE',
    message: 'Viva México con orgullo y tradición',
    description: 'Verde, blanco y rojo',
    swatch: '#1F7A3A',
    swatchAccent: '#CE1126',
  },
  {
    id: 'halloween',
    label: 'Halloween',
    date: '31 DE OCTUBRE',
    message: 'Detalles tejidos con un toque misterioso',
    description: 'Naranja calabaza y morado',
    swatch: '#FF7518',
    swatchAccent: '#4A1F5C',
  },
  {
    id: 'dia-muertos',
    label: 'Día de Muertos',
    date: '1 Y 2 DE NOVIEMBRE',
    message: 'Tradición tejida con cariño y memoria',
    description: 'Cempasúchil y morado tradicional',
    swatch: '#E76F00',
    swatchAccent: '#7B3F9F',
  },
  {
    id: 'navidad',
    label: 'Navidad',
    date: 'DICIEMBRE',
    message: 'El regalo perfecto, hecho a mano con amor',
    description: 'Verde pino y rojo navideño',
    swatch: '#0F8A4D',
    swatchAccent: '#C8102E',
  },
  {
    id: 'reyes',
    label: 'Día de Reyes',
    date: '6 DE ENERO',
    message: 'La magia del regalo continúa',
    description: 'Dorados reales',
    swatch: '#D4AF37',
    swatchAccent: '#B8860B',
  },
];

export const THEME_IDS: ThemeId[] = THEMES.map((t) => t.id);

export function isValidTheme(id: string | undefined | null): id is ThemeId {
  return !!id && (THEME_IDS as string[]).includes(id);
}

export function getTheme(id: string | undefined | null): ThemeMeta {
  return THEMES.find((t) => t.id === id) || THEMES[0];
}

// Sugiere un tema según la fecha actual. Devuelve 'none' si no hay festividad cercana.
// "Cerca" = rango personalizado por festividad (la mayoría arrancan ~7 días antes).
export function suggestThemeByDate(now: Date = new Date()): ThemeId {
  const m = now.getMonth() + 1; // 1-12
  const d = now.getDate();      // 1-31

  // Día de las Madres en México siempre es 10 de mayo (no movible)
  if (m === 5 && d >= 1 && d <= 12) return 'dia-mama';
  // San Valentín
  if (m === 2 && d >= 7 && d <= 15) return 'san-valentin';
  // Flor Amarilla / Primavera
  if (m === 3 && d >= 14 && d <= 22) return 'flor-amarilla';
  // Día del Niño (MX)
  if (m === 4 && d >= 23 && d <= 30) return 'dia-nino';
  // Día del Padre — tercer domingo de junio
  if (m === 6) {
    const third = thirdSundayOfJune(now.getFullYear());
    if (d >= third - 6 && d <= third + 1) return 'dia-papa';
  }
  // Independencia MX
  if (m === 9 && d >= 10 && d <= 16) return 'independencia';
  // Halloween
  if (m === 10 && d >= 25 && d <= 31) return 'halloween';
  // Día de Muertos
  if ((m === 10 && d === 31) || (m === 11 && d <= 2)) return 'dia-muertos';
  // Navidad
  if (m === 12 && d >= 1 && d <= 26) return 'navidad';
  // Reyes
  if (m === 1 && d >= 1 && d <= 7) return 'reyes';

  return 'none';
}

function thirdSundayOfJune(year: number): number {
  // Devuelve el día del mes (1-30) del tercer domingo de junio
  for (let day = 15; day <= 21; day++) {
    if (new Date(year, 5, day).getDay() === 0) return day;
  }
  return 21; // fallback (no debería ocurrir)
}
