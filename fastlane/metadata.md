# Tipsy — App Store Metadata (Draft)

## Basics
- **App name:** Tipsy
- **Subtitle (30 char max):** Drink tracker. Stay social.
- **Bundle ID:** com.tipsyios.app
- **SKU:** tipsy-ios-001
- **Primary category:** Health & Fitness
- **Secondary category:** Lifestyle
- **Age rating:** 17+ (Frequent/Intense Alcohol, Tobacco, or Drug Use or References)
- **Price:** Free
- **Availability:** All countries where alcohol-related apps are permitted (exclude Saudi Arabia, Iran, etc. — App Store Connect will prompt you)

## Promotional Text (170 char max — editable without new build)
A clean, social drink tracker. Log what you drink, watch calories and spending, pace your night, and check in with friends. Tipsy is a tracker — not a sobriety meter.

## Description (4000 char max)
Tipsy is a personal drink-tracking journal for nights out.

Log your drinks in two taps from a curated list of 30+ presets backed by USDA beverage data and brand nutrition labels — or build your own custom drink. See your calorie totals, your spending, your pace, and your weekly and monthly trends in a clean, glanceable interface.

Tipsy does not estimate blood alcohol content, intoxication, sobriety, or fitness to drive. It is a logging and education tool, not a medical or safety device. Never drive after drinking — when in doubt, use the in-app ride-share shortcut.

FEATURES
• Two-tap drink logging with 30+ presets (beer, wine, spirits, cocktails, seltzers, sake, cider)
• Custom drink builder with oz, ABV and calorie inputs
• Real-time pace indicator (drinks per hour) with friendly slow-down nudges
• Session-limit goal — set a max drinks per night and see your progress
• Calorie equivalents — see every drink in food and exercise units
• Weekly and monthly insights with calories and spending breakdown
• Sober-streak tracker with achievement badges
• Last-call countdown with one-tap Uber and Lyft shortcuts
• Hangover-risk educational tip based on the drinks you logged
• Hydration tracker with a "one water per drink" target
• Group leaderboards — track nights out with friends you add
• Native share sheet for sharing your session summary
• Drink of the day and rotating alcohol-education facts
• Sign in with Apple, Sign in with Google, or email
• In-app account deletion (Settings → Delete Account)

PRIVACY
Your data stays yours. Account data and drink history are stored in your private Firebase account. We do not sell data. We do not show ads. We do not use third-party analytics. Sign in with Apple is supported and lets you keep your email private via Apple's private relay.

DISCLAIMER
Tipsy is for tracking and education only. The app does not measure or estimate intoxication, blood alcohol content, sobriety, or fitness to drive. No software-only app can do that accurately. Never drive under the influence — when in doubt, use the in-app Safe Ride button.

Must be 21+ (US) or of legal drinking age in your country.

## Keywords (100 char max, comma-separated)
drink,tracker,alcohol,calories,hangover,sober,bar,uber,lyft,pacing,streak,night,party,journal,social

## URLs (you'll need to host these)
- **Support URL:** https://tipsy.app/support  (or any page with contact info — a simple GitHub Pages site works)
- **Marketing URL (optional):** https://tipsy.app
- **Privacy Policy URL (REQUIRED):** https://htmlpreview.github.io/?https://gist.githubusercontent.com/Srujyama/1d83663fc4526847f6fa28b83ce74c88/raw/index.html

## Privacy Policy — Required Sections
Your policy must cover:
- What Firebase collects (auth email, drink log timestamps, friend group membership)
- That data is stored in Firestore (Google) and governed by Google's DPA
- No third-party analytics/ads
- Data deletion: user can delete account in-app from Settings → Delete Account
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
1. Track screen — drinks logged tonight, std drinks, calories, spend, pace indicator
2. Home / Dashboard with sober streak + drink of day
3. Leaderboard / Social group view
4. Weekly stats with calories and spending breakdown
5. Settings — account deletion + Sign in with Apple visible on the auth screen

Capture via iOS Simulator: Device > iPhone 16 Pro Max, Cmd+S saves to Desktop.

## Review notes to Apple (inside App Store Connect > App Review Information)
```
Tipsy is a personal drink-tracking journal. It does NOT estimate blood
alcohol content, intoxication, sobriety, or fitness to drive — there is
no BAC gauge, no BAC timeline, and no BAC math anywhere in the app.
The app logs drinks, totals calories and spending, surfaces a simple
"drinks per hour" pace indicator, and gives users an in-app shortcut
to Uber/Lyft. Disclaimers on the Track and Home screens make this
explicit ("Tipsy is a tracking tool, not a sobriety meter. Never drive
after drinking.").

Login services:
- Sign in with Apple (primary; satisfies Guideline 4.8 — limits data to
  name + email, supports private email relay, no advertising tracking)
- Sign in with Google
- Email + password

Account deletion:
- Available in-app at Settings → Delete Account
- Two-step confirmation
- Removes the user's profile, drinks, friends, group memberships, and
  alerts from Firestore, then deletes the Firebase Auth user

Test account (for Apple review):
  email:    review@tipsy.app
  password: TipsyReview2026!
```
(You must create this test user in Firebase Auth before submitting.)
