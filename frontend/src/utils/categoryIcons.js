import {
  Sofa, BedDouble, UtensilsCrossed, ChefHat, Bed,
  Droplets, Palette, Leaf, Hammer, Briefcase, Activity,
  Grid3x3, Sun, Snowflake, Wind, Zap, DoorOpen,
  Home, Package, Image, Tv, Lamp, Bath, Armchair,
} from 'lucide-react';

export const CATEGORY_ICONS = {
  Sofa, BedDouble, UtensilsCrossed, ChefHat, Bed,
  Droplets, Palette, Leaf, Hammer, Briefcase, Activity,
  Grid3x3, Sun, Snowflake, Wind, Zap, DoorOpen,
  Home, Package, Image, Tv, Lamp, Bath, Armchair,
};

// Compatibilité rétroactive : anciens emojis → noms d'icônes
const EMOJI_FALLBACK = {
  '🛋️': 'Sofa',
  '🛏️': 'BedDouble',
  '🍽️': 'UtensilsCrossed',
  '🍳': 'ChefHat',
  '🚿': 'Droplets',
  '🎨': 'Palette',
  '🌿': 'Leaf',
  '🔨': 'Hammer',
  '💼': 'Briefcase',
  '🧘': 'Activity',
  '⬜': 'Grid3x3',
  '☀️': 'Sun',
  '❄️': 'Snowflake',
  '💨': 'Wind',
  '⚡': 'Zap',
  '🪑': 'Armchair',
  '🚪': 'DoorOpen',
  '🏠': 'Home',
  '📦': 'Package',
  '🖼️': 'Image',
};

export const ICON_LIST = [
  'Sofa', 'BedDouble', 'Bed', 'Armchair', 'UtensilsCrossed',
  'ChefHat', 'Droplets', 'Bath', 'Palette', 'Leaf',
  'Hammer', 'Briefcase', 'Activity', 'Grid3x3', 'Sun',
  'Snowflake', 'Wind', 'Zap', 'DoorOpen', 'Home',
  'Package', 'Image', 'Tv', 'Lamp',
];

export function CategoryIcon({ name, size = 24, style, className }) {
  const resolvedName = EMOJI_FALLBACK[name] || name;
  const Icon = CATEGORY_ICONS[resolvedName] || Package;
  return <Icon size={size} style={style} className={className} />;
}
