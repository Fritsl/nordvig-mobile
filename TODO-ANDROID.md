# Android Development Handover

> **For AI agents:** Read this entire document before starting work. It contains everything needed to build, deploy, and debug the Nordvig Messenger Android app.

## Quick Start — Connect to Device and Deploy

### 1. Pair with the Android phone (wireless ADB)

The phone is a **Pixel 8 Pro** running **Android 16** in **Danish**.

On the phone, navigate:

```
Indstillinger → System → Udviklerindstillinger → Trådløs fejlretning
```

If Udviklerindstillinger is not visible:

```
Indstillinger → Om telefon → Buildnummer (tryk 7 gange)
```

Inside Trådløs fejlretning, tap:

```
Par enhed med parringskode
```

This shows a **6-digit code** and an **IP:port**. Both are needed.

### 2. Pair and install

```bash
# Pair (enter the 6-digit code when prompted)
/Users/frits/Library/Android/sdk/platform-tools/adb pair <IP>:<PORT> <<< "<CODE>"

# Verify connection
/Users/frits/Library/Android/sdk/platform-tools/adb devices

# The device appears as: adb-38231FDJG00766-dUyd1t._adb-tls-connect._tcp

# Install the APK (use the device ID from `adb devices`)
/Users/frits/Library/Android/sdk/platform-tools/adb -s <DEVICE_ID> install -r android/app/build/outputs/apk/debug/app-debug.apk

# Force-stop and relaunch
/Users/frits/Library/Android/sdk/platform-tools/adb -s <DEVICE_ID> shell am force-stop ai.nordvig.messenger
/Users/frits/Library/Android/sdk/platform-tools/adb -s <DEVICE_ID> shell am start -n ai.nordvig.messenger/.MainActivity
```

**Note:** Wireless pairing codes expire quickly. The wireless connection also drops after a while — just re-pair when needed. The pairing IP is always `192.168.1.31` but the port changes each time.

### 3. View logs

```bash
# All Capacitor-related logs
/Users/frits/Library/Android/sdk/platform-tools/adb -s <DEVICE_ID> logcat -d | grep -iE "Capacitor|Console"

# Clear and watch live
/Users/frits/Library/Android/sdk/platform-tools/adb -s <DEVICE_ID> logcat -c
/Users/frits/Library/Android/sdk/platform-tools/adb -s <DEVICE_ID> logcat | grep -iE "Capacitor|Console"
```

---

## Build Commands

```bash
cd /Users/frits/Documents/GitHub/nordvig-mobile

# Sync Capacitor → Android project (after changing capacitor.config.ts or web assets)
npx cap sync android

# Build debug APK
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  ./android/gradlew -p android assembleDebug

# Output APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

**Important:** Must use Android Studio's bundled JDK 21 via the JAVA_HOME override. The system Java (OpenJDK 25) is too new for Gradle.

---

## Architecture

### How the app works

This is a **Capacitor WebView wrapper** around the server-rendered web UI at `https://nordvig.ai/owner`. There is no local UI framework (no React, no Vue). The WebView loads the remote URL directly.

- **UI updates** deploy via the server — no app store release needed
- **Native features** (push notifications, deep links, status bar) use Capacitor plugins
- **Push registration** is handled by JS code in the **server-side** HTML (`owner-dashboard-html.ts`), not in the mobile app's local JS

### Key files

| File | Purpose |
|------|---------|
| `capacitor.config.ts` | App ID, remote URL, plugin config |
| `android/app/src/main/java/ai/nordvig/messenger/MainActivity.java` | WindowInsets padding (SDK 35 edge-to-edge fix) |
| `android/app/src/main/res/values/styles.xml` | Theme: white status/nav bars, dark icons |
| `android/app/google-services.json` | Firebase config (in .gitignore — local only) |
| `src/js/native-bridge.js` | Local bridge (NOT used in remote URL mode — see note below) |
| `src/index.html` | Loading screen shown while WebView loads remote URL |

### Push notifications — how the bridge works

The `native-bridge.js` in this repo is **not active** in remote URL mode. When the WebView navigates to `https://nordvig.ai/owner`, the local page context is replaced.

Instead, the push registration code lives in the **server repo**:

```
nordvig-server/src/routes/owner-dashboard-html.ts
```

Look for the `// --- Native app push (Capacitor) ---` section. It:
1. Checks `window.Capacitor?.isNativePlatform()`
2. Registers listeners for `registration`, `registrationError`, `pushNotificationActionPerformed`
3. Calls `PushNotifications.requestPermissions()` → `PushNotifications.register()`
4. Sends the FCM token to `POST /owner/api/push-token`

Capacitor auto-injects its JS bridge into the WebView, so `window.Capacitor` and `window.Capacitor.Plugins` are available on the remote page.

### Android 15+ edge-to-edge

`targetSdkVersion = 35` enforces edge-to-edge — the app draws behind system bars. `MainActivity.java` uses the standard `ViewCompat.setOnApplyWindowInsetsListener()` to apply system bar + display cutout insets as padding on the root view. The root background is set to `Color.WHITE` so the padding area matches the app's white header.

---

## Firebase / FCM Setup (DONE)

- **Firebase project:** `nordvig-67b25` (display name: "nordvig")
- **Android app ID:** `1:178654354155:android:9abe76970881f34f247cae`
- **Package:** `ai.nordvig.messenger`
- **FCM API:** Enabled
- **Server env:** `GOOGLE_FCM_SERVICE_ACCOUNT_JSON` set on Railway
- **google-services.json:** Downloaded to `android/app/` (in .gitignore)

If `google-services.json` is lost, regenerate:
```bash
npx firebase-tools apps:sdkconfig ANDROID 1:178654354155:android:9abe76970881f34f247cae \
  --project nordvig-67b25 \
  -o android/app/google-services.json
```

---

## Environment Requirements

| Tool | Location | Notes |
|------|----------|-------|
| Android Studio | `/Applications/Android Studio.app` | Installed via Homebrew |
| Android SDK | `/Users/frits/Library/Android/sdk` | platforms;android-35, build-tools;35.0.1 |
| JDK 21 | Android Studio bundled (`/Applications/Android Studio.app/Contents/jbr/Contents/Home`) | Must use this, not system Java |
| adb | `/Users/frits/Library/Android/sdk/platform-tools/adb` | Not on PATH — use full path |
| Firebase CLI | `npx firebase-tools` | Not globally installed — use npx |
| Node.js | System | Required for Capacitor CLI |
| Bun | System | Used by nordvig-server, not needed for mobile |

---

## What's Done

- [x] Capacitor project scaffolded with Android platform
- [x] Firebase project created, Android app registered
- [x] google-services.json downloaded and working
- [x] FCM service account key generated and set on Railway
- [x] Push notification registration working end-to-end
- [x] Edge-to-edge handled via WindowInsets (SDK 35 standard)
- [x] White status/nav bars with dark icons
- [x] Debug APK builds and runs on Pixel 8 Pro

## What's Next

- [x] **App icons** — Bold dark "N" (Arial Black) on white, generated at all densities via Python+Pillow
- [ ] **Splash screen** — Currently shows dark screen with "NORDVIG" text; could use branded splash
- [ ] **Release keystore** — Create signing key for Play Store (`keytool -genkey ...`)
- [ ] **Release build** — `assembleRelease` with ProGuard/R8 minification
- [ ] **Google Play Developer account** — Register ($25 one-time fee)
- [ ] **Play Store listing** — Screenshots, description, privacy policy URL, content rating (IARC)
- [ ] **Internal testing track** — Upload first AAB to Play Console for testing
- [ ] **Deep linking** — Set `ANDROID_CERT_FINGERPRINT` env var on server (from release keystore)
- [ ] **iOS** — Add iOS platform, Apple Developer account ($99/yr), Xcode build

## Server-Side Endpoints (Mobile-Relevant)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/owner/api/push-token` | POST | Register native FCM device token |
| `/owner/api/push-token` | DELETE | Unregister token |
| `/owner/api/consent` | POST | AI consent (required before chat) |
| `/owner/api/report-message` | POST | Content reporting (required by app stores) |
| `/.well-known/assetlinks.json` | GET | Android App Links (deep linking) |
| `/.well-known/apple-app-site-association` | GET | iOS Universal Links |

## Gotchas

1. **adb is not on PATH** — Always use the full path: `/Users/frits/Library/Android/sdk/platform-tools/adb`
2. **System Java is too new** — Must set `JAVA_HOME` to Android Studio's bundled JDK 21 for Gradle
3. **google-services.json is gitignored** — Contains API keys. Must be present locally for builds. Regenerate with the firebase CLI command above.
4. **Wireless ADB drops** — Re-pair when the connection times out. Codes expire in ~60 seconds.
5. **native-bridge.js is dead code in remote mode** — All native bridge logic must go in the server's HTML. The Capacitor bridge JS is auto-injected into the WebView.
6. **Don't use npm for global installs** — Permission denied on `/usr/local/lib`. Use `npx` instead.
