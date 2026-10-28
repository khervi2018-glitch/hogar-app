// Mapea cada categoria (por nombre) a un icono de Ionicons y un color de acento.
// Si una categoria no esta aqui, usa el fallback.
export const categoryIconMap = {
 'Electricidad':           { icon: 'flash',         color: '#f59e0b' },
  'Gasfitería / Plomería': { icon: 'water',         color: '#3b82f6' },
  'Pintura':               { icon: 'color-palette', color: '#8b5cf6' },
  'Limpieza del hogar':    { icon: 'sparkles',      color: '#10b981' },
  'Soporte técnico / TI':  { icon: 'laptop',        color: '#6366f1' },
  'Carpintería':           { icon: 'hammer',        color: '#d97706' },
  'Consultoría':           { icon: 'briefcase',     color: '#0ea5e9' },
  'Remodelaciones':        { icon: 'home',          color: '#e11d48' },
};

export const categoryIconFallback = { icon: 'ellipsis-horizontal-circle', color: '#ea580c' };

export function getCategoryIcon(nombre) {
  return categoryIconMap[nombre] ?? categoryIconFallback;
}