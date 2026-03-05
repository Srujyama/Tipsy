// BAC calculation using adapted Widmark formula (Watson et al. 1981)
// Sources:
//   - Watson et al. 1981: sex-specific body water distribution ratios
//   - agab027: eBAC validation with hangover severity (Howland et al.)
//   - nihms795582: female higher risk threshold ~30g ethanol/day
//   - apinj-04-057: BMI/gender differences in university populations

const STANDARD_DRINK_GRAMS = 14   // 14g ethanol per US standard drink
const LBS_TO_KG = 0.453592

// Watson et al. 1981 adapted Widmark r-values (body water ratio)
// Males: r ≈ 0.68, Females: r ≈ 0.55
const GENDER_RATIO = { male: 0.68, female: 0.55 }

// Elimination rate: 0.015–0.018 BAC/hr; 0.017 is population mean (agab027)
const ELIMINATION_RATE = 0.017

// Female risk threshold: ~30g ethanol/night (~2.1 standard drinks) per nihms paper
// Male moderate risk: ~56g ethanol/night (~4 standard drinks)
const FEMALE_CAUTION_GRAMS = 30  // per nihms795582 hepatotoxicity threshold
const MALE_CAUTION_GRAMS = 56

export const DRINK_TYPES = {
  shot: { label: 'Shot (1.5oz)', standardDrinks: 1.0, icon: 'shot' },
  beer: { label: 'Beer (12oz)', standardDrinks: 1.0, icon: 'beer' },
  mixed: { label: 'Mixed Drink', standardDrinks: 1.5, icon: 'mixed' },
}

/**
 * Calculate BAC using adapted Widmark formula (Watson et al. 1981).
 * BAC = (alcohol_grams / (body_weight_kg * r * 10)) - (elimination * hours)
 * Result in g/dL (standard BAC units).
 */
export function calculateBAC(totalStandardDrinks, weightLbs, gender, hoursElapsed) {
  const alcoholGrams = totalStandardDrinks * STANDARD_DRINK_GRAMS
  const weightKg = weightLbs * LBS_TO_KG
  const r = GENDER_RATIO[gender] || 0.68
  // Widmark: BAC (g/dL) = alcohol (g) / (weight (kg) * r * 10 (dL/kg))
  const bac = (alcoholGrams / (weightKg * r * 10)) - (ELIMINATION_RATE * hoursElapsed)
  return Math.max(0, parseFloat(bac.toFixed(4)))
}

/**
 * Number of standard drinks needed to reach targetBAC given body params.
 */
export function drinksForBAC(targetBAC, weightLbs, gender, hoursElapsed = 1) {
  const weightKg = weightLbs * LBS_TO_KG
  const r = GENDER_RATIO[gender] || 0.68
  const alcoholGrams = (targetBAC + ELIMINATION_RATE * hoursElapsed) * weightKg * r * 10
  return Math.max(1, Math.round(alcoholGrams / STANDARD_DRINK_GRAMS))
}

/**
 * Calculate personalized drink limits using research-backed thresholds.
 *
 * Low  = BAC 0.04 (feeling effects, safe zone)
 * Med  = BAC 0.06 (buzzed, moderate zone)
 * High = legal limit 0.08 OR female caution threshold (~30g), whichever is lower
 *
 * Per nihms795582: women face higher hepatotoxicity risk at lower consumption,
 * so the female high limit is capped at the 30g/day threshold.
 */
export function calculateLimits(weightLbs, gender) {
  const low = drinksForBAC(0.04, weightLbs, gender)
  const med = drinksForBAC(0.06, weightLbs, gender)
  const bacBasedHigh = drinksForBAC(0.08, weightLbs, gender)

  // For females, also consider the 30g ethanol caution threshold
  let high = bacBasedHigh
  if (gender === 'female') {
    const cautionDrinks = Math.floor(FEMALE_CAUTION_GRAMS / STANDARD_DRINK_GRAMS)
    high = Math.min(bacBasedHigh, Math.max(cautionDrinks, med + 1))
  }

  return { low, med, high }
}

/**
 * Get status label/color for a given BAC value.
 */
export function getBACStatus(bac) {
  if (bac < 0.02) return { level: 'sober', color: 'buzz-safe', message: 'Sober' }
  if (bac < 0.04) return { level: 'low', color: 'buzz-safe', message: 'Minimal effects' }
  if (bac < 0.06) return { level: 'buzzed', color: 'buzz-primary', message: 'Feeling it' }
  if (bac < 0.08) return { level: 'tipsy', color: 'buzz-warning', message: 'Tipsy — slow down' }
  if (bac < 0.10) return { level: 'over', color: 'buzz-danger', message: 'At legal limit — stop' }
  return { level: 'danger', color: 'buzz-danger', message: 'DANGER — stop immediately' }
}

/**
 * Returns grams of ethanol consumed (for risk assessment).
 */
export function totalEthanolGrams(totalStandardDrinks) {
  return totalStandardDrinks * STANDARD_DRINK_GRAMS
}

/**
 * Returns whether consumption exceeds the research-backed caution threshold.
 * Per nihms795582: >30g/day for females, >56g/day for males.
 */
export function exceedsCautionThreshold(totalStandardDrinks, gender) {
  const grams = totalEthanolGrams(totalStandardDrinks)
  const threshold = gender === 'female' ? FEMALE_CAUTION_GRAMS : MALE_CAUTION_GRAMS
  return grams > threshold
}
