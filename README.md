# Explore X

AI travel planner: a signed-in user describes a trip, Gemini writes a day-by-day itinerary, and Firestore stores it.

## Local development

```bash
npm install
cd functions && npm install && cd ..
```

Copy the example env files. Do not commit real values.

```bash
copy .env.example .env
copy functions\.env.example functions\.env
```

Fill:

- `.env` with Firebase **web** config (`VITE_FIREBASE_*`)
- `functions/.env` with the server Gemini key (`GEMINI_API_KEY`)

Start the app (Vite also serves the local itinerary API):

```bash
npm run dev
```

Open http://localhost:5173/

Optional Functions emulator:

```bash
npm run emulators
```

Set `VITE_USE_FUNCTIONS_EMULATOR=true` in `.env` only while that emulator is running.

## Environment variables

### Frontend (Vite / Vercel)

| Variable | Purpose |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project id |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Messaging sender id |
| `VITE_FIREBASE_APP_ID` | Firebase app id |

These are public client identifiers. Restrict them in Google Cloud if needed.

### Backend (Firebase Cloud Functions)

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Server-only Gemini key |

Never prefix the Gemini key with `VITE_`. Never put it in React, HTML, or frontend hosting settings.

- Local: `functions/.env` (gitignored)
- Production: `firebase functions:secrets:set GEMINI_API_KEY`

`.env` is local only. `.env.example` and `functions/.env.example` are safe to commit.

## How itinerary generation works

- **Development:** the signed-in client posts to `/api/generate-itinerary`. The Vite plugin reads `GEMINI_API_KEY` from `functions/.env` and calls Gemini.
- **Production:** the client calls the Firebase callable `generateItinerary`. The function reads the `GEMINI_API_KEY` secret.

## Production deployment

1. Add the `VITE_FIREBASE_*` variables in the frontend host (this repo uses Vercel).
2. Build and deploy the frontend (`npm run build`, then Vercel or `firebase deploy --only hosting`).
3. Set the Gemini secret and deploy functions:

```bash
firebase functions:secrets:set GEMINI_API_KEY
firebase deploy --only functions
```

4. Deploy Firestore rules if they changed:

```bash
firebase deploy --only firestore
```

Do not deploy `.env` or `functions/.env`.
