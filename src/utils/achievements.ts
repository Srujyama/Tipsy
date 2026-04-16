import type {DrinkSession} from '../services/firebase';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  earned: boolean;
}

export function getAchievements(
  history: DrinkSession[],
  soberDays: number,
  totalDrinksAllTime: number,
): Achievement[] {
  return [
    {
      id: 'first_drink',
      title: 'First Sip',
      description: 'Log your first drink',
      emoji: '🍺',
      earned: totalDrinksAllTime >= 1,
    },
    {
      id: 'social_butterfly',
      title: 'Social Butterfly',
      description: 'Log drinks on 3 different days',
      emoji: '🦋',
      earned: history.length >= 3,
    },
    {
      id: 'hydration_hero',
      title: 'Hydration Hero',
      description: 'Go 3 days sober in a row',
      emoji: '💧',
      earned: soberDays >= 3,
    },
    {
      id: 'week_warrior',
      title: 'Week Warrior',
      description: '7 day sober streak',
      emoji: '🏆',
      earned: soberDays >= 7,
    },
    {
      id: 'centurion',
      title: 'Centurion',
      description: 'Log 100 drinks total',
      emoji: '💯',
      earned: totalDrinksAllTime >= 100,
    },
    {
      id: 'explorer',
      title: 'Explorer',
      description: 'Try 5 different drink types',
      emoji: '🗺️',
      earned: new Set(history.flatMap(h => h.drinks.map(d => d.type))).size >= 5,
    },
    {
      id: 'night_owl',
      title: 'Night Owl',
      description: 'Log a drink after midnight',
      emoji: '🦉',
      earned: history.some(h => h.drinks.some(d => new Date(d.timestamp).getHours() < 4)),
    },
    {
      id: 'connoisseur',
      title: 'Connoisseur',
      description: 'Try 10 different drink types',
      emoji: '🎩',
      earned: new Set(history.flatMap(h => h.drinks.map(d => d.type))).size >= 10,
    },
    {
      id: 'party_animal',
      title: 'Party Animal',
      description: 'Log 5+ drinks in one session',
      emoji: '🎉',
      earned: history.some(h => h.drinkCount >= 5),
    },
    {
      id: 'month_clean',
      title: 'Sober Month',
      description: '30 day sober streak',
      emoji: '⭐',
      earned: soberDays >= 30,
    },
  ];
}
