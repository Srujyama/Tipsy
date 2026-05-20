import {Share} from 'react-native';
import {DrinkLog} from '../types';
import {DRINK_PRESETS, DrinkType} from './drinks';
import {getDrinkPrice} from './prices';

export async function shareSession(
  drinks: DrinkLog[],
  totalCalories: number,
) {
  if (drinks.length === 0) return;

  const totalSpent = drinks.reduce((sum, d) => sum + getDrinkPrice(d.type), 0);

  // Count drink types
  const typeCounts: Record<string, number> = {};
  for (const d of drinks) {
    const label = DRINK_PRESETS[d.type as DrinkType]?.label || d.type;
    typeCounts[label] = (typeCounts[label] || 0) + 1;
  }
  const drinkList = Object.entries(typeCounts)
    .map(([name, count]) => `${count}x ${name}`)
    .join(', ');

  const message = [
    `🍻 Tonight on Tipsy`,
    ``,
    `${drinks.length} drink${drinks.length !== 1 ? 's' : ''}: ${drinkList}`,
    `🔥 ${totalCalories} calories`,
    `💰 ~$${totalSpent} spent`,
    ``,
    `Track your drinks with Tipsy 🍺`,
  ].join('\n');

  await Share.share({message});
}
