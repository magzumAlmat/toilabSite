'use client';

// SVG-иконки категорий (Lucide) вместо emoji — для визуальных карточек/плиток.
// Цвет наследуется через currentColor, поэтому можно менять цвет иконки через CSS
// (например, при hover контейнера). Размер/толщина штриха — едины по проекту.
// NB: в <select><option> SVG вставить нельзя — там в коде остаётся emoji-поле icon.
import {
  UtensilsCrossed, CakeSlice, Flower2, Car, Mic, Drama, Gem, Shirt,
  Camera, Sparkles, Gift, Printer, Speaker, Hotel, Package, Ribbon,
} from 'lucide-react';

const ICONS = {
  restaurants: UtensilsCrossed,
  cakes: CakeSlice,
  flowers: Flower2,
  transport: Car,
  tamada: Mic,
  program: Drama,
  jewelry: Gem,
  clothing: Shirt,
  'photo-video': Camera,
  fireworks: Sparkles,
  suvenirs: Gift,
  typography: Printer,
  equipment: Speaker,
  hotels: Hotel,
  goods: Package,
  'traditional-gift': Ribbon,
};

export function CatIcon({ slug, size = 28, strokeWidth = 1.9, ...rest }) {
  const Ic = ICONS[slug] || Sparkles;
  // color не задаём → lucide рисует stroke="currentColor" и наследует цвет от родителя.
  return <Ic size={size} strokeWidth={strokeWidth} aria-hidden {...rest} />;
}

export default CatIcon;
