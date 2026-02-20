# scope.md — HarvestHub MVP

## Stack
- Framework: Next.js 14 (App Router, TypeScript)
- Database: Firebase Firestore (real-time)
- Auth: Firebase Auth (Phone OTP only — no email, no password)
- AI: Gemini API (3 separate prompt endpoints)
- Weather: OpenWeatherMap API (with static JSON fallback)
- Market Prices: Agmarknet API (with static JSON fallback)
- Voice Input: WebSpeech API (browser-native, no SDK)
- Charts: Chart.js + react-chartjs-2
- Styling: Tailwind CSS + shadcn/ui
- i18n: next-intl (Telugu default, Hindi, English)
- Hosting: Vercel

---

## What to Build (P0 Only)

Build a Telangana farmer coordination dashboard that does exactly this:

1. Phone OTP login — farmer and buyer roles
2. Farmer onboarding — collect name, district, mandal, crop type(s), variety, sown date, field size, soil type, language
3. Farmer dashboard showing:
   - Crop info + harvest countdown
   - Viability status badge (days remaining, color-coded)
   - Supply pressure indicator (Red/Yellow/Green — based on farmer count, NOT quintals)
   - Fairness label: "Based on X farmers in your mandal" — always show this exact label
   - Gemini Harvest Recommendation (Prompt 1) — date range + Telugu reasoning
   - Gemini Sell Decision panel (Prompt 3) — 7-factor breakdown
   - Post-harvest status tracker (Harvested → Stored → Transported → Sold)
   - Profit tracker (estimated vs actual price)
4. Buyer marketplace — farmers see buyer listings filtered by crop type, MSP enforcement blocks below-MSP acceptance
5. Market prices page — mandi price chart (30/60/90 day toggle), supply heatmap, buyer demand indicator
6. Buyer dashboard — post demand listings, view accepted matches
7. Voice input on all text fields (WebSpeech API, matches selected language)
8. Multilingual toggle — Telugu/Hindi/English, updates all labels within 500ms

---

## Supported Crops
Paddy, Cotton, Maize, Turmeric, Red Chilli

## Target Districts
Warangal, Nizamabad, Karimnagar, Nalgonda, Khammam

---

## What NOT to Build (P1 — Skip Unless All P0 Done)
- Transport coordination page
- Community updates feed
- Offline mode / service workers
- Push notifications
- Payment processing
- Real FPO account management
- Crop disease detection

---

## Demo Data Requirements (Seed Before Demo)
- 8 farmer accounts: Warangal mandal, Week 1 harvest (creates RED supply pressure for Paddy)
- 2 farmer accounts: Week 2 harvest (YELLOW)
- 1 farmer account: Week 3 harvest (GREEN)
- 1 Cotton farmer with viability_days = 2 (triggers emergency alert for demo)
- 3 buyer listings: Paddy ₹2300/qtl, Cotton ₹7200/qtl, Red Chilli ₹8500/qtl
- 30-day mandi price history for Warangal and Nizamabad APMCs
- MSP values seeded in Firestore

---

## Build Order (Follow Exactly)
1. Firebase init + Firestore schema + phone OTP auth
2. Seed script — all demo data
3. Gemini prompt functions (all 3, tested in isolation with hardcoded inputs first)
4. Farmer onboarding page
5. Farmer dashboard — crop info, viability badge, supply pressure, fairness label
6. Gemini integration on dashboard (Prompt 1 harvest rec + Prompt 3 sell decision)
7. Buyer marketplace with MSP enforcement
8. Market prices page (mandi chart + fallback)
9. Buyer dashboard + post demand form
10. Voice input (WebSpeech hook + mic component on all text fields)
11. i18n — Telugu default, Hindi + English toggle
12. Polish — loading states, error states, mobile responsiveness

> Use hardcoded/mocked AI responses through step 6. Integrate live Gemini only after dashboard renders correctly with mock data.
