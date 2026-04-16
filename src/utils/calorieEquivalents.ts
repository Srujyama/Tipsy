// Compare drink calories to common foods
// Makes calorie counts more relatable

interface FoodEquivalent {
  name: string;
  emoji: string;
  calories: number;
}

const FOOD_EQUIVALENTS: FoodEquivalent[] = [
  {name: 'slice of pizza', emoji: '🍕', calories: 285},
  {name: 'Big Mac', emoji: '🍔', calories: 563},
  {name: 'donut', emoji: '🍩', calories: 250},
  {name: 'slice of cake', emoji: '🍰', calories: 350},
  {name: 'bag of chips', emoji: '🍟', calories: 160},
  {name: 'cookie', emoji: '🍪', calories: 160},
  {name: 'candy bar', emoji: '🍫', calories: 250},
  {name: 'bowl of rice', emoji: '🍚', calories: 200},
  {name: 'avocado', emoji: '🥑', calories: 240},
  {name: 'banana', emoji: '🍌', calories: 105},
  {name: 'egg', emoji: '🥚', calories: 78},
  {name: 'mile run', emoji: '🏃', calories: 100},
  {name: 'min of walking', emoji: '🚶', calories: 5},
  {name: 'min of cycling', emoji: '🚴', calories: 10},
];

export function getCalorieEquivalent(totalCalories: number): string {
  if (totalCalories < 50) return '';

  // Find the closest food equivalent
  const best = FOOD_EQUIVALENTS.reduce((closest, food) => {
    const ratio = totalCalories / food.calories;
    if (ratio >= 0.8 && ratio <= 5) {
      const rounded = Math.round(ratio * 10) / 10;
      if (!closest || Math.abs(rounded - Math.round(rounded)) < Math.abs(closest.ratio - Math.round(closest.ratio))) {
        return {food, ratio: rounded};
      }
    }
    return closest;
  }, null as {food: FoodEquivalent; ratio: number} | null);

  if (best) {
    const count = Math.round(best.ratio * 10) / 10;
    if (count <= 1.2) {
      return `${best.food.emoji} ≈ 1 ${best.food.name}`;
    }
    return `${best.food.emoji} ≈ ${count} ${best.food.name}s`;
  }

  // Fallback: minutes of walking
  const walkMin = Math.round(totalCalories / 5);
  return `🚶 ≈ ${walkMin} min walk to burn off`;
}

export function getExerciseEquivalent(totalCalories: number): string {
  if (totalCalories < 50) return '';
  const runMiles = (totalCalories / 100).toFixed(1);
  const walkMin = Math.round(totalCalories / 5);
  const cycleMin = Math.round(totalCalories / 10);

  if (totalCalories < 200) return `🏃 ${runMiles} mi run to burn off`;
  if (totalCalories < 500) return `🚴 ${cycleMin} min cycling to burn off`;
  return `🏃 ${runMiles} mi run or 🚶 ${walkMin} min walk`;
}
