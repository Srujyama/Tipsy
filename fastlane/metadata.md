# Tipsy — App Store Metadata (Draft)

## Basics
- **App name:** Tipsy
- **Subtitle (30 char max):** Drink smart. Stay social.
- **Bundle ID:** com.tipsyios.app
- **SKU:** tipsy-ios-001
- **Primary category:** Health & Fitness
- **Secondary category:** Lifestyle
- **Age rating:** 17+ (Frequent/Intense Alcohol, Tobacco, or Drug Use or References)
- **Price:** Free
- **Availability:** All countries where alcohol-related apps are permitted (exclude Saudi Arabia, Iran, etc. — App Store Connect will prompt you)

## Promotional Text (170 char max — editable without new build)
Track your night with style. Real-time BAC, hangover risk, sober streaks, and smart pacing — all in a luxury interface. Drink aware, ride home safe.

## Description (4000 char max)
Tipsy is your pocket concierge for a better night out.

Know exactly where you stand with a live Blood Alcohol Content gauge, personalized to your body mass and backed by USDA beverage data for 30+ common drinks. See your BAC rise and fall on an hour-by-hour timeline, so the next round is always an informed decision.

FEATURES
• Real-time BAC gauge with projected sober time
• Hangover risk predictor across 7 factors (hydration, pacing, sleep, food, ABV mix, total volume, duration)
• Smart drink recommendations based on your current session
• Drink pacing alerts before you overshoot your goal
• Last-call countdown with one-tap Uber / Lyft home
• Calorie equivalents — see every drink in food and exercise units
• Sober streak tracker with achievement badges
• Weekly and monthly insights with spending breakdown
• Custom drink creator + 30 preset drinks with ABV and calorie data
• Hydration tracker with water reminders
• Group leaderboards — track nights out with friends
• Session sharing via your native share sheet
• Drink of the day + rotating alcohol education facts
• Personal BAC reference table

PRIVACY
Your data stays yours. Session history is stored in your private Firebase account. We do not sell data. We do not show ads.

DISCLAIMER
Tipsy provides estimates only. BAC readings depend on body chemistry, food intake, medications, and other factors that no app can measure precisely. Never drive under the influence — when in doubt, use the in-app Safe Ride button.

Must be 21+ (US) or of legal drinking age in your country.

## Keywords (100 char max, comma-separated)
drink,tracker,bac,alcohol,calculator,hangover,sober,calories,bar,uber,lyft,pacing,streak,night,party

## URLs (you'll need to host these)
- **Support URL:** https://tipsy.app/support  (or any page with contact info — a simple GitHub Pages site works)
- **Marketing URL (optional):** https://tipsy.app
- **Privacy Policy URL (REQUIRED):** https://htmlpreview.github.io/?https://gist.githubusercontent.com/Srujyama/1d83663fc4526847f6fa28b83ce74c88/raw/index.html

## Privacy Policy — Required Sections
Your policy must cover:
- What Firebase collects (auth email, drink log timestamps, friend group membership)
- That data is stored in Firestore (Google) and governed by Google's DPA
- No third-party analytics/ads
- Data deletion: user can delete account from Settings screen
- Contact email for data requests (your email)

Generator suggestion: termly.io or privacypolicies.com — takes 5 min, free tier works.

## App Privacy "Nutrition Label" answers (App Store Connect questionnaire)
- **Contact Info > Email Address:** Yes, linked to user, used for App Functionality (auth)
- **User Content > Other User Content:** Yes, linked to user, used for App Functionality (drink logs, custom drinks)
- **Identifiers > User ID:** Yes, linked to user, used for App Functionality (Firebase UID)
- **Usage Data:** No (unless you add analytics)
- **Diagnostics:** No (unless you add Crashlytics)
- Tracking: **No** (you are not tracking users across other companies' apps)

## Age Rating Questionnaire answers (trigger 17+)
- Alcohol, Tobacco, or Drug Use or References: **Frequent/Intense** → yields 17+
- Everything else: None
- Unrestricted web access: No
- Gambling: No

## Required screenshots (upload in App Store Connect)
You need at least one set of the following sizes. The 6.9" iPhone set covers most devices via scaling:
- **6.9" iPhone (iPhone 16 Pro Max):** 1290 × 2796 px — REQUIRED
- **6.5" iPhone (iPhone 11 Pro Max):** 1242 × 2688 px — REQUIRED for older OS support
- **iPad 13" (if supporting iPad):** 2064 × 2752 px — only if iPad support is enabled

Suggested 5 shots, in order:
1. BAC Gauge + Timeline (Track screen in mid-session)
2. Home / Dashboard with streak + drink of day
3. Leaderboard / Social group view
4. Weekly stats + calorie equivalents
5. Hangover risk + Safe Ride prompt

Capture via iOS Simulator: Device > iPhone 16 Pro Max, Cmd+S saves to Desktop.

## Review notes to Apple (inside App Store Connect > App Review Information)
```
Tipsy is a personal drink-tracking utility. It does not sell, promote,
or facilitate the purchase of alcohol. BAC values are estimates only and
shown with a visible disclaimer on every session. The app requires users
to acknowledge they are of legal drinking age during onboarding.

Test account (for Apple review):
  email:    review@tipsy.app
  password: TipsyReview2026!

Third-party logins (Google Sign-In) work with the test account above.
```
(You must create this test user in Firebase Auth before submitting.)
