import {DRINK_PRESETS, DrinkType} from './drinks';

interface Recommendation {
  type: DrinkType;
  reason: string;
}

// Recommend drinks based on user's current state
export function getSmartRecommendation(
  totalCalories: number,
  drinkCount: number,
  drinksPerHour: number,
): Recommendation | null {
  if (drinkCount === 0) return null;

  // If drinking fast, suggest something to sip slowly
  if (drinksPerHour > 2.5) {
    return {
      type: 'red_wine',
      reason: 'Something to sip — you\'re drinking fast',
    };
  }

  // If high calorie count, suggest low-cal options
  if (totalCalories > 500) {
    const lowCalOptions: {type: DrinkType; cal: number}[] = [
      {type: 'michelob_ultra', cal: 95},
      {type: 'shot', cal: 97},
      {type: 'seltzer', cal: 100},
      {type: 'light_beer', cal: 103},
    ];
    const pick = lowCalOptions[drinkCount % lowCalOptions.length];
    return {
      type: pick.type,
      reason: `Only ${pick.cal} cal — lighter choice after ${totalCalories} cal tonight`,
    };
  }

  return null;
}

// Get lowest calorie drinks sorted
export function getLowCalDrinks(limit: number = 5): {type: DrinkType; label: string; calories: number; emoji: string}[] {
  return (Object.entries(DRINK_PRESETS) as [DrinkType, typeof DRINK_PRESETS[DrinkType]][])
    .map(([type, preset]) => ({
      type,
      label: preset.label,
      calories: preset.calories,
      emoji: preset.emoji,
    }))
    .sort((a, b) => a.calories - b.calories)
    .slice(0, limit);
}

// Get highest ABV drinks (most "efficient")
export function getStrongestDrinks(limit: number = 5): {type: DrinkType; label: string; abv: number; emoji: string}[] {
  return (Object.entries(DRINK_PRESETS) as [DrinkType, typeof DRINK_PRESETS[DrinkType]][])
    .map(([type, preset]) => ({
      type,
      label: preset.label,
      abv: preset.abv,
      emoji: preset.emoji,
    }))
    .sort((a, b) => b.abv - a.abv)
    .slice(0, limit);
}
