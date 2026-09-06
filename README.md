# Explore X

Plan Smarter. Travel Better. Explore More. ✈️

Explore X is an AI-powered travel planner built for Indian travelers. It turns your destination, dates, budget, interests, accommodation, and transportation preferences into a personalized day-by-day itinerary using Google Gemini.

**Live demo:** [explore-x-chi.vercel.app](https://explore-x-chi.vercel.app/)

**Repository:** [github.com/Prince-Agrahari/explore-x](https://github.com/Prince-Agrahari/explore-x)

## Preview

<img width="2560" height="1332" alt="image" src="https://github.com/user-attachments/assets/76b74905-0c06-46af-9993-4e0e1a28ca71" />
<img width="2526" height="1330" alt="image" src="https://github.com/user-attachments/assets/6e1435c8-2dab-4034-a963-07696477367c" />
<img width="2506" height="1334" alt="image" src="https://github.com/user-attachments/assets/264cfa04-1631-4676-9b5f-364933dc66a8" />
<img width="2528" height="1600" alt="image" src="https://github.com/user-attachments/assets/cd74dbb5-190a-4b63-b0fa-3f4fddae62b3" />
<img width="2526" height="1600" alt="image" src="https://github.com/user-attachments/assets/00a2d047-19da-47b5-af77-fa1cd0856319" />


## Implemented

### Frontend (React + Vite + Tailwind CSS)

- AI-powered travel planning interface
- Landing page with hero, how it works, sample itinerary, destinations, and CTA sections
- Email/password and Google authentication
- 3-step trip creation wizard
- Destination and travel date selection
- INR-based budget planning
- Traveler count and interest selection
- Accommodation and transportation preferences
- Optional trip notes
- AI-generated day-by-day itinerary
- Trip dashboard with saved trips
- Trip details and itinerary view
- Edit and regenerate existing trips
- Delete trips
- Download itinerary as `.txt`
- Responsive design for desktop, tablet, and mobile
- Local Indian destination imagery with safe image handling

### AI & Backend (Firebase Cloud Functions + Gemini)

- Firebase Cloud Functions v2
- Secure server-side Gemini integration
- Google Gemini via `@google/genai`
- Structured JSON itinerary generation
- Response schema validation
- INR-based estimated activity and trip costs
- Authentication-aware itinerary generation
- Firebase callable `generateItinerary` function
- Local development API through Vite plugin
- Secure Gemini API key management through Firebase Functions secrets

### Database & Authentication

- Firebase Authentication
- Email/password authentication
- Google Sign-In
- Firebase Firestore
- User-specific trip storage
- Owner-based Firestore security rules
- Authenticated trip access

## How It Works

```text
User Preferences
      ↓
Trip Wizard
      ↓
Explore X Backend
      ↓
Google Gemini
      ↓
Structured Itinerary
      ↓
Firebase Firestore
      ↓
Saved Trip
Tech Stack
Layer	Technologies
Frontend	React 19, Vite 6, React Router 7, Tailwind CSS 4
UI	React Icons, Newsreader, Outfit
Backend	Firebase Cloud Functions v2, Node.js 22
AI	Google Gemini, @google/genai
Database	Firebase Firestore
Authentication	Firebase Authentication
Deploy	Vercel, Firebase
Project Structure
src/
├── components/          # Reusable UI components
├── pages/               # Application pages and routes
├── firebase/            # Firebase configuration
└── utils/               # AI, itinerary, currency and trip utilities

functions/
├── index.js             # Cloud Functions entry point
├── gemini.js            # Gemini integration
├── itinerary.js         # Itinerary validation
└── secrets.js           # Server-side secrets

public/
└── images/
    └── travel/          # Local destination imagery

firestore.rules          # Firestore security rules
firebase.json            # Firebase configuration
vite-plugin-itinerary.js # Local itinerary API
Getting Started
Prerequisites
Node.js 22+
Firebase project
Firebase CLI
Google Gemini API key
Install
npm install

cd functions
npm install
cd ..
Environment

Create .env in the project root:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

Create functions/.env:

GEMINI_API_KEY=

Never commit .env or functions/.env.

Run
npm run dev

Frontend runs on:

http://localhost:5173
Build
npm run build
Firebase Setup

Enable the following authentication providers in Firebase:

Email/Password
Google

Add the required authorized domains for local development and the deployed Vercel application.

Deployment
Frontend

Deploy the Vite application to Vercel and configure the VITE_FIREBASE_* environment variables.

Firebase Functions

Configure the Gemini secret:

firebase functions:secrets:set GEMINI_API_KEY

Deploy:

firebase deploy --only functions

If Firestore rules are updated:

firebase deploy --only firestore
Roadmap / Future
AI travel assistant for conversations about an existing trip
Smart activity replacement using Gemini
Advanced INR budget breakdown and optimization
AI-powered trip optimization
Interactive trip maps
Weather-aware itinerary planning
AI-generated packing lists
Professional PDF itinerary export
Shareable trip links
Collaborative trip planning
Design
Canvas: Cream
Text: Charcoal
Accent: Terracotta
Display Font: Newsreader
UI Font: Outfit
Currency: INR (₹)
Security
Gemini API key is server-side only
No VITE_GEMINI_* variables
Firebase Authentication protects user accounts
Firestore rules enforce trip ownership
API credentials are never committed to the repository

License
Apache License 2.0
