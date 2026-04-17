import {
  Building2,
  Cable,
  Factory,
  Grid3X3,
  HousePlug,
  Lamp,
  LampCeiling,
  LampDesk,
  LampFloor,
  LampWallDown,
  Lightbulb,
  PanelsTopLeft,
  PlugZap,
  Sparkles,
  Trees,
  type LucideIcon,
} from 'lucide-react';
import { Category } from '@/types';

const categoryIconRules: Array<{ terms: string[]; icon: LucideIcon }> = [
  { terms: ['ceiling', 'plafon', 'tavan'], icon: LampCeiling },
  { terms: ['table', 'birou', 'masa', 'masă', 'veioza', 'veioză'], icon: LampDesk },
  { terms: ['pendant', 'suspend', 'suspensie'], icon: Lamp },
  { terms: ['spot', 'incastr', 'recessed'], icon: PanelsTopLeft },
  { terms: ['wall', 'perete', 'aplica', 'aplică'], icon: LampWallDown },
  { terms: ['floor', 'pardoseala', 'pardoseală'], icon: LampFloor },
  { terms: ['bec', 'bulb'], icon: Lightbulb },
  { terms: ['led'], icon: PlugZap },
  { terms: ['smart', 'home'], icon: HousePlug },
  { terms: ['decor'], icon: Sparkles },
  { terms: ['exterior', 'outdoor', 'gradina', 'grădină'], icon: Trees },
  { terms: ['industrial'], icon: Factory },
  { terms: ['arhitect', 'architect'], icon: Building2 },
  { terms: ['cablu', 'cable', 'elect'], icon: Cable },
];

export function getCategoryIcon(category?: Pick<Category, 'name' | 'slug'>): LucideIcon {
  if (!category) return Grid3X3;

  const searchable = `${category.slug} ${category.name}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return categoryIconRules.find((rule) => rule.terms.some((term) => searchable.includes(term)))?.icon ?? LampCeiling;
}
