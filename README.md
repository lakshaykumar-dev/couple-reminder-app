# Couple Reminder App 💕

A real-time couple collaborative task and reminder app built with **React Native TypeScript** for Android, powered by **Firebase Firestore**.

---

## 🌟 Key Features

1. **Top Tabs Navigation & Dynamic Categories**
   - Preloaded with: 🛒 **Grocery**, 🧹 **Chores**, 🍷 **Date Night**, ⏰ **Reminders**.
   - Create custom tabs anytime with custom emoji icons (e.g. 🎬 Movie Night, ✈️ Weekend Trip).
   - Real-time tab sync: when one partner adds a tab, it appears on the other partner's screen immediately.
   - Dynamic badges displaying the count of uncompleted tasks per tab.

2. **Real-time Firestore Collaboration**
   - Powered by Firestore `onSnapshot` real-time listeners.
   - When Partner A adds "Almond Milk (2x)", Partner B sees it appear instantly without refreshing.
   - Checking an item off displays who completed it (e.g., *"Done by Lakshay ✨"*).

3. **In-App Real-time Partner Alerts**
   - Listens to partner events in real time.
   - When the partner adds or checks off an item, an animated notification banner drops down from the top:
     *"Partner checked off 'Avocados' in Grocery"*.

4. **Shared Couple Space Pairing**
   - Both phones connect via a shared **Space ID** (e.g., `our-happy-space` or `lakshay-home`).
   - Tap the 🔗 Space pill in the header to switch or join a new shared code.
   - Set your display name so your partner knows who added each item.

---

## 📱 How to Run on Android (CLI)

### Prerequisites
- Node.js (v20+)
- Android SDK installed & `adb` configured
- Connected Android device or emulator with USB debugging enabled

### Run Development Build
```bash
# In project root (CoupleReminderApp)
npm start

# In another terminal window:
npm run android
```

### Build Debug APK
```bash
cd android
.\gradlew.bat assembleDebug
```
The APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔒 Firebase Configuration

Connected to Firestore using the credentials configured in `src/config/firebase.ts` (project: `lens-of-lakshay`).

### Firestore Data Model
```text
couples/
  └── {coupleId}/
        ├── tabs/
        │     └── {tabId}/
        │           ├── name: "Grocery"
        │           ├── icon: "🛒"
        │           └── items/
        │                 └── {itemId}: { text, quantity, isCompleted, addedBy, completedBy, createdAt }
        └── activity/
              └── {activityId}: { message, author, timestamp }
```
