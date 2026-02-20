# routes.md — Page & Route Map

## Public Routes

```
/                     → Role select screen
                        Two buttons: "I'm a Farmer" | "I'm a Buyer"
                        No login required to view this screen.

/auth                 → Phone OTP login
                        Step 1: Enter phone number
                        Step 2: Enter OTP (Firebase sends SMS)
                        On success: redirect to /onboarding (new user) or /dashboard (returning user)
                        Role is passed as query param: /auth?role=farmer or /auth?role=buyer
```

---

## Farmer Routes

```
/onboarding           → Farmer setup (first login only)
                        Fields: name, district (dropdown), mandal (dropdown),
                        crop type(s) — multi-select max 3, variety, sown date,
                        field size (acres), soil type, language picker
                        Voice input mic on every text field
                        On submit: write to users + farmers collections → redirect to /dashboard

/dashboard            → Main farmer dashboard (P0 — most important screen)
                        Sections:
                        - Crop summary (type, variety, sown date, field size, expected quantity)
                        - Harvest countdown + recommended harvest window (Gemini Prompt 1)
                        - Viability badge (color-coded days remaining)
                        - Supply pressure indicator (Red/Yellow/Green + "Based on X farmers" label)
                        - Sell Decision panel with "Should I Sell Now?" button (Gemini Prompt 3)
                          - Factor breakdown table (7 rows)
                          - Decision prominently displayed
                          - Telugu reasoning below
                        - Post-harvest status tracker (tap to advance)
                        - Profit tracker (estimated vs actual ₹ delta)
                        Real-time Firestore listener — dashboard updates without refresh

/market               → Market prices page
                        - Line chart: mandi prices for farmer's crop, last 30/60/90 days (toggle)
                        - Current price vs MSP displayed side by side
                        - Supply heatmap: farmer count per mandal this week
                        - Buyer demand indicator per crop type
                        Falls back to static JSON if Agmarknet API unavailable

/marketplace          → Buyer listings for farmer
                        - Listings filtered to farmer's crop type + district
                        - Each listing shows: buyer name, crop, quantity, date, price per quintal
                        - MSP badge shown on any listing below MSP — Accept button disabled
                        - Accept button: creates match record in Firestore

/profile              → Farmer profile + settings
                        - Language toggle (Telugu / Hindi / English) — updates all labels <500ms
                        - Crop update
                        - Logout
```

---

## Buyer Routes

```
/buyer/dashboard      → Buyer main screen
                        - Post demand form: crop, variety, quantity, target date, price/quintal
                        - Below-MSP warning on form before submit if price < MSP
                        - List of posted listings with status (open / matched)
                        - View accepted matches: farmer name, quantity, date

/buyer/post-demand    → Post a new demand listing (can also be a modal on /buyer/dashboard)
```

---

## API Routes (not pages)

```
POST  /api/ai/harvest           → Gemini Prompt 1
POST  /api/ai/quantity          → Gemini Prompt 2
POST  /api/ai/sell              → Gemini Prompt 3
GET   /api/dashboard/summary    → Farmer dashboard data
GET   /api/market/prices        → Mandi price history
POST  /api/marketplace/accept   → Farmer accepts buyer listing
POST  /api/marketplace/post-demand → Buyer posts listing
```

---

## P1 Routes (Build Only If All P0 Done)

```
/transport            → Transport availability page
                        - Red/Yellow/Green truck availability per mandal
                        - Group saving card if 3+ farmers share route
                        - "I need transport" register button

/community            → Community updates feed
                        - Chronological feed of farmer posts
                        - FPO leader badge + pinned at top
                        - Voice post button (WebSpeech → transcribe → submit)
                        - Real-time Firestore listener (new posts appear in <3 seconds)
```

---

## Navigation Structure

```
Farmer:
  Bottom nav: Dashboard | Market | Marketplace | Profile

Buyer:
  Bottom nav: My Listings | Post Demand

Both:
  Language toggle accessible from Profile at all times
```
