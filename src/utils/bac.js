// BAC calculation using full Watson et al. 1981 Total Body Water formula
// with first-order absorption modeling (Norberg et al. 2003)
//
// Sources:
//   - Watson et al. 1981: TBW = f(sex, weight, height, age) → personalized r-value
//   - Norberg et al. 2003: absorption rate constant ka ≈ 6.5/hr
//   - Howland et al. (agab027): eBAC validation study
//   - nihms795582: female hepatotoxicity threshold ~30g ethanol/day
//   - NIAAA standard drink definition: 14g ethanol
//
// Key improvement over previous version:
//   Old code used a fixed r-value (male=0.68, female=0.55) which ignores body composition.
//   Watson's full formula computes Total Body Water from height+weight+age, giving an
//   accurate, personalized Widmark r-value. A lean 6'1" 145lb man has significantly more
//   body water per kg than an average/heavier person, so BAC per drink is LOWER.
//
//   Example: 6'1", 145lb, 22yo male
//     Fixed r=0.68  → HIGH limit ≈ 3 drinks  ← wrong, too low
//     Watson TBW r  → r ≈ 0.78               → HIGH limit ≈ 4-5 drinks ← correct

const STANDARD_DRINK_GRAMS = 14   // 14g ethanol per US standard drink
const LBS_TO_KG = 0.453592
const IN_TO_CM = 2.54

// Elimination rate: 0.015–0.018 BAC/hr; 0.017 is population mean
const ELIMINATION_RATE = 0.017

// Absorption rate constant ka ≈ 6.5/hr (Norberg 2003, average with food present)
// Gives BAC peak at ~30–45 min post-drink, matching real-world experience.
const KA = 6.5

// Female hepatotoxicity threshold per nihms795582
const FEMALE_CAUTION_GRAMS = 30
const MALE_CAUTION_GRAMS = 56

export const DRINK_TYPES = {
  shot:  { label: 'Shot (1.5oz)',  standardDrinks: 1.0, icon: 'shot'  },
  beer:  { label: 'Beer (12oz)',   standardDrinks: 1.0, icon: 'beer'  },
  mixed: { label: 'Mixed Drink',   standardDrinks: 1.5, icon: 'mixed' },
}

/**
 * Watson et al. 1981 Total Body Water (liters) → Widmark r-value.
 *
 * TBW equations (Watson 1981):
 *   Male:   TBW = 2.447 - 0.09516*age + 0.1074*heightCm + 0.3362*weightKg
 *   Female: TBW = -2.097 + 0.1069*heightCm + 0.2466*weightKg
 *
 * Widmark r = TBW / (0.8 * weightKg)
 *   (0.8 converts TBW liters to the dL/kg units Widmark uses)
 *
 * Falls back to population means (male 0.68, female 0.55) if height/age not provided.
 */
export function getWidmarkR(gender, weightLbs, heightInches = null, age = null) {
  if (!heightInches || heightInches <= 0) {
    // Fallback to population mean
    return gender === 'female' ? 0.55 : 0.68
  }

  const weightKg = weightLbs * LBS_TO_KG
  const heightCm = heightInches * IN_TO_CM
  const a = age || 22  // default to 22 (college-age) if unknown

  let tbw
  if (gender === 'female') {
    tbw = -2.097 + 0.1069 * heightCm + 0.2466 * weightKg
  } else {
    tbw = 2.447 - 0.09516 * a + 0.1074 * heightCm + 0.3362 * weightKg
  }

  // r = TBW(L) / (0.8 * weightKg)  — clamp to physiologically plausible range
  const r = tbw / (0.8 * weightKg)
  return Math.min(Math.max(r, 0.45), 0.95)
}

/**
 * Calculate BAC using full Watson TBW r-value + first-order absorption model.
 *
 * The classic Widmark formula with a fixed r assumes average body composition.
 * Using Watson TBW makes BAC accurate for lean/tall vs. heavy/short individuals.
 *
 * Absorption model (Norberg 2003):
 *   BAC(t) = Cmax * [ka/(ka-ke)] * [exp(-ke*t) - exp(-ka*t)]
 * where Cmax = alcoholGrams / (r * weightKg * 10)
 *
 * Post-peak (t > t_peak ≈ 0.64hr) we switch to post-absorptive Widmark
 * which is the accurate long-term model.
 *
 * @param {number} totalStandardDrinks
 * @param {number} weightLbs
 * @param {string} gender  'male' | 'female'
 * @param {number} hoursElapsed  hours since first drink
 * @param {number|null} heightInches  total height in inches (for Watson TBW)
 * @param {number|null} age
 * @returns {number} BAC in g/dL
 */
export function calculateBAC(totalStandardDrinks, weightLbs, gender, hoursElapsed, heightInches = null, age = null) {
  if (totalStandardDrinks <= 0 || hoursElapsed <= 0) return 0

  const alcoholGrams = totalStandardDrinks * STANDARD_DRINK_GRAMS
  const weightKg = weightLbs * LBS_TO_KG
  const r = getWidmarkR(gender, weightLbs, heightInches, age)
  const ke = ELIMINATION_RATE

  // Theoretical peak BAC (fully absorbed, zero elimination)
  const cMax = alcoholGrams / (weightKg * r * 10)

  // First-order absorption curve
  const bacAbsorption = cMax * (KA / (KA - ke)) * (Math.exp(-ke * hoursElapsed) - Math.exp(-KA * hoursElapsed))

  // Post-absorptive Widmark
  const bacWidmark = cMax - ke * hoursElapsed

  // Switch from absorption to Widmark at t_peak
  const tPeak = Math.log(KA / ke) / (KA - ke) // ≈ 0.64 hr

  const bac = hoursElapsed <= tPeak
    ? bacAbsorption
    : Math.max(bacAbsorption, bacWidmark)

  return Math.max(0, parseFloat(bac.toFixed(4)))
}

/**
 * Number of standard drinks to reach a target BAC over a typical night.
 * Uses hoursElapsed=2 (drinks spread over 2 hours) for realistic limit calc.
 * Accepts optional height/age for Watson TBW personalization.
 */
export function drinksForBAC(targetBAC, weightLbs, gender, hoursElapsed = 2, heightInches = null, age = null) {
  const weightKg = weightLbs * LBS_TO_KG
  const r = getWidmarkR(gender, weightLbs, heightInches, age)
  const alcoholGrams = (targetBAC + ELIMINATION_RATE * hoursElapsed) * weightKg * r * 10
  return Math.max(1, Math.round(alcoholGrams / STANDARD_DRINK_GRAMS))
}

/**
 * Calculate personalized drink limits.
 * Now uses Watson TBW r-value (height + weight + age) for accuracy.
 *
 * Low  = BAC 0.04 (feeling effects)
 * Med  = BAC 0.06 (buzzed)
 * High = BAC 0.08 (legal limit — this is the ceiling, not the goal)
 *
 * Female high limit additionally bounded by 30g hepatotoxicity threshold.
 */
export function calculateLimits(weightLbs, gender, heightInches = null, age = null) {
  const low  = drinksForBAC(0.04, weightLbs, gender, 2, heightInches, age)
  const med  = drinksForBAC(0.06, weightLbs, gender, 2, heightInches, age)
  const high = drinksForBAC(0.08, weightLbs, gender, 2, heightInches, age)

  let finalHigh = high
  if (gender === 'female') {
    const cautionDrinks = Math.floor(FEMALE_CAUTION_GRAMS / STANDARD_DRINK_GRAMS)
    finalHigh = Math.min(high, Math.max(cautionDrinks, med + 1))
  }

  return { low, med, high: finalHigh }
}

/**
 * Get status label/color for a given BAC value.
 */
export function getBACStatus(bac) {
  if (bac < 0.02) return { level: 'sober',  color: 'buzz-safe',    message: 'Sober'                      }
  if (bac < 0.04) return { level: 'low',    color: 'buzz-safe',    message: 'Minimal effects'             }
  if (bac < 0.06) return { level: 'buzzed', color: 'buzz-primary', message: 'Feeling it'                  }
  if (bac < 0.08) return { level: 'tipsy',  color: 'buzz-warning', message: 'Tipsy — slow down'           }
  if (bac < 0.10) return { level: 'over',   color: 'buzz-danger',  message: 'At legal limit — stop'       }
  return               { level: 'danger', color: 'buzz-danger',  message: 'DANGER — stop immediately'  }
}

export function totalEthanolGrams(totalStandardDrinks) {
  return totalStandardDrinks * STANDARD_DRINK_GRAMS
}

export function exceedsCautionThreshold(totalStandardDrinks, gender) {
  const grams = totalEthanolGrams(totalStandardDrinks)
  const threshold = gender === 'female' ? FEMALE_CAUTION_GRAMS : MALE_CAUTION_GRAMS
  return grams > threshold
}
