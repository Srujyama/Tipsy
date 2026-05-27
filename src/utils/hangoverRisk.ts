// Hangover risk prediction based on research from:
// - Alcohol & Alcoholism journal
// - European Journal of Clinical Investigation
// - Dehydration studies (ADH inhibition)

import {DrinkLog} from '../types';

interface HangoverPrediction {
  risk: 'low' | 'moderate' | 'high' | 'severe';
  score: number; // 0-100
  emoji: string;
  label: string;
  tips: string[];
}

export function predictHangover(
  drinks: DrinkLog[],
  waterCount: number,
  hoursSinceFirst: number,
): HangoverPrediction {
  if (drinks.length === 0) {
    return {risk: 'low', score: 0, emoji: '😊', label: 'No risk', tips: []};
  }

  let score = 0;

  // Factor 1: Total alcohol (biggest factor)
  const totalStdDrinks = drinks.reduce((sum, d) => sum + d.standardDrinks, 0);
  score += Math.min(50, totalStdDrinks * 10);

  // Factor 2: Drinking speed (drinks per hour).
  // Skip pace contribution when window is too short — a single fresh drink would
  // otherwise produce an absurd per-hour value and over-score the hangover risk.
  const paceValid = drinks.length >= 2 && hoursSinceFirst >= 0.25;
  const pace = paceValid ? drinks.length / hoursSinceFirst : 0;
  if (pace > 3) score += 15;
  else if (pace > 2) score += 8;

  // Factor 4: Congeners (dark liquors = more hangover)
  // Dark spirits, red wine, stouts have more congeners
  const darkDrinkTypes = ['red_wine', 'stout', 'old_fashioned', 'negroni', 'whiskey_sour'];
  const darkCount = drinks.filter(d => darkDrinkTypes.includes(d.type)).length;
  score += Math.min(10, darkCount * 4);

  // Factor 5: Mixing different types (increases nausea risk)
  const uniqueTypes = new Set(drinks.map(d => d.type)).size;
  if (uniqueTypes >= 4) score += 10;
  else if (uniqueTypes >= 3) score += 5;

  // Factor 6: Hydration (water reduces risk)
  const waterRatio = waterCount / Math.max(drinks.length, 1);
  if (waterRatio >= 1) score -= 15;
  else if (waterRatio >= 0.5) score -= 8;
  else score += 5;

  // Factor 7: Carbonation (speeds absorption)
  const carbonatedTypes = ['champagne', 'seltzer', 'gin_tonic', 'rum_coke', 'moscow_mule'];
  const carbonatedCount = drinks.filter(d => carbonatedTypes.includes(d.type)).length;
  score += Math.min(5, carbonatedCount * 2);

  score = Math.max(0, Math.min(100, Math.round(score)));

  const tips: string[] = [];
  if (waterRatio < 1) tips.push('Drink more water — aim for 1 glass per drink');
  if (darkCount > 0) tips.push('Dark liquors have more congeners that worsen hangovers');
  if (pace > 2) tips.push('Slow down — fast drinking increases hangover severity');
  if (uniqueTypes >= 3) tips.push('Mixing drink types can increase nausea');
  if (score > 30) tips.push('Eat something before bed — helps stabilize blood sugar');
  if (score > 50) tips.push('Take electrolytes before sleeping');

  if (score < 20) return {risk: 'low', score, emoji: '😊', label: 'Low risk', tips};
  if (score < 45) return {risk: 'moderate', score, emoji: '😐', label: 'Moderate', tips};
  if (score < 70) return {risk: 'high', score, emoji: '😰', label: 'High risk', tips};
  return {risk: 'severe', score, emoji: '🤢', label: 'Tomorrow will hurt', tips};
}
