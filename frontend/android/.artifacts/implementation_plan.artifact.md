# Fix Frame Resolution Issue

The user reported a "frame resolution" issue. Based on the UI inspection and logs, the app is currently not using the full screen (edge-to-edge), leaving black bars in the status and navigation bar areas. Additionally, the `targetSdkVersion` is set to 36 (Android 16), which is currently in preview and may cause unexpected behavior with window insets and resolution reporting.

## Proposed Changes

### Android Configuration

#### [MODIFY] [variables.gradle](file:///Users/pallabruidas/Documents/mejor project/frontend/android/variables.gradle)
- Lower `compileSdkVersion` and `targetSdkVersion` to 35 (Android 15) to ensure stability with current Capacitor and Android libraries.

#### [MODIFY] [MainActivity.java](file:///Users/pallabruidas/Documents/mejor project/frontend/android/app/src/main/java/com/spendpulse/app/MainActivity.java)
- Enable Edge-to-Edge support using `androidx.activity.EdgeToEdge`.
- Configure the window to allow content to flow behind the status and navigation bars.
- Set `windowLayoutInDisplayCutoutMode` to `LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES` to utilize the notch area.

#### [MODIFY] [styles.xml](file:///Users/pallabruidas/Documents/mejor project/frontend/android/app/src/main/res/values/styles.xml)
- Update `AppTheme` to be more compatible with edge-to-edge.

## Verification Plan

### Automated Tests
- Build the project using `./gradlew assembleDebug`.

### Manual Verification
- Deploy to the device and verify that the app content occupies the full screen, including the status bar and navigation bar areas.
- Verify that the layout inside the WebView correctly adapts to the new full-screen resolution.
