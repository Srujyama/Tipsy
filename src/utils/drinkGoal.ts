import AsyncStorage from '@react-native-async-storage/async-storage';

const GOAL_KEY = '@tipsy_drink_goal';

export interface DrinkGoal {
  maxDrinks: number;    // per session
  maxCalories: number;  // per session
  maxSpending: number;  // per session ($)
}

const DEFAULT_GOAL: DrinkGoal = {
  maxDrinks: 0,    // 0 = no limit set
  maxCalories: 0,
  maxSpending: 0,
};

export async function getDrinkGoal(): Promise<DrinkGoal> {
  try {
    const raw = await AsyncStorage.getItem(GOAL_KEY);
    return raw ? {...DEFAULT_GOAL, ...JSON.parse(raw)} : DEFAULT_GOAL;
  } catch {
    return DEFAULT_GOAL;
  }
}

export async function setDrinkGoal(goal: Partial<DrinkGoal>): Promise<DrinkGoal> {
  const current = await getDrinkGoal();
  const updated = {...current, ...goal};
  await AsyncStorage.setItem(GOAL_KEY, JSON.stringify(updated));
  return updated;
}

export function checkGoalStatus(
  goal: DrinkGoal,
  currentDrinks: number,
  currentCalories: number,
  currentSpent: number,
): {exceeded: boolean; warnings: string[]} {
  const warnings: string[] = [];
  let exceeded = false;

  if (goal.maxDrinks > 0) {
    const pct = currentDrinks / goal.maxDrinks;
    if (pct >= 1) {
      warnings.push(`Drink limit reached (${currentDrinks}/${goal.maxDrinks})`);
      exceeded = true;
    } else if (pct >= 0.75) {
      warnings.push(`${goal.maxDrinks - currentDrinks} drink${goal.maxDrinks - currentDrinks !== 1 ? 's' : ''} left in your goal`);
    }
  }

  if (goal.maxCalories > 0 && currentCalories >= goal.maxCalories) {
    warnings.push(`Calorie limit reached (${currentCalories}/${goal.maxCalories})`);
    exceeded = true;
  }

  if (goal.maxSpending > 0 && currentSpent >= goal.maxSpending) {
    warnings.push(`Spending limit reached ($${currentSpent}/$${goal.maxSpending})`);
    exceeded = true;
  }

  return {exceeded, warnings};
}
