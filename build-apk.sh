#!/bin/bash
set -e

echo "=========================================="
echo "  SpendPulse Android APK Build Automation  "
echo "=========================================="

cd "$(dirname "$0")/frontend"

echo "1. Building frontend production bundle..."
npm run build

echo "2. Synchronizing web assets with native Android project..."
npx cap sync android

echo ""
echo "=========================================="
echo "✅ Android Project is fully synchronized!"
echo "=========================================="
echo ""
echo "To generate the .apk file:"
echo "👉 Option A: Open Android Studio and click 'Build > Build APK(s)':"
echo "   npx cap open android"
echo ""
echo "👉 Option B: Compile directly via Gradle (requires JDK 17+):"
echo "   cd android && ./gradlew assembleDebug"
echo "   Output APK location: android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
