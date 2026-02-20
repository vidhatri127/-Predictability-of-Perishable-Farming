# env.md — Environment Variables

Create a `.env.local` file in the project root with these keys.
Never commit `.env.local` — add it to `.gitignore`.
Commit `.env.example` (same keys, empty values) so teammates know what's needed.

---

## .env.local

```
# ─── Firebase ───────────────────────────────────────────
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# ─── Gemini ─────────────────────────────────────────────
GEMINI_API_KEY=

# ─── OpenWeatherMap ─────────────────────────────────────
OPENWEATHER_API_KEY=

# ─── Agmarknet ──────────────────────────────────────────
# Leave blank if unavailable — static fallback will load automatically
AGMARKNET_API_KEY=
```

---

## Variable Reference

| Variable | Used In | Notes |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `/lib/firebase.ts` | Prefixed NEXT_PUBLIC — exposed to client, this is safe for Firebase |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `/lib/firebase.ts` | e.g. `yourproject.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `/lib/firebase.ts` | e.g. `harvesthub-prod` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `/lib/firebase.ts` | e.g. `yourproject.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `/lib/firebase.ts` | From Firebase console |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `/lib/firebase.ts` | From Firebase console |
| `GEMINI_API_KEY` | `/lib/gemini.ts` | Server-side only — never prefix with NEXT_PUBLIC |
| `OPENWEATHER_API_KEY` | `/lib/weather.ts` | Server-side only |
| `AGMARKNET_API_KEY` | `/lib/mandi.ts` | Server-side only. If blank, fallback JSON loads automatically |

---

## Fallback Behaviour

If `AGMARKNET_API_KEY` is blank or API call fails:
→ Load `/public/fallback-data/mandi-prices.json` silently. No error shown to user.

If `OPENWEATHER_API_KEY` is blank or API call fails:
→ Load `/public/fallback-data/weather.json` silently. No error shown to user.

If `GEMINI_API_KEY` is blank or Gemini call fails:
→ Return last cached response from `ai_cache` Firestore collection.
→ If no cache exists, return static conservative fallback message.
→ Never show a raw API error to the user.

---

## Vercel Setup

Add all variables from `.env.local` to Vercel project settings under:
Settings → Environment Variables → Production + Preview

Deploy early. Test that env vars are live on Vercel before Hour 3.
