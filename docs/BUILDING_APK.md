# 🤖 How to Build SpendPulse Android APK (`.apk`)

SpendPulse includes native Android support powered by **Capacitor**. You can generate an installable Android `.apk` file using any of the three methods below.

---

## ⚡ Method 1: Generate APK via Android Studio (Recommended)

1. Navigate to the `frontend/` directory:
   ```bash
   cd frontend
   ```
2. Build and sync the latest web code:
   ```bash
   npm run build
   npx cap sync android
   ```
3. Open the Android project in Android Studio:
   ```bash
   npx cap open android
   ```
4. In Android Studio:
   - Go to top menu: **Build > Build Bundle(s) / APK(s) > Build APK(s)**
   - Once the build finishes, click the **"locate"** popup link.
   - Your installable APK will be ready at:
     ```
     frontend/android/app/build/outputs/apk/debug/app-debug.apk
     ```
5. Transfer this `app-debug.apk` file to any Android phone (via USB, WhatsApp, Google Drive, or email) and tap to install!

---

## 🛠 Method 2: Generate APK via Command Line (Terminal)

If you have Java (JDK 17+) installed on your machine:

```bash
cd frontend/android
./gradlew assembleDebug
```

The output file is generated at:
```
frontend/android/app/build/outputs/apk/debug/app-debug.apk
```

---

## 🌐 Method 3: Instant Cloud WebAPK (Zero Software Required)

If you do not have Android Studio or Java installed on your computer:

1. Deploy your frontend to any free static host (Vercel, Netlify, Cloudflare Pages, or GitHub Pages) — see [docs/DEPLOYMENT.md](DEPLOYMENT.md).
2. Visit **[PWABuilder.com](https://www.pwabuilder.com)** (Microsoft/Google official open-source PWA packager).
3. Enter your deployed URL and click **Start**.
4. Click **Package for Stores > Android > Download APK Package**.
5. PWABuilder builds and downloads a signed `.apk` file directly to your downloads folder in 30 seconds!

---

## 📱 How to Install the `.apk` on Android Phones

1. Send the `app-debug.apk` file to your Android phone (via WhatsApp, Telegram, Bluetooth, Google Drive, or USB).
2. Tap on the `.apk` file on your phone.
3. If prompted, enable **"Allow installation from this source"** in your phone's security settings.
4. Tap **Install**.
5. SpendPulse is now installed as a native Android app on your device!
