# App Store Submission Checklist — what Srujan needs to log into / provide

Check each item off. Items marked **[CLAUDE CAN DO]** I'll handle; items marked **[YOU]** require your credentials or human judgement.

## 1. Accounts you MUST have
| # | Account | Cost | Link | Status |
|---|---|---|---|---|
| 1 | **Apple ID** with 2FA | free | appleid.apple.com | likely done |
| 2 | **Apple Developer Program** membership | **$99 / yr** | developer.apple.com/programs/enroll | **[YOU]** enroll if not already |
| 3 | **App Store Connect** access (auto after #2) | included | appstoreconnect.apple.com | **[YOU]** sign in once |
| 4 | **App Store Connect API Key** (for fastlane automation) | free | appstoreconnect.apple.com/access/api | **[YOU]** create, see §3 |
| 5 | Apple Developer Team ID — `G4H29PDG94` is already in your project | — | — | done |

## 2. What to do in App Store Connect (one-time, ~15 min)
1. Sign in → **My Apps** → **+** → **New App**
2. Platform: **iOS**; Name: **Tipsy**; Primary language: **English (U.S.)**
3. Bundle ID: select `com.tipsy.app` (appears after you register it in developer.apple.com → Identifiers — fastlane can do this too)
4. SKU: `tipsy-ios-001`
5. User Access: Full Access
6. Fill in the metadata from `fastlane/metadata.md`
7. Upload 5 screenshots (see metadata.md § Screenshots)
8. Host a **Privacy Policy URL** — required; Apple blocks submission without one
9. Answer App Privacy + Age Rating questionnaires (answers drafted in metadata.md)

## 3. App Store Connect API Key (enables `fastlane deliver` / `pilot`)
1. appstoreconnect.apple.com/access/api → **Keys** tab
2. Click **+**, name it `fastlane-tipsy`, access: **App Manager**
3. Download the `.p8` file **immediately** (you only get one chance)
4. Copy three values you'll need:
   - **Issuer ID** (top of page, UUID)
   - **Key ID** (10-char alphanumeric)
   - The `.p8` file contents
5. Hand me all three (paste into chat or save to `fastlane/.api_key.json`) and I'll wire up fastlane

## 4. CLIs being installed on your machine
| CLI | What it does | How I install it |
|---|---|---|
| `cocoapods` | native iOS dependency manager, needed by RN | `gem install cocoapods` |
| `fastlane` | automates archive + TestFlight upload | `gem install fastlane` |
| `xcodebuild` | ships with Xcode 26 — already present | — |
| `rsvg-convert` + `sips` | used to generate app icons | already present |

## 5. Optional but recommended
- **TestFlight external testers** (up to 10,000, no Apple review for internal builds) — set up after first upload
- **Transporter.app** — Mac App Store, GUI fallback for uploading `.ipa` if fastlane misbehaves
- **App Store screenshot frames** — use `fastlane frameit` or Figma templates

## 6. Android / Play Store (not this pass)
Play Store requires:
- Google Play Developer account — **$25 one-time**
- A different set of store metadata + icons
Ignore until iOS ships.

## 7. Things blocking first TestFlight build (current status)
- [x] iOS bundle id set (`com.tipsy.app`)
- [x] Development team set (`G4H29PDG94`)
- [x] Version 1.0, build 1
- [x] App icons generated
- [x] Info.plist permissions / encryption-exempt flag set
- [ ] CocoaPods installed + `pod install` in `ios/`  *(installing now)*
- [ ] Fastlane installed + configured  *(installing now)*
- [ ] App Store Connect listing created  **[YOU]**
- [ ] API key generated + shared with fastlane  **[YOU]**
- [ ] Privacy policy hosted at a URL  **[YOU]**
- [ ] 5 screenshots captured from simulator  **[YOU or I can draft layouts]**
- [ ] First archive + TestFlight upload  *(fastlane will do this)*
