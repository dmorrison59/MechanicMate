# 🔧 MechanicMate

**Find the right part. Track your maintenance. Watch someone install it.**

MechanicMate turns "what part do I even need?" into a 30-second answer.
Pick your vehicle — or just type your VIN — tap the part, and shop it
across the major auto retailers or jump straight to a how-to video.

---

## ✨ Features

- 🚗 **Vehicle lookup** — Year → Make → Model, with models pulled live
  from the free NHTSA vPIC API (no more guessing your exact trim).
- 🔍 **VIN decoder** — enter your 17-character VIN and instantly get
  year, make, model, engine, fuel type, and drivetrain.
- 🛒 **One-tap shopping** — search the part at AutoZone, O'Reilly,
  Amazon, and RockAuto in one place.
- ▶️ **Install videos** — jumps straight to YouTube how-to guides for
  your exact vehicle + part.
- 🏠 **My Garage** — save your vehicles for one-tap access later.
- 📋 **Maintenance log** — track oil changes, brakes, and 8 other
  services with mileage + date history that survives app restarts.

## 🛠 Tech Stack

- **React Native** + **Expo SDK 52**
- **AsyncStorage** for local persistence (no backend, no accounts)
- **[NHTSA vPIC API](https://vpic.nhtsa.dot.gov/api/)** — free U.S. DOT
  vehicle data, no API key required

## 🚀 Quick Start

```bash
npm install
npx expo start