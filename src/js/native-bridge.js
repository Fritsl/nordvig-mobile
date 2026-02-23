/**
 * Nordvig Mobile — Native Bridge
 *
 * Runs inside the Capacitor WebView. Handles:
 * - Push notification registration (FCM token → server)
 * - Deep link handling (share URLs open in-app)
 * - App lifecycle events
 * - Status bar styling
 */

import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

// Only run on native platforms (not in browser)
if (Capacitor.isNativePlatform()) {
  initNativeBridge();
}

async function initNativeBridge() {
  // --- Status bar ---
  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === "android") {
      await StatusBar.setBackgroundColor({ color: "#ffffff" });
    }
  } catch {}

  // --- Push notifications ---
  try {
    const permStatus = await PushNotifications.requestPermissions();
    if (permStatus.receive === "granted") {
      await PushNotifications.register();
    }
  } catch (err) {
    console.warn("Push registration failed:", err);
  }

  // On successful registration, send token to server
  PushNotifications.addListener("registration", async (token) => {
    try {
      await fetch("/owner/api/push-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.value,
          platform: Capacitor.getPlatform(), // "ios" or "android"
        }),
      });
    } catch (err) {
      console.warn("Failed to register push token:", err);
    }
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error:", err);
  });

  // Notification received while app is in foreground
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    // App is already open — no action needed, messages arrive via WebSocket
    console.log("Push received in foreground:", notification);
  });

  // User tapped a notification
  PushNotifications.addListener("pushNotificationActionPerformed", (action) => {
    // Navigate to chat (WebView is already showing /owner)
    if (window.location.pathname !== "/owner") {
      window.location.href = "/owner";
    }
  });

  // --- Deep links (share URLs) ---
  App.addListener("appUrlOpen", (data) => {
    // e.g. https://nordvig.ai/contact/john-doe → navigate in WebView
    if (data.url) {
      try {
        const url = new URL(data.url);
        window.location.href = url.pathname + url.search;
      } catch {
        window.location.href = data.url;
      }
    }
  });

  // --- App state (foreground/background) ---
  App.addListener("appStateChange", (state) => {
    if (state.isActive) {
      // Returning to foreground — WebSocket will auto-reconnect if needed
      console.log("App returned to foreground");
    }
  });
}
