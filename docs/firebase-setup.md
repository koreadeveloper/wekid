# Firebase Setup

This project uses Firebase from the browser client for the first MVP:

- Firebase Web SDK
- Cloud Firestore
- Firebase Authentication
- Vite environment variables
- Local fallback when Firebase is not configured

Cloud Functions, Admin SDK, service account JSON, private keys, BigQuery, and paid-only features are intentionally not part of this first setup.

## What The Code Handles

- `src/lib/firebase.ts` initializes Firebase App, Firestore, and Auth only when every `VITE_FIREBASE_*` value is present.
- If Firebase is not configured, the app keeps rendering and result saving is skipped safely.
- `src/lib/centerContext.ts` reads `?centerName=` or `?center=` from the URL and normalizes center grouping keys.
- `src/lib/resultStorage.ts` writes completed quiz results to `testResults`.
- `src/lib/adminAuth.ts` checks the signed-in user's `admins/{uid}` document.
- `src/pages/admin/AdminPage.tsx` provides an owner-only dashboard with filters and CSV export.
- `firestore.rules` contains the MVP security rules.

## Local `.env.local`

Create `.env.local` locally. Do not commit it.

```bash
VITE_FIREBASE_API_KEY=your_web_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

`measurementId` is optional and is not used by the current app.

## Firebase Console Checklist

### 1. Web App

Register a Firebase Web App and copy the config values into `.env.local`.

### 2. Firestore Database

1. Open Firestore Database.
2. Create the database in production mode.
3. Pick the region carefully.
4. Paste `firestore.rules` into the Rules tab and publish.

### 3. Authentication

1. Open Authentication.
2. Enable Email/Password login.
3. Create the first owner account.

### 4. First Admin Document

After creating the Authentication user, copy that user's UID.

Path:

```text
admins/{uid}
```

Fields:

```text
email: "admin@example.com"
role: "owner"
createdAt: Firestore server timestamp
```

Allowed roles:

- `owner`: can open the dashboard and read all `testResults`
- `admin`: reserved for a future narrower role; the current dashboard requires `owner`

Do not store passwords in Firestore.

## Center Name Flow

The MVP does not require an `institutions` collection.

Users can enter a center name directly on the start screen. The app stores:

- `centerName`: display value, such as `강남 청소년센터`
- `centerKey`: normalized grouping value, such as `강남 청소년센터`
- `centerSource`: `url`, `manual`, or `none`

Supported URL parameters:

```text
?centerName=강남청소년센터
?center=강남청소년센터
```

If both are present, `centerName` wins. Users can edit the prefilled value. Edited values are saved with `centerSource: "manual"`.

## `testResults` Document Shape

```text
participantName: string | null
centerName: string | null
centerKey: string | null
centerSource: "url" | "manual" | "none"
startedAt: timestamp
completedAt: timestamp
answers: array
scores: object
topCareer: object or string
recommendedCareers: array
resultSummary: string
createdAt: timestamp
schemaVersion: 1
```

## Admin Dashboard

Open the app and choose `관리자` in the top navigation.

The dashboard supports:

- Email/password login
- Owner role check through `admins/{uid}`
- Total/recent result count
- Center filter
- Date filter
- Top career distribution
- Individual result list
- CSV export

## Local Verification

Without `.env.local`, the app should still build and render:

```bash
npm run build
```

With `.env.local`, completed quiz results should be written to Firestore. If saving fails, the result page still renders and shows a small non-blocking status message.
