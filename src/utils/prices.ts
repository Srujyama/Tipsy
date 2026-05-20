// Average bar/restaurant drink prices (USD) - US national averages 2024-2025
// Sources: BLS, Numbeo, Beverage Industry reports

import {DrinkType} from './drinks';

const DRINK_PRICES: Record<DrinkType, number> = {
  // Light beers
  light_beer: 5,
  michelob_ultra: 5,

  // Regular beers
  beer: 6,
  corona: 7,
  blue_moon: 7,
  tall_boy: 7,

  // Craft
  ipa: 8,
  dipa: 9,
  stout: 8,
  sour: 9,

  // Spirits
  shot: 7,
  double: 12,

  // Wine
  red_wine: 10,
  white_wine: 10,
  rose: 10,
  champagne: 12,

  // Cocktails
  margarita: 12,
  mojito: 13,
  long_island: 12,
  pina_colada: 13,
  moscow_mule: 13,
  old_fashioned: 14,
  gin_tonic: 11,
  rum_coke: 10,
  whiskey_sour: 13,
  cosmo: 13,
  aperol_spritz: 14,
  espresso_martini: 15,
  negroni: 14,
  daiquiri: 12,

  // Seltzers & other
  seltzer: 6,
  sake: 9,
  hard_cider: 7,
};

export function getDrinkPrice(type: string): number {
  return DRINK_PRICES[type as DrinkType] || 8;
}

export function formatCurrency(amount: number): string {
  return `$${amount.toFixed(0)}`;
}
