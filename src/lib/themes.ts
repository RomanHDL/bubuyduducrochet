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
  emoji: string;
  description: string;
  swatch: string; // color hex usado como vista previa en el selector
}

export const THEMES: ThemeMeta[] = [
  {
    id: 'none',
    label: 'Sin tema',
    emoji: '✨',
    description: 'Diseño base, sin decoración festiva',
    swatch: '#FFFDF7',
  },
  {
    id: 'san-valentin',
    label: 'San Valentín',
    emoji: '💖',
    description: '14 de febrero — corazones y rojo enamorado',
    swatch: '#FF4D6D',
  },
  {
    id: 'flor-amarilla',
    label: 'Día de la Flor Amarilla',
    emoji: '🌼',
    description: '21 de marzo — primavera y girasoles',
    swatch: '#FFD93D',
  },
  {
    id: 'dia-nino',
    label: 'Día del Niño',
    emoji: '🎈',
    description: '30 de abril — globos y colores festivos',
    swatch: '#5BC0EB',
  },
  {
    id: 'dia-mama',
    label: 'Día de las Madres',
    emoji: '🌸',
    description: '10 de mayo — flores rosadas para mamá',
    swatch: '#FF8FA3',
  },
  {
    id: 'dia-papa',
    label: 'Día del Padre',
    emoji: '👔',
    description: 'Tercer domingo de junio — azul para papá',
    swatch: '#3B6EA5',
  },
  {
    id: 'independencia',
    label: 'Independencia',
    emoji: '🇲🇽',
    description: '16 de septiembre — verde, blanco y rojo',
    swatch: '#1F7A3A',
  },
  {
    id: 'halloween',
    label: 'Halloween',
    emoji: '🎃',
    description: '31 de octubre — naranja calabaza',
    swatch: '#FF7518',
  },
  {
    id: 'dia-muertos',
    label: 'Día de Muertos',
    emoji: '💀',
    description: '1-2 noviembre — cempasúchil y morado',
    swatch: '#E76F00',
  },
  {
    id: 'navidad',
    label: 'Navidad',
    emoji: '🎄',
    description: 'Diciembre — verde pino y rojo navideño',
    swatch: '#0F8A4D',
  },
  {
    id: 'reyes',
    label: 'Día de Reyes',
    emoji: '👑',
    description: '6 de enero — dorado real',
    swatch: '#D4AF37',
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
