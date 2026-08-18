# 📱 SpendPulse Multi-Device Installation Guide

SpendPulse is built as an **Offline-First Progressive Web App (PWA)**, allowing you to install and run it as a native standalone app across **iOS (iPhone/iPad)**, **Android**, **Windows**, **macOS**, and **Linux** with zero app store delays.

---

## 📲 Option 1: Install on Your Mobile Device (Same Wi-Fi)

1. Make sure your phone/tablet is connected to the same Wi-Fi network as your computer.
2. Open your mobile browser and visit:
   ```
   http://192.168.0.102:3000
   ```
   *(Or replace `192.168.0.102` with your machine's local network IP).*

### 🍎 On iPhone & iPad (Safari):
1. Open the URL in **Apple Safari**.
2. Tap the **Share button** (square with an upward arrow ⎋) in the bottom toolbar.
3. Scroll down and tap **"Add to Home Screen"** (⊕).
4. Tap **Add**. SpendPulse will appear with its custom icon on your iOS home screen!

### 🤖 On Android (Chrome / Brave / Edge / Samsung Internet):
1. Open the URL in **Google Chrome**.
2. Tap the **three dots menu (⋮)** in the top right.
3. Tap **"Install App"** or **"Add to Home screen"**.
4. SpendPulse will be installed to your application drawer and home screen.

---

## 💻 Option 2: Install on Desktop (Windows, Mac, Linux)

### On Google Chrome / Microsoft Edge / Brave:
1. Open `http://localhost:3000` (or your deployed URL).
2. Look at the right side of the address bar for the **Install App icon** (💻 or ⊕).
3. Click **Install**.
4. The app will launch in its own standalone window with taskbar/dock integration.

### On macOS Safari:
1. Open the URL in Safari.
2. In the top macOS menu bar, click **File > Add to Dock**.
3. SpendPulse will now open directly from your macOS Dock.

---

## 📦 Option 3: Export Standalone Native Apps (Capacitor / Electron)

If you want to package SpendPulse into a distributable `.apk` (Android) or `.exe`/`.dmg` (Desktop):

### 1. Build the production web bundle:
```bash
cd frontend
npm run build
```

### 2. Wrap with Capacitor for Android APK / iOS IPA:
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init SpendPulse com.spendpulse.app --web-dir=dist
npx cap add android
npx cap open android
```
This opens the project in Android Studio, where you can generate a signed `.apk` file for direct installation on any Android phone.

### 3. Wrap with Electron for Desktop (.exe / .dmg / .deb):
```bash
npm install electron electron-builder --save-dev
```
