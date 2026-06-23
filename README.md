# MechanicMate

Find the right auto part by vehicle or VIN, compare it across AutoZone, O'Reilly,
and Amazon, and pull up YouTube installation videos — all in one screen.

Built with React Native + Expo.

---

## Quick start

```bash
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone to test instantly.

If `npm install` complains about versions, run:

```bash
npx expo install --fix
```

---

## Before you build: two things to set

1. **Amazon affiliate tag** — open `App.js`, find the line near the top:
   ```js
   const AMAZON_AFFILIATE_TAG = 'YOUR-TAG-20';
   ```
   Replace it with your real Associates tag.

2. **Your app icons** — replace the placeholder files in `/assets`:
   - `icon.png` (1024×1024)
   - `adaptive-icon.png` (1024×1024, Android)
   - `splash.png`
   - `favicon.png`

   Use the **same pink "M" artwork** that's already on your Play Store listing,
   so the installed app and the listing match.

---

## ⚠️ IMPORTANT: package name must match your live app

The `android.package` value in `app.json` is currently:

```
com.dmorrison7195.mechanicmate
```

This **must exactly match** the package name of the app already published in your
Google Play Console. If it doesn't, Google will treat this as a brand-new app and
you won't be able to update the existing listing.

Check it in Play Console → your app → **Dashboard** (the package name is shown near
the top), or in your original `app.json` if you recover it from the old drive.
If they differ, change `app.json` to match Play Console — not the other way around.

---

## The store-listing rejection fix

Your app was rejected under the **Misleading Claims** policy because the installed
app name ("MechanicMate") didn't match the store listing name
("MechanicMate - Auto Parts Finder").

`app.json` here sets the name to **MechanicMate**. To clear the rejection:

1. Play Console → **Grow → Store presence → Main store listing**
2. Set **App name** to exactly: `MechanicMate`
3. Confirm the 512×512 listing icon matches the app icon
4. (Optional) Set the short description to:
   `Search auto parts and DIY repair videos fast, with built-in VIN lookup.`
5. **Publishing overview → send changes for review**

If the name was the only mismatch, this clears it **without a rebuild**.

---

## Building for the Play Store

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile production
```

The `production` profile produces an `.aab` for the Play Store.
The `preview` profile produces an `.apk` you can install directly for testing:

```bash
eas build --platform android --profile preview
```

---

## Back this up this time

Don't let it live on one laptop again:

```bash
git init
git add .
git commit -m "MechanicMate baseline"
```

Then push to a private GitHub repo. Your signing key already lives safely in your
Expo (EAS) account, so code + GitHub + EAS together means no single dead device
can wipe you out.
