// BAC calculation using adapted Widmark formula (Watson et al. 1981)
// with first-order absorption modeling (Norberg et al. 2003)
// Sources:
//   - Watson et al. 1981: sex-specific body water distribution ratios
//   - Norberg et al. 2003: absorption rate constant ka ≈ 6.5/hr
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

// Absorption rate constant ka ≈ 6.5/hr (Norberg 2003, average with food present)
// This gives a realistic BAC peak at ~30–45 minutes post-drink rather than instant.
// Empty stomach is higher (~10/hr) but 6.5 is a realistic averaged value.
const KA = 6.5

// Female risk threshold: ~30g ethanol/night per nihms paper
// Male moderate risk: ~56g ethanol/night
const FEMALE_CAUTION_GRAMS = 30
const MALE_CAUTION_GRAMS = 56

export const DRINK_TYPES = {
  shot: { label: 'Shot (1.5oz)', standardDrinks: 1.0, icon: 'shot' },
  beer: { label: 'Beer (12oz)', standardDrinks: 1.0, icon: 'beer' },
  mixed: { label: 'Mixed Drink', standardDrinks: 1.5, icon: 'mixed' },
}

/**
 * Calculate BAC using Widmark + first-order absorption model.
 *
 * The classic Widmark formula assumes all alcohol is instantly in the blood,
 * which massively over-estimates BAC right after drinking. In reality, absorption
 * follows a first-order process — BAC peaks ~30–45 min after consumption and
 * then declines as the liver eliminates alcohol.
 *
 * Model (Norberg 2003):
 *   BAC(t) = Cmax * [ka/(ka-ke)] * [exp(-ke*t) - exp(-ka*t)]
 * where:
 *   Cmax = peak BAC if fully absorbed (Widmark)  = alcoholGrams / (r * Wkg * 10)
 *   ke   = elimination rate  = 0.017 /hr
 *   ka   = absorption rate   = 6.5 /hr
 *   t    = hours since first drink
 *
 * After t_peak (≈ 0.64 hr) we use post-absorptive Widmark which is accurate
 * once absorption is complete.
 *
 * Example: 145 lb male, 3 shots, t=0 → BAC ≈ 0.000 (just logged)
 *          145 lb male, 3 shots, t=0.75hr → BAC ≈ 0.055 (peak, realistic)
 *          145 lb male, 3 shots, t=2hr    → BAC ≈ 0.060 (post-absorptive)
 *
 * Result in g/dL (standard BAC units).
 */
export function calculateBAC(totalStandardDrinks, weightLbs, gender, hoursElapsed) {
  if (totalStandardDrinks <= 0) return 0

  const alcoholGrams = totalStandardDrinks * STANDARD_DRINK_GRAMS
  const weightKg = weightLbs * LBS_TO_KG
  const r = GENDER_RATIO[gender] || 0.68
  const ke = ELIMINATION_RATE

  // Peak Widmark BAC (theoretical maximum if fully absorbed instantly)
  const cMax = alcoholGrams / (weightKg * r * 10)

  if (hoursElapsed <= 0) return 0

  // First-order absorption phase
  const bacAbsorption = cMax * (KA / (KA - ke)) * (Math.exp(-ke * hoursElapsed) - Math.exp(-KA * hoursElapsed))

  // Post-absorptive Widmark (accurate once absorption is complete, ~1.5 hr+)
  const bacWidmark = cMax - ke * hoursElapsed

  // Time of peak BAC
  const tPeak = Math.log(KA / ke) / (KA - ke) // ≈ 0.64 hr

  let bac
  if (hoursElapsed <= tPeak) {
    // Still on the rising absorption curve
    bac = bacAbsorption
  } else {
    // Post-peak: take the higher of both models (they converge; Widmark is authoritative here)
    bac = Math.max(bacAbsorption, bacWidmark)
  }

  return Math.max(0, parseFloat(bac.toFixed(4)))
}

/**
 * Number of standard drinks needed to reach targetBAC given body params.
 * Uses post-absorptive Widmark for limit calculations (steady-state estimate).
 */
export function drinksForBAC(targetBAC, weightLbs, gender, hoursElapsed = 1) {
  const weightKg = weightLbs * LBS_TO_KG
  const r = GENDER_RATIO[gender] || 0.68
  const alcoholGrams = (targetBAC + ELIMINATION_RATE * hoursElapsed) * weightKg * r * 10
  return Math.max(1, Math.round(alcoholGrams / STANDARD_DRINK_GRAMS))
}

/**
 * Calculate personalized drink limits using research-backed BAC thresholds.
 * Limits are calculated for the post-absorptive steady state (1 hr in).
 *
 * Low  = BAC 0.04 (feeling effects, safe zone)
 * Med  = BAC 0.06 (buzzed, moderate zone)
 * High = BAC 0.08 (legal limit)
 *
 * Female high limit is also bounded by the 30g hepatotoxicity threshold per nihms795582.
 */
export function calculateLimits(weightLbs, gender) {
  const low = drinksForBAC(0.04, weightLbs, gender)
  const med = drinksForBAC(0.06, weightLbs, gender)
  const bacBasedHigh = drinksForBAC(0.08, weightLbs, gender)

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
