# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

MechanicMate is a single-screen React Native + Expo app. Users pick a vehicle (year/make/model via chips, or raw VIN) and then tap a part category; a bottom-sheet modal opens with deep-link buttons that open AutoZone, O'Reilly, Amazon, and YouTube search results in the device browser.

There are no API calls, no backend, no authentication, and no navigation library. All logic lives in `App.js`.

## Commands

```bash
npm install          # install dependencies
npx expo start       # start dev server; scan QR with Expo Go to test on device
npx expo start --android   # open in Android emulator
npx expo start --ios       # open in iOS simulator (macOS only)
```

If dependency version conflicts appear:
```bash
npx expo install --fix
```

### Production builds (EAS)

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview      # .apk for direct install/testing
eas build --platform android --profile production   # .aab for Play Store
```

The `production` profile has `autoIncrement: true`, so `versionCode` in `app.json` increments automatically on each EAS build.

## Key configuration before shipping

- **Amazon affiliate tag** — `App.js` line 20: `const AMAZON_AFFILIATE_TAG = 'YOUR-TAG-20';` — replace with real Associates tag.
- **Android package name** — `app.json` `android.package` is `com.mechanicmate.app`. This **must match** the package name in Google Play Console exactly or Google treats it as a new app.
- **App icons** — replace placeholder files in `/assets`: `icon.png` (1024×1024), `adaptive-icon.png` (1024×1024), `splash.png`, `favicon.png`.

## Architecture

`App.js` is the entire application. Key sections:

| Lines | Content |
|-------|---------|
| 20 | `AMAZON_AFFILIATE_TAG` config constant |
| 26–57 | Static data: `YEARS`, `MAKES`, `PART_CATEGORIES` (id, label, icon emoji, search term) |
| 59–115 | State and logic: mode toggle, `vehicleString()`, `hasVehicle()`, URL builders (`searchAutoZone`, `searchOReilly`, `searchAmazon`, `searchYouTube`) |
| 116–295 | JSX: header → mode toggle → vehicle/VIN card → vehicle banner → parts grid → action modal |
| 297–410 | `StyleSheet.create(...)` — dark navy theme (`#0F172A` bg, `#F97316` orange accent) |

**Search URL pattern:** Each retailer function builds a query string from `vehicleString() + part.term`, encodes it, and opens a deep-link URL via `Linking.openURL`. Amazon appends the affiliate tag as `&tag=`.

**Parts grid → modal flow:** Tapping a part card calls `openPart(part)`, which sets `selectedPart` state and shows the `Modal`. The modal reads `selectedPart` to populate its title and pass the part to each action button handler.

**VIN mode:** Requires at least 11 characters before `hasVehicle()` returns true. The VIN string is passed directly as the vehicle identifier in search queries instead of year/make/model.

## Play Store notes

- The store-listing name must be exactly `MechanicMate` (not "MechanicMate - Auto Parts Finder") to match the installed app name set in `app.json`.
- Current production build is versionCode 5; EAS production builds auto-increment it.
- EAS project ID: `a47b7ea0-c6b9-4ae8-998b-9217dc417a38`.

### Known past rejections

- **versionCode 4** — rejected because a babel dependency was missing from the build.
- **Icon mismatch** — rejected because the icon in `app.json` didn't match the icon on the Play Console listing. The 512×512 listing icon and `adaptive-icon.png` must match visually.

## Source control

Source is backed up to a private GitHub repo. The previous laptop died and source was lost entirely once before. **After any significant change, remind David to `git push` to GitHub.**
