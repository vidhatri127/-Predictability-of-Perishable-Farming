# INSTRUCTIONS.md — How to Run the Tool

This file is the exact instruction set to feed your agentic coding tool (Antigravity / Claude Code).
Read this file before starting. Follow the workflow exactly.

---

## Pre-Flight Checklist (Do Before Running the Tool)

Complete every item before invoking the tool. Skipping any will cause broken integrations mid-build.

- [ ] Firebase project created → Firestore enabled → Phone Auth enabled
- [ ] All Firebase config values copied to `.env.local`
- [ ] Gemini API key added to `.env.local`
- [ ] OpenWeatherMap API key added to `.env.local`
- [ ] Agmarknet static JSON file saved to `/public/fallback-data/mandi-prices.json`
- [ ] Static weather JSON saved to `/public/fallback-data/weather.json`
- [ ] Next.js project scaffolded: `npx create-next-app@latest harvesthub --typescript --tailwind --app`
- [ ] Dependencies installed: `npm install firebase next-intl chart.js react-chartjs-2`
- [ ] This `/docs` folder placed in project root
- [ ] Git repo initialized and pushed to GitHub
- [ ] Vercel connected to GitHub repo — get a live URL before Hour 3

---

## How to Invoke the Tool

Navigate to the project root, then start the tool:

```bash
cd harvesthub
claude     # or your tool's CLI command
```

---

## The Exact Prompt to Give It First

Copy and paste this exactly — do not paraphrase:

```
Read every file in the /docs folder carefully before writing a single line of code.

The files are:
- /docs/scope.md        — what to build and what to skip
- /docs/schema.md       — exact Firestore collections and field types
- /docs/api_contract.md — all API routes with input/output JSON
- /docs/routes.md       — every page and what it renders
- /docs/env.md          — environment variables and fallback behaviour
- /docs/ui_spec.md      — UI layout, components, and interaction rules
- /docs/auth_flow.md    — authentication system and session management

After reading all 7 files, confirm you understand the full scope by listing:
1. The P0 features you will build
2. The P1 features you will NOT build
3. The build order you will follow

Wait for my confirmation before writing any code.
```

---

## After It Confirms Understanding

Only proceed after it lists the correct P0 features and build order. If anything is wrong, correct it before starting.

Then say:

```
Confirmed. Begin with Step 1: Firebase initialization and phone OTP auth flow.

Rules:
- Complete each step fully before moving to the next
- Use hardcoded mock responses for all Gemini calls until Step 6
- Ask me before making any decision not covered in the /docs files
- Do not build any P1 features
- Do not invent new pages, fields, or API routes not in the spec
```

---

## Step-by-Step Commands (Use These One at a Time)

Run these commands in order. Wait for each step to be working before proceeding.

**Step 1 — Firebase + Auth:**
```
Build Step 1: Firebase initialization and phone OTP authentication.
Files to create: /lib/firebase.ts, /app/auth/page.tsx, /app/onboarding/page.tsx
Follow /docs/auth_flow.md exactly.
Include reCAPTCHA invisible verifier.
Include AuthProvider wrapping the root layout.
Test: I should be able to enter a phone number, receive OTP, and land on /dashboard.
```

**Step 2 — Firestore Seed Script:**
```
Build Step 2: Firestore schema and demo seed script.
File to create: /scripts/seed-firestore.ts
Follow /docs/schema.md exactly.
Seed data requirements are in /docs/scope.md under "Demo Data Requirements".
Include: 8 farmers Week 1 (RED), 2 farmers Week 2 (YELLOW), 1 farmer Week 3 (GREEN),
1 Cotton farmer with viability_days=2, 3 buyer listings, MSP values, 30-day price history.
Test: run the seed script and confirm all collections appear in Firebase console.
```

**Step 3 — Gemini Prompt Functions:**
```
Build Step 3: All 3 Gemini prompt functions in /lib/gemini.ts.
Follow /docs/api_contract.md for exact input/output JSON shapes.
Build API routes: /api/ai/harvest, /api/ai/quantity, /api/ai/sell.
For now, return hardcoded mock responses matching the exact output schema.
Add a flag MOCK_GEMINI=true — when true, return mocks. When false, call real API.
Test each endpoint with curl or Postman before wiring to frontend.
```

**Step 4 — Onboarding Page:**
```
Build Step 4: /onboarding page.
Follow /docs/ui_spec.md for layout and /docs/auth_flow.md for the Firestore writes.
Include VoiceInputButton on name, variety, and field size inputs.
Include all dropdowns: district, mandal, crop multi-select (max 3), soil type, language.
On submit: write to users + farmers collections, redirect to /dashboard.
```

**Step 5 — Farmer Dashboard (core):**
```
Build Step 5: /dashboard page — crop summary, viability badge, supply pressure indicator.
Follow /docs/ui_spec.md /dashboard section exactly.
Wire to GET /api/dashboard/summary.
Supply pressure must show "Based on X farmers in your mandal" — never quintals.
ViabilityBadge: Green >7 days, Yellow 3-7 days, Red <3 days.
EmergencyBanner: show if viability_days < 3.
Use real Firestore data from the seeded farmers collection.
Do NOT wire Gemini yet — leave AIBoxes showing loading spinner placeholder.
```

**Step 6 — Gemini Integration on Dashboard:**
```
Build Step 6: Wire all 3 Gemini prompts to the dashboard AIBoxes.
Still using MOCK_GEMINI=true for now.
Harvest Recommendation AIBox: calls /api/ai/harvest, displays window + reasoning.
Sell Decision AIBox: calls /api/ai/sell on button tap, shows decision + factor breakdown table.
Yield Estimate AIBox: calls /api/ai/quantity, shows estimated_quintals + range.
Loading spinner: show for up to 8 seconds. On timeout, show fallback text.
"Accept Recommendation" button: updates farmer harvestWeek in Firestore.
Test with viability_days=2 seed farmer: EmergencyBanner must show, emergency_sell must be true.
```

**Step 7 — Buyer Marketplace:**
```
Build Step 7: /marketplace page and /buyer/dashboard.
Follow /docs/ui_spec.md and /docs/api_contract.md.
POST /api/marketplace/accept: blocked if price < MSP (return below_msp error).
POST /api/marketplace/post-demand: sets isBelowMSP flag server-side.
MSPWarningBadge: show on any listing below MSP, disable Accept button.
Test: accept a valid offer → match record created in Firestore.
Test: try to accept a below-MSP offer → button disabled, badge visible.
```

**Step 8 — Market Prices Page:**
```
Build Step 8: /market page.
GET /api/market/prices wired to Agmarknet API.
If AGMARKNET_API_KEY is blank or API fails → load /public/fallback-data/mandi-prices.json silently.
Chart.js line chart with 30/60/90 day toggle (no page reload on toggle).
Show current price vs MSP side by side.
Supply heatmap: farmer count per mandal from harvest_calendar collection.
```

**Step 9 — Voice Input:**
```
Build Step 9: VoiceInputButton component and useVoiceInput hook.
File: /hooks/useVoiceInput.ts, /components/VoiceInput.tsx
Follow /docs/ui_spec.md VoiceInputButton spec exactly.
Recognition language matches app language: te-IN / hi-IN / en-IN.
Pulsing red mic icon while listening. Auto-stop after 5 seconds silence.
Live transcript in input field while speaking.
Fallback: if SpeechRecognition unavailable, hide button silently — no crash, no error.
Add VoiceInputButton to all text inputs on /onboarding.
```

**Step 10 — i18n:**
```
Build Step 10: next-intl multilingual setup.
Translation files: /public/locales/te.json, hi.json, en.json.
Every visible label, button, badge, and status text must use a translation key.
Language toggle on /profile: updates all visible text in <500ms, no page reload.
Gemini reasoning is already returned in selected language — just render it as-is.
Test: switch to Hindi on dashboard — all labels update without refresh.
```

**Step 11 — Live Gemini (Switch MOCK_GEMINI to false):**
```
Build Step 11: Switch from mock to live Gemini API.
Set MOCK_GEMINI=false in environment.
Test all 3 prompts with real calls.
Verify Telugu reasoning is returned in Telugu script (not transliterated).
Verify emergency override: set viability_days=2 → Prompt 1 must return emergency_sell=true.
Cache successful responses in ai_cache Firestore collection.
On repeat dashboard load: check cache first, only call API if cache is stale (>1 hour).
```

**Step 12 — Polish:**
```
Build Step 12: Final polish pass.
Loading states on every async operation.
Error states: never show raw errors — friendly messages only.
Mobile check: every page at 360px width — no horizontal scroll, no overflow.
Touch targets: every button/tap area minimum 48x48px.
Status tracker on dashboard: Harvested → Stored → Transported → Sold (tap to advance).
Profit tracker: appears after Sold status, lets farmer enter actual price, shows delta.
Deploy to Vercel and test on live URL.
```

---

## If the Tool Goes Off-Track

Use these recovery commands:

**If it starts building P1 features:**
```
Stop. We are not building [feature name] yet. 
Only P0 features are in scope. Return to the current step.
```

**If it invents fields or routes not in /docs:**
```
Stop. Do not add fields or routes not specified in /docs/schema.md and /docs/api_contract.md.
Revert this change and follow the spec exactly.
```

**If it breaks something while adding a new step:**
```
Stop all changes. What files did you modify in the last step?
Revert only those files. Do not touch anything else.
```

**If Gemini output format is wrong:**
```
The Gemini prompt must return strict JSON matching the schema in /docs/api_contract.md.
Add this instruction to the end of the prompt: "Return ONLY a JSON object. No markdown. No explanation. No code blocks."
```

---

## Git Discipline

Commit after every working step. Do not commit broken code.

```bash
git add .
git commit -m "Step X complete: [description]"
git push
```

If a step breaks everything, you can roll back:
```bash
git checkout HEAD~1
```

---

## Final Demo Check (Run Before Presentation)

Run through this exact sequence and verify each point works:

1. Open /dashboard as seeded Paddy farmer — supply pressure shows RED, "Based on 8 farmers"
2. Harvest Recommendation AIBox loads — date range visible, Telugu reasoning visible
3. Tap "Should I Sell Now?" — factor breakdown table appears, decision visible
4. Switch language to Hindi — all labels update without page reload
5. Open seeded Cotton farmer with viability_days=2 — EmergencyBanner shows at top
6. Open /marketplace — 3 buyer listings visible, MSP badge on any below-MSP listing
7. Accept a valid offer — match appears in buyer dashboard
8. Open /market — price chart loads (from fallback JSON if API unavailable)
9. Test voice input on /onboarding name field — speak in Telugu — transcript fills field
10. Deploy to Vercel — use live URL, never localhost for demo
