import {DRINK_PRESETS, DrinkType} from './bac';

interface DrinkOfDay {
  type: DrinkType;
  reason: string;
}

const RECOMMENDATIONS: DrinkOfDay[] = [
  {type: 'aperol_spritz', reason: 'Light, refreshing, and only 125 cal'},
  {type: 'moscow_mule', reason: 'Classic copper mug vibes — 180 cal'},
  {type: 'old_fashioned', reason: 'Timeless elegance — a bartender\'s favorite'},
  {type: 'espresso_martini', reason: 'Best of both worlds — caffeine + cocktail'},
  {type: 'negroni', reason: 'Bitter, bold, beautiful — the Italian way'},
  {type: 'margarita', reason: 'Salt rim energy — perfect for any night'},
  {type: 'champagne', reason: 'Celebrate something — even if it\'s Tuesday'},
  {type: 'ipa', reason: 'Hoppy and complex — for the craft beer lovers'},
  {type: 'red_wine', reason: 'Rich and smooth — pair with good conversation'},
  {type: 'daiquiri', reason: 'Hemingway\'s drink of choice — 190 cal'},
  {type: 'gin_tonic', reason: 'Clean and crisp — the reliable classic'},
  {type: 'seltzer', reason: 'Low cal king at only 100 cal — guilt free'},
  {type: 'whiskey_sour', reason: 'Sweet, sour, strong — perfectly balanced'},
  {type: 'mojito', reason: 'Minty fresh — like a vacation in a glass'},
  {type: 'stout', reason: 'Dark and velvety — pairs with cold nights'},
];

export function getDrinkOfDay(): {type: DrinkType; preset: typeof DRINK_PRESETS[DrinkType]; reason: string} {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
  const pick = RECOMMENDATIONS[dayOfYear % RECOMMENDATIONS.length];
  return {
    type: pick.type,
    preset: DRINK_PRESETS[pick.type],
    reason: pick.reason,
  };
}
