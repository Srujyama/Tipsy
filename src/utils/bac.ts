// One standard drink = 14g pure alcohol = 0.6 oz pure alcohol (US definition)
// We use this as a unit for tracking session intensity — it is NOT a BAC estimate.

export type IntensityLevel = 'none' | 'light' | 'moderate' | 'heavy' | 'excessive';

export function getSessionIntensity(
  standardDrinks: number,
  hoursSinceFirstDrink: number,
): {level: IntensityLevel; label: string; color: string} {
  if (standardDrinks === 0) return {level: 'none', label: 'No drinks tonight', color: '#4a6'};
  const perHour = hoursSinceFirstDrink > 0 ? standardDrinks / hoursSinceFirstDrink : standardDrinks;
  if (standardDrinks < 1) return {level: 'light', label: 'Light pace', color: '#5a8a5a'};
  if (perHour < 1) return {level: 'light', label: 'Steady pace', color: '#8a9a4a'};
  if (perHour < 1.5) return {level: 'moderate', label: 'Moderate pace', color: '#c9a96e'};
  if (perHour < 2.5) return {level: 'heavy', label: 'Fast pace', color: '#b87333'};
  return {level: 'excessive', label: 'Very fast pace', color: '#8b2020'};
}

// Calorie & ABV data from USDA FoodData Central + brand nutrition labels
export const DRINK_PRESETS = {
  // ── Light Beers ──
  light_beer: {
    oz: 12, abv: 0.042, label: 'Light Beer', emoji: '🍻',
    calories: 103, description: '12 oz · 4.2%', category: 'light_beer',
    stdDrinks: 0.8,
  },
  michelob_ultra: {
    oz: 12, abv: 0.042, label: 'Michelob Ultra', emoji: '🍻',
    calories: 95, description: '12 oz · 4.2%', category: 'light_beer',
    stdDrinks: 0.7,
  },

  // ── Regular Beers ──
  beer: {
    oz: 12, abv: 0.05, label: 'Beer', emoji: '🍺',
    calories: 145, description: '12 oz · 5%', category: 'beer',
    stdDrinks: 1.0,
  },
  corona: {
    oz: 12, abv: 0.046, label: 'Corona', emoji: '🍺',
    calories: 148, description: '12 oz · 4.6%', category: 'beer',
    stdDrinks: 1.0,
  },
  blue_moon: {
    oz: 12, abv: 0.054, label: 'Blue Moon', emoji: '🍺',
    calories: 170, description: '12 oz · 5.4%', category: 'beer',
    stdDrinks: 1.1,
  },
  tall_boy: {
    oz: 16, abv: 0.05, label: 'Tall Boy', emoji: '🍺',
    calories: 200, description: '16 oz · 5%', category: 'beer',
    stdDrinks: 1.3,
  },

  // ── Craft ──
  ipa: {
    oz: 12, abv: 0.065, label: 'IPA', emoji: '🍺',
    calories: 200, description: '12 oz · 6.5%', category: 'craft',
    stdDrinks: 1.3,
  },
  dipa: {
    oz: 12, abv: 0.085, label: 'Double IPA', emoji: '🍺',
    calories: 270, description: '12 oz · 8.5%', category: 'craft',
    stdDrinks: 1.7,
  },
  stout: {
    oz: 12, abv: 0.055, label: 'Stout', emoji: '🍺',
    calories: 180, description: '12 oz · 5.5%', category: 'craft',
    stdDrinks: 1.1,
  },
  sour: {
    oz: 12, abv: 0.045, label: 'Sour', emoji: '🍺',
    calories: 150, description: '12 oz · 4.5%', category: 'craft',
    stdDrinks: 0.9,
  },

  // ── Spirits (1.5oz, 80 proof) ──
  shot: {
    oz: 1.5, abv: 0.40, label: 'Shot', emoji: '🥃',
    calories: 97, description: '1.5 oz · 40%', category: 'spirit',
    stdDrinks: 1.0,
  },
  double: {
    oz: 3, abv: 0.40, label: 'Double', emoji: '🥃',
    calories: 194, description: '3 oz · 40%', category: 'spirit',
    stdDrinks: 2.0,
  },

  // ── Wine ──
  red_wine: {
    oz: 5, abv: 0.135, label: 'Red Wine', emoji: '🍷',
    calories: 125, description: '5 oz · 13.5%', category: 'wine',
    stdDrinks: 1.1,
  },
  white_wine: {
    oz: 5, abv: 0.12, label: 'White Wine', emoji: '🥂',
    calories: 121, description: '5 oz · 12%', category: 'wine',
    stdDrinks: 1.0,
  },
  rose: {
    oz: 5, abv: 0.12, label: 'Rosé', emoji: '🍷',
    calories: 120, description: '5 oz · 12%', category: 'wine',
    stdDrinks: 1.0,
  },
  champagne: {
    oz: 5, abv: 0.12, label: 'Champagne', emoji: '🥂',
    calories: 120, description: '5 oz · 12%', category: 'wine',
    stdDrinks: 1.0,
  },

  // ── Cocktails ──
  margarita: {
    oz: 8, abv: 0.13, label: 'Margarita', emoji: '🍹',
    calories: 275, description: '8 oz · 13%', category: 'cocktail',
    stdDrinks: 1.5,
  },
  mojito: {
    oz: 8, abv: 0.10, label: 'Mojito', emoji: '🍹',
    calories: 215, description: '8 oz · 10%', category: 'cocktail',
    stdDrinks: 1.3,
  },
  long_island: {
    oz: 8, abv: 0.22, label: 'Long Island', emoji: '🍹',
    calories: 290, description: '8 oz · 22%', category: 'cocktail',
    stdDrinks: 3.0,
  },
  pina_colada: {
    oz: 8, abv: 0.12, label: 'Piña Colada', emoji: '🍹',
    calories: 490, description: '8 oz · 12%', category: 'cocktail',
    stdDrinks: 1.5,
  },
  moscow_mule: {
    oz: 8, abv: 0.10, label: 'Moscow Mule', emoji: '🍹',
    calories: 180, description: '8 oz · 10%', category: 'cocktail',
    stdDrinks: 1.3,
  },
  old_fashioned: {
    oz: 4, abv: 0.30, label: 'Old Fashioned', emoji: '🥃',
    calories: 155, description: '4 oz · 30%', category: 'cocktail',
    stdDrinks: 1.5,
  },
  gin_tonic: {
    oz: 8, abv: 0.08, label: 'Gin & Tonic', emoji: '🍸',
    calories: 170, description: '8 oz · 8%', category: 'cocktail',
    stdDrinks: 1.0,
  },
  rum_coke: {
    oz: 8, abv: 0.08, label: 'Rum & Coke', emoji: '🍹',
    calories: 185, description: '8 oz · 8%', category: 'cocktail',
    stdDrinks: 1.0,
  },
  whiskey_sour: {
    oz: 4, abv: 0.25, label: 'Whiskey Sour', emoji: '🥃',
    calories: 165, description: '4 oz · 25%', category: 'cocktail',
    stdDrinks: 1.3,
  },
  cosmo: {
    oz: 4, abv: 0.25, label: 'Cosmopolitan', emoji: '🍸',
    calories: 150, description: '4 oz · 25%', category: 'cocktail',
    stdDrinks: 1.3,
  },
  aperol_spritz: {
    oz: 6, abv: 0.08, label: 'Aperol Spritz', emoji: '🍹',
    calories: 125, description: '6 oz · 8%', category: 'cocktail',
    stdDrinks: 0.8,
  },
  espresso_martini: {
    oz: 4, abv: 0.25, label: 'Espresso Martini', emoji: '🍸',
    calories: 225, description: '4 oz · 25%', category: 'cocktail',
    stdDrinks: 1.5,
  },
  negroni: {
    oz: 3, abv: 0.30, label: 'Negroni', emoji: '🍸',
    calories: 180, description: '3 oz · 30%', category: 'cocktail',
    stdDrinks: 1.5,
  },
  daiquiri: {
    oz: 4, abv: 0.20, label: 'Daiquiri', emoji: '🍹',
    calories: 190, description: '4 oz · 20%', category: 'cocktail',
    stdDrinks: 1.3,
  },

  // ── Seltzers ──
  seltzer: {
    oz: 12, abv: 0.05, label: 'Hard Seltzer', emoji: '🫧',
    calories: 100, description: '12 oz · 5%', category: 'seltzer',
    stdDrinks: 0.8,
  },

  // ── Other ──
  sake: {
    oz: 5, abv: 0.15, label: 'Sake', emoji: '🍶',
    calories: 135, description: '5 oz · 15%', category: 'other',
    stdDrinks: 1.2,
  },
  hard_cider: {
    oz: 12, abv: 0.05, label: 'Hard Cider', emoji: '🍎',
    calories: 160, description: '12 oz · 5%', category: 'other',
    stdDrinks: 1.0,
  },
} as const;

export type DrinkType = keyof typeof DRINK_PRESETS;

export function getStandardDrinks(oz: number, abv: number): number {
  return (oz * abv) / 0.6;
}

export function getDrinkCalories(type: string): number {
  const preset = DRINK_PRESETS[type as DrinkType];
  return preset ? preset.calories : 150;
}
