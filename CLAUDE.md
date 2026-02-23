# Nordvig Mobile

## What This Is

Capacitor wrapper that loads the Nordvig.ai web messenger (`https://nordvig.ai/owner`) in a native WebView. Provides native push notifications (FCM), deep linking for share URLs, and app store distribution.

## Architecture

This is a **thin native shell** — all UI and logic lives on the server at nordvig.ai. The mobile app adds:
- Native push notifications (FCM for Android, APNs via FCM for iOS)
- Deep linking (share URLs open in the app instead of browser)
- App store presence (Google Play, Apple App Store)
- Native status bar and splash screen

## File Map

```
capacitor.config.ts     # WebView config → https://nordvig.ai/owner
src/
  index.html            # Fallback loading screen (shown briefly)
  js/
    native-bridge.js    # Push registration, deep links, app lifecycle
assets/                 # Icon source files
android/                # Android Studio project (Capacitor-generated)
ios/                    # Xcode project (Capacitor-generated, Phase 2)
```

## How to Run

```bash
# Install dependencies
npm install

# Add Android platform (first time only)
npx cap add android

# Build and sync
npm run cap:sync

# Open in Android Studio
npm run cap:open:android

# Or run directly on connected device
npm run cap:run:android
```

## Conventions

- **Runtime:** Node.js (Capacitor CLI requires Node, not Bun)
- **Bundle ID:** ai.nordvig.messenger
- **Server URL:** https://nordvig.ai/owner (loaded in WebView)
- **Push:** FCM HTTP v1 API — server-side in nordvig-server/src/lib/push.ts
- **Deep links:** /.well-known/assetlinks.json (Android) and apple-app-site-association (iOS) served by nordvig-server

## Git Workflow (MANDATORY)

Same as nordvig-server — commit with descriptive messages + Co-Authored-By trailer after each logical unit of work. Push to origin.
