# HarvestHub UI Specification
# Visual Reference: Agrio Design System (ui_images_.pdf)

Figma Reference: (paste your Figma link here before running the tool)

The frontend must strictly follow this layout AND the Agrio visual language shown in the reference PDF.
Do not invent new pages, sidebars, or desktop layouts.
This is a mobile-first Android web app for farmers with low tech literacy.

---

## AGRIO VISUAL LANGUAGE — READ THIS FIRST

The entire app must feel like the Agrio reference design. Study these rules before writing a single component.

### What Agrio Looks Like (from reference PDF)

```
PAGE 1 — Hero / Landing:
  - Pure white background (#FFFFFF)
  - Massive, ultra-bold black headline text (font-weight: 900, tracking tight)
  - Gray body text below headline — lightweight, centered, restrained
  - Green CTA: solid dark-green circular arrow button next to CTA label
  - Top nav: logo left, text nav links centered, auth buttons right (pill shape)
  - Extreme whitespace — let content breathe

PAGE 2 — Full-bleed image section:
  - Full-width aerial farm photography as section background
  - White rounded-pill eyebrow label (e.g. "Global Quality Assurance") top-left
  - Large bold white headline overlaid on image left side
  - Smaller white body text right side
  - Stat cards at bottom: 4 cards in a row
    - FIRST card: bright lime/chartreuse (#C8FF00 or similar) background, dark text
    - Remaining cards: white background, green number, black label below
    - All cards: very rounded corners (rounded-2xl), compact, no borders

PAGE 3 — Feature Cards:
  - White/light background
  - Bright green eyebrow label (uppercase, small, bold) above section title
  - Massive bold black section title (2–3 lines, center-aligned)
  - Gray subtext below title (lightweight, center)
  - 3 feature cards in a row, each with dark green gradient overlay on image
  - Cards: rounded-2xl, image fills card, white text overlay at bottom
  - "AI Insights" chip — small dark rounded badge with green icon

PAGE 4 — Accordion/List section:
  - Numbered items (01. 02. 03.) as large bold headings
  - Green arrow icon (↓) right-aligned on each row
  - Clean divider lines between items
  - Feature cards: dark background with data readouts inside

PAGE 5 — Footer:
  - Pure black background (#000000 or #0A0A0A)
  - Logo top left
  - Email input + green pill Subscribe button
  - Multi-column link layout in white text
  - Contact Us: white pill button with green arrow circle
  - Social icons row
  - Bottom bar: copyright left, Privacy/Terms right
```

---

## Global UI Rules

Framework: Next.js 14 App Router
Styling: TailwindCSS + shadcn/ui
Target Device: Android phone (360px minimum width)
Touch Target Minimum: 48x48px on ALL interactive elements

### Design Goals (Agrio-aligned):
- Clean white surfaces — never cluttered
- Large breathing whitespace between sections
- Typography does the heavy lifting — big bold headlines, light body text
- Green is used deliberately — only for primary actions and positive states
- Lime/chartreuse accent (#C8FF00) for the single most important stat on a screen
- Photo-first sections where possible — use farm imagery as card backgrounds
- Pill shapes for buttons and badges — never square corners on interactive elements

### Agrio Typography System:
```
Display / Hero:     font-weight: 900 (black), tracking-tight, 36–48px mobile
Section Title:      font-weight: 800 (extrabold), tracking-tight, 24–30px
Card Title:         font-weight: 700 (bold), 16–18px
Body:               font-weight: 400 (regular), 14–15px, color: #616161
Eyebrow Label:      font-weight: 700, 11px, uppercase, letter-spacing: 0.1em
Button:             font-weight: 700, 15–16px
```
- No text smaller than 14px anywhere
- Telugu, Hindi, English: use system fonts — no custom font installation required
- Tight letter-spacing on all headings (-0.02em to -0.04em)
- Body text: loose line-height (1.6) for readability outdoors

### Color Palette (Agrio-aligned):
```
Primary Green:      #2E7D32   — buttons, active states, positive indicators
Lime Accent:        #C8FF00   — hero stat card background, single accent per screen
Black:              #0A0A0A   — headlines, footer background
Near-Black:         #1B1B1B   — primary body text
Gray Body:          #616161   — secondary text, subheadings
Light Gray BG:      #F7F7F7   — page background (NOT pure white — slightly warm)
Card White:         #FFFFFF   — card surfaces
Border Subtle:      #E8E8E8   — card borders, dividers
Warning Yellow:     #F9A825   — moderate risk only
Danger Red:         #C62828   — emergency states only
Disabled:           #BDBDBD
```

### Layout Rules (Agrio-aligned):
- No sidebar
- No hamburger menu
- No multi-level dropdowns
- Extreme whitespace — section padding minimum 24px top/bottom on mobile
- Page padding: 16px horizontal on all screens
- Cards: rounded-2xl (16px radius) — never rounded-lg or less
- Section titles always have an eyebrow label above them (green, uppercase, small)
- Every action reachable within 1 tap from the relevant screen
- Every content block inside a FarmerCard component

---

## Shared Components

### FarmerCard
```
Agrio style: white card, rounded-2xl, subtle border (1px solid #E8E8E8)
Shadow: shadow-sm (do not use heavy shadows — Agrio is clean/flat)
Padding: 20px
Margin bottom: 16px
No inner dividers unless explicitly specified
Used for: every dashboard section, every listing card
```

### HeroStatCard
```
Inspired by: Agrio Page 2 stat cards at bottom of full-bleed image section

PRIMARY variant (first/most important stat on screen):
  Background: #C8FF00 (lime/chartreuse — Agrio's bold accent)
  Text color: #0A0A0A (black)
  Number: font-weight: 900, 32px
  Label: font-weight: 600, 12px, below number

SECONDARY variant (supporting stats):
  Background: #FFFFFF
  Number: color #2E7D32, font-weight: 900, 32px
  Label: color #1B1B1B, font-weight: 600, 12px
  Border: 1px solid #E8E8E8

Layout: 4 cards in a horizontal scrollable row
Border radius: rounded-2xl on all variants
Padding: 16px
```

### SectionEyebrow
```
Inspired by: Agrio Page 3 "Agriculture Tech Enhanced" label above section title

Appearance:
  Text: uppercase, font-weight: 700, 11px, letter-spacing: 0.1em
  Color: #2E7D32
  No background — just the text label
  Margin bottom: 8px before the section title

Usage: Place above EVERY section title across all pages
Example: "HARVEST INTELLIGENCE" above "Your Recommended Harvest Window"
```

### GreenArrowCTA
```
Inspired by: Agrio Page 1 "Our Solutions →" button and Page 5 "Contact Us →"

Appearance:
  Label text: font-weight: 700, 15px, color: #1B1B1B (displayed inline left of button)
  Circle button: 44px diameter, background #2E7D32, white arrow icon (↗ or →)
  Border radius: rounded-full
  Displayed as: flex row, label + circle button side by side

Usage: Primary CTA on landing page, secondary CTAs where full-width button is too heavy
```

### StatusBadge
```
Small rounded-full pill label
Padding: 4px 12px
Font: bold, 12px, uppercase, letter-spacing: 0.05em
Background + text:
  Green: bg #2E7D32, text white → safe / good
  Yellow: bg #F9A825, text #1B1B1B → warning (dark text for contrast)
  Red: bg #C62828, text white → danger / emergency
  Lime: bg #C8FF00, text #0A0A0A → highlight / best window
```

### EyebrowPill
```
Inspired by: Agrio Page 2 "Global Quality Assurance" white pill label on image

Appearance:
  Background: white (rgba 90% opacity when on image backgrounds)
  Border: 1px solid #E8E8E8
  Border radius: rounded-full
  Padding: 6px 14px
  Text: font-weight: 600, 12px, color: #2E7D32

Usage: On photo-background sections only (e.g. full-bleed farm image cards)
```

### AIBox
```
FarmerCard with Agrio styling:
  SectionEyebrow above title (e.g. "AI POWERED")
  Title: font-weight: 800, 18px, color: #0A0A0A
  Thin divider: 1px solid #E8E8E8, margin: 12px 0
  Content area below divider
  Loading: centered green spinner (border-t-2 border-green-700 animate-spin, 32px circle)
  Fallback text: "Recommendation unavailable." — color #616161, centered
```

### SupplyPressureIndicator
```
Layout inspired by Agrio stat cards:
  Large StatusBadge (pill) showing RED / YELLOW / GREEN
  Below badge: bold number showing farmer count (font-weight: 900, 28px, green)
  Below number: label text "farmers in your mandal this week"
  Text must always read: "Based on X farmers in your mandal"
  NEVER show quintal totals here — only farmer count
```

### ViabilityBadge
```
StatusBadge showing days remaining:
  Green: >7 days → "X days — Safe"
  Yellow: 3–7 days → "X days — Monitor"
  Red: <3 days → "X days — CRITICAL" — also triggers EmergencyBanner
```

### EmergencyBanner
```
Agrio-inspired: full-width, high-contrast, impossible to miss

Appearance:
  Background: #C62828
  Text: white, font-weight: 800, 16px, centered
  Padding: 16px
  No border radius — full edge-to-edge strip
  Icon: ⚠️ before text

Position: pinned to top of screen below browser chrome, above ALL content
Scroll behavior: stays fixed — does NOT scroll away
Only shown: when emergency_sell = true OR viability_days < 3
Banner text: "⚠️ Sell Now — Your crop cannot wait. Waiting risks complete loss."
```

### DarkImageCard
```
Inspired by: Agrio Page 3 feature cards (dark green image cards with text overlay)

Appearance:
  Full card background: dark green photo (farm imagery)
  Overlay: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)
  Border radius: rounded-2xl
  Content (pinned to bottom of card):
    EyebrowPill (white/translucent) — category label
    Title: white, font-weight: 700, 16px
    Subtext: white 80% opacity, 13px
  Height: 200px minimum on mobile

Usage: Feature showcase cards, /market supply heatmap cards
```

### VoiceInputButton
```
Microphone icon button (24x24px icon, 48x48px touch area)
Position: inside every text input field, right-aligned, vertically centered
Idle state: #BDBDBD mic icon
Listening state: #C62828 pulsing mic icon + red border on input (border-red-600)
  Pulsing: animate-pulse on mic icon
  Border: ring-2 ring-red-500 on the input wrapper
Stops listening: after 5 seconds of silence OR user taps again
Live transcript appears inside the input field as user speaks
Fallback: if WebSpeech unavailable, hide button silently, keyboard only — no crash
```

### BottomNavBar
```
Agrio-inspired clean bottom nav:
  Fixed to bottom of screen
  Height: 60px
  Background: #FFFFFF
  Border-top: 1px solid #E8E8E8
  4 tabs: Dashboard | Market | Marketplace | Profile
  Each tab: icon (24px) above label (11px, font-weight: 600, uppercase)
  Active tab: icon + label color #2E7D32
  Inactive tab: icon + label color #BDBDBD
  Active indicator: 2px green line at TOP of tab (border-top style, not underline)
  Visible on: /dashboard, /market, /marketplace, /profile
  Hidden on: /auth, /onboarding, /buyer/dashboard, /buyer/post-demand
```

### MSPWarningBadge
```
StatusBadge (red) with text: "Below MSP"
Shown on any buyer listing where price < MSP
Accept button: disabled state — bg #BDBDBD, cursor-not-allowed
Tooltip on disabled button: "This offer is below the minimum support price"
```

### InputField
```
Agrio style — clean, minimal:
  Background: #FFFFFF
  Border: 1px solid #E8E8E8
  Border radius: rounded-xl
  Padding: 14px 16px
  Font: 15px, color #1B1B1B
  Placeholder: color #BDBDBD
  Focus state: border-color #2E7D32, ring-1 ring-green-700 (no glow/shadow)
  Label above input: SectionEyebrow style (uppercase, 11px, green, font-weight: 700)
  VoiceInputButton inside field: right-aligned, 48x48px touch target
```

### PrimaryButton
```
Agrio style — solid pill button:
  Background: #2E7D32
  Text: white, font-weight: 700, 15px
  Border radius: rounded-full (pill shape — matches Agrio "Sign in" button)
  Padding: 14px 28px
  Full width on mobile (w-full)
  Height: minimum 52px (touch target)
  Hover/active: background darken to #1B5E20
  Disabled: bg #BDBDBD, text white, cursor-not-allowed
```

### SecondaryButton
```
Agrio style — outlined pill button:
  Background: transparent
  Border: 1.5px solid #1B1B1B
  Text: #1B1B1B, font-weight: 700, 15px
  Border radius: rounded-full
  Padding: 14px 28px
  Full width on mobile
  Height: minimum 52px
  Example: Agrio "Sign up" link / "Contact Us" outline button
```

---

## Page Layouts

### `/` (Role Select — Agrio Hero Style)
```
Agrio Page 1 inspiration — pure white, massive type, extreme whitespace

Layout:
  Top nav bar:
    Left: 🌾 HarvestHub logo (green icon + black wordmark, font-weight: 800)
    Right: two buttons — "Sign Up" (SecondaryButton small) + "Sign In" (PrimaryButton small, pill)

  Hero section (centered, full viewport height):
    SectionEyebrow: "HARVEST INTELLIGENCE"
    Display headline: "Harvest Smart.\nHarvest Together." — font-weight: 900, 40px, tracking-tight, centered
    Body text below: "Empowering Telangana farmers with real-time coordination to maximize income every season."
      — color #616161, 15px, centered, max-width 300px, margin: 0 auto
    CTA row below body text (centered, flex row, gap-3):
      GreenArrowCTA: label "Get Started" + green circle arrow button → /auth?role=farmer
    
  Two role cards below hero (stacked, full width):
    Card 1 — Farmer (DarkImageCard style):
      Background: dark green farm image
      Title: "I'm a Farmer" (white, bold)
      Subtext: "Register your crop and harvest window"
      → /auth?role=farmer

    Card 2 — Buyer (white FarmerCard):
      Title: "I'm a Buyer" (black, bold)
      Subtext: "Post demand and find crop supply"
      → /auth?role=buyer
```

### `/auth`
```
Clean Agrio white page:
  Top: 🌾 HarvestHub logo centered
  SectionEyebrow: "SECURE LOGIN"
  Title: "Enter your phone number" — font-weight: 800, 24px

  InputField: phone number (large, numeric keyboard, no VoiceInputButton)
  PrimaryButton: "Send OTP" (full width, pill)

  After OTP sent:
    SectionEyebrow: "VERIFICATION"
    Title: "Enter the 6-digit code"
    6-digit OTP input (large, centered, auto-focus, numeric)
    PrimaryButton: "Verify" (full width, pill)

  No additional links or text — clean Agrio minimal style
```

### `/onboarding`
```
Progress bar at top:
  Two dots or "Step 1 of 2" — dots: filled green (active) / gray (inactive), rounded-full, 8px
  SectionEyebrow below progress: "YOUR DETAILS" / "YOUR FARM"

Step 1 — Personal Info:
  Section title: font-weight: 800, 22px
  InputField: Name + VoiceInputButton
  Role: shown as StatusBadge chip (green "Farmer" or gray "Buyer") — not editable
  District: select styled as InputField (dropdown arrow right-aligned)
  Mandal: select styled as InputField, filtered by district
  Language picker:
    Three toggle chips side by side (rounded-full pills):
      Active: bg #2E7D32, text white
      Inactive: bg #F7F7F7, border #E8E8E8, text #616161
    Labels: "తెలుగు" | "हिंदी" | "English"

Step 2 — Farm Info (farmers only):
  SectionEyebrow: "YOUR CROP"
  Crop multi-select:
    5 crop options as pill chips (rounded-full):
      Selected: bg #2E7D32, text white
      Unselected: bg #F7F7F7, border #E8E8E8
      Max 3 selected — 4th tap shows StatusBadge warning "Max 3 crops"
  InputField: Variety + VoiceInputButton
  Date picker: InputField style with calendar icon right-aligned
  InputField: Field size (number, acres) + VoiceInputButton
  Soil type: two pill chips — "Black Cotton" | "Red Loam"

PrimaryButton: "Continue →" at bottom of each step (full width, pill, #2E7D32)
On final submit → Firestore write → redirect /dashboard
```

### `/dashboard`
```
EmergencyBanner (pinned top, only when emergency_sell = true)

Page header (NOT a nav — just top of content):
  SectionEyebrow: "YOUR FARM OVERVIEW"
  Title: farmer's crop name + variety — font-weight: 900, 28px, tracking-tight

--- STAT ROW (Agrio Page 2 inspiration) ---
HeroStatCard row — horizontal scroll, 4 cards:
  Card 1 (LIME #C8FF00): viability days remaining — number bold, label "Days Left"
  Card 2 (white/green): harvest countdown — "X Days" green number, "To Harvest" label
  Card 3 (white/green): field size — "X Acres" green, "Field Size" label
  Card 4 (white/green): expected quantity — "X Qt" green, "Expected Yield" label

--- SECTION 1: Supply Pressure (FarmerCard) ---
SectionEyebrow: "ZONE ACTIVITY"
Title: "This Week in Your Mandal" — font-weight: 800, 18px
SupplyPressureIndicator:
  Large StatusBadge (RED/YELLOW/GREEN pill)
  Below: "X farmers harvesting [Crop] this week" — font-weight: 900, 24px green number + label
  Sub-label: "Based on X farmers in your mandal" — 13px, #616161
  NEVER show quintals here

--- SECTION 2: Harvest Recommendation (AIBox) ---
SectionEyebrow: "AI POWERED"
Title: "Harvest Window" — font-weight: 800, 18px
Divider: 1px solid #E8E8E8
Recommended window: font-weight: 900, 32px, color #2E7D32 — e.g. "Nov 14–18"
Price estimate: font-weight: 600, 16px, color #1B1B1B — e.g. "₹2,100–2,300/quintal"
Reasoning: 13px, color #616161, line-height 1.6 (Telugu/Hindi/English from Gemini)
PrimaryButton: "Accept This Window" (full width, pill)
Loading: centered green spinner (32px, animate-spin) while Gemini fetches (max 8s)

--- SECTION 3: Sell Decision (AIBox) ---
SectionEyebrow: "SELL INTELLIGENCE"
Title: "Should I Sell Now?" — font-weight: 800, 18px
Divider: 1px solid #E8E8E8
Before response: PrimaryButton "Get Recommendation" (full width)
After response:
  Decision: font-weight: 900, 36px, uppercase — "SELL NOW" / "WAIT 9 DAYS" / "EMERGENCY"
  Color: green / yellow / red matching decision type
  Factor breakdown: 7-row list below decision
    Each row: factor name (bold, 14px) | status text (#616161) | impact badge (StatusBadge)
    Divider between rows: 1px solid #F7F7F7
  Reasoning: 13px, #616161, line-height 1.6

--- SECTION 4: Yield Estimate (AIBox) ---
SectionEyebrow: "YIELD INTELLIGENCE"
Title: "Expected Yield"
Divider: 1px solid #E8E8E8
Estimated quintals: font-weight: 900, 40px, color #2E7D32
Range: "X – Y quintals" — 14px, #616161
PrimaryButton: "Confirm This Quantity" (full width, pill)

--- SECTION 5: Post-Harvest Tracker (FarmerCard) ---
SectionEyebrow: "HARVEST PROGRESS"
Title: "Track Your Crop"
Progress stepper (horizontal):
  5 steps: Growing → Harvested → Stored → Transported → Sold
  Each step: circle (24px) with step number inside
  Active: filled #2E7D32 circle, white number
  Completed: filled #2E7D32 circle, white checkmark
  Inactive: border-2 #E8E8E8 circle, #BDBDBD number
  Connecting lines between circles: 2px, green if completed, gray if not
  Step label below each circle: 11px, uppercase, #616161

Tap to advance: confirmation bottom sheet (not dialog) slides up from bottom:
  "Mark as [next status]?" 
  PrimaryButton: "Yes, Confirm"
  SecondaryButton: "Cancel"

Profit tracker (only after Sold status):
  InputField: "Actual price received" (₹/quintal)
  Delta row: "Estimated ₹X vs Actual ₹Y"
  Delta value: green if positive, red if negative — font-weight: 800, 20px
```

### `/market`
```
SectionEyebrow: "MARKET INTELLIGENCE"
Title: "Mandi Prices" — font-weight: 900, 28px

Crop selector: horizontal scrollable pill tabs at top
  Active: bg #2E7D32, text white, rounded-full
  Inactive: bg #F7F7F7, border #E8E8E8, rounded-full

--- FarmerCard 1: Current Price ---
SectionEyebrow: "LIVE RATE"
Current mandi price: font-weight: 900, 40px, color #2E7D32 — "₹2,200"
Unit: "/quintal" — 14px, #616161, inline after price
MSP: "MSP: ₹2,183" — 13px, #616161
Source badge: StatusBadge — lime (#C8FF00 bg, black text) "LIVE" or gray "CACHED"

--- FarmerCard 2: Price Trend ---
SectionEyebrow: "PRICE TREND"
Toggle pills: "30 days" | "60 days" | "90 days" — same style as crop selector
Chart.js line chart below:
  Line color: #2E7D32
  Fill: rgba(46,125,50,0.08) under line
  Grid: #F7F7F7 lines (very subtle)
  Axes: #BDBDBD labels, 12px
  No border around chart — floats clean inside card

--- FarmerCard 3: Supply Overview ---
SectionEyebrow: "ZONE SUPPLY"
Title: "Who's Harvesting This Week?"
Mandal rows: each row = mandal name + crop + farmer count StatusBadge
Demand indicator: "Buyer Demand" header + bar per crop (green fill, #F7F7F7 bg)
```

### `/marketplace`
```
SectionEyebrow: "BUYERS NEAR YOU"
Title: "Active Buyers" — font-weight: 900, 28px
Subtitle: "Filtered to your crop and district" — 14px, #616161

Each buyer listing as FarmerCard:
  Top row: crop + variety (bold, 15px) | delivery date (13px, #616161) right-aligned
  Offered price: font-weight: 900, 32px, color #2E7D32 — "₹2,300"
  Unit: "/quintal" inline, 14px, #616161
  Quantity: "Needs: 50 quintals" — 13px, #616161
  MSPWarningBadge (if price < MSP) — shown below quantity
  PrimaryButton: "Accept Offer" (full width, pill, green — DISABLED if below MSP)

Empty state:
  Centered illustration area (simple green leaf icon)
  Text: "No buyers for [crop] in your district yet." — 15px, #616161, centered
```

### `/profile`
```
SectionEyebrow: "YOUR ACCOUNT"
Name: font-weight: 900, 28px, color #0A0A0A
Phone: 15px, color #616161, below name

Selected crops: StatusBadge chips (green), horizontal row

SectionEyebrow: "LANGUAGE"
Language toggle: three pill chips — "తెలుగు" | "हिंदी" | "English"
  Active: bg #2E7D32, text white
  Inactive: bg #F7F7F7, border #E8E8E8
  Selecting → ALL text updates instantly, no reload

Logout: SecondaryButton, full width, border red (#C62828), text red
  Position: bottom of page, 24px margin from bottom nav
```

### `/buyer/dashboard`
```
BottomNavBar NOT shown — buyers have simpler header nav (logo + "Logout" right)

SectionEyebrow: "POST DEMAND"
Title: "What Do You Need?" — font-weight: 900, 26px

FarmerCard 1 — Post New Demand:
  Crop dropdown (InputField style)
  Variety InputField
  Quantity InputField (number, quintals)
  Date picker InputField (calendar icon)
  Price InputField (₹/quintal):
    Real-time validation: if price < MSP → show MSPWarningBadge inline below field
    Field border turns red (ring-red-500) if below MSP
  PrimaryButton: "Post Listing" (full width, pill)

FarmerCard 2 — My Listings:
  SectionEyebrow: "YOUR LISTINGS"
  Each listing row: crop + qty + price | StatusBadge (Open/Matched/Closed)

FarmerCard 3 — Accepted Matches:
  SectionEyebrow: "MATCHED FARMERS"
  Each match row: farmer name + crop + quantity + agreed price + date
```

---

## Interaction Behavior

### Loading States
```
AIBox sections: centered green spinner (32px, border-t-2 border-green-700 animate-spin)
Timeout: 8 seconds → show "Recommendation unavailable. Showing last saved data." — #616161
Non-AI Firestore cards: no spinner — data appears instantly
Page transitions: no full-page loader — staggered card fade-in (opacity 0→1, 150ms delay per card)
```

### Error States
```
API failure: inside AIBox — "Recommendation unavailable. Showing last saved data." — no red, just gray text
Network error: toast at BOTTOM of screen (above BottomNavBar):
  Background: #1B1B1B, text white, rounded-2xl, padding 14px 20px
  Text: "Connection issue. Some data may be outdated."
  Auto-dismiss: 4 seconds
  Never show raw error messages or stack traces
```

### Emergency State
```
EmergencyBanner: pinned top, full-width, #C62828, white text, fixed position
Banner text: "⚠️ Sell Now — Your crop cannot wait. Waiting risks complete loss."
Font: font-weight: 800, 16px, white, centered
All other sections remain scrollable below banner
Banner disappears only when viability_days >= 3
```

### Agrio Animation Rules
```
All transitions: duration 150–200ms, ease-out (never bouncy or elastic)
Cards: fade-in on first load (opacity 0→1), no slide animations
Buttons: scale(0.97) on active/press state
StatusBadge: no animation — instant color
Language toggle: instant label update, no transition delay
Bottom sheet (confirmation): slide up from bottom, 200ms ease-out
```

### Language
```
Language change: ALL visible labels, buttons, AIBox reasoning, StatusBadge text update in <500ms
Gemini reasoning: already returned in selected language — render directly
Default: Telugu — if translation key missing, fall back to English silently
Language preference persisted in localStorage + Firestore user document
```

### Navigation
```
BottomNavBar: visible on /dashboard, /market, /marketplace, /profile
Hidden on: /auth, /onboarding, /buyer/dashboard, /buyer/post-demand
Active tab: green icon + green label + 2px green top border indicator
Tap active tab: scroll to top of page
```

### Voice Input
```
VoiceInputButton: on ALL text inputs in /onboarding + community post field
Recognition language: te-IN / hi-IN / en-IN matching current app language
Live transcript: fills input field character by character as speech is detected
Farmer can edit transcript before submitting
Auto-stops: after 5 seconds of silence
Fallback: WebSpeech unavailable → hide mic silently, keyboard only, no error shown
Listening state: red pulsing mic (animate-pulse) + ring-2 ring-red-500 on input wrapper
```

---

## Agrio Anti-Patterns — Do NOT Do These

```
❌ DO NOT use heavy drop shadows (box-shadow: 0 4px 20px...) — use shadow-sm only
❌ DO NOT use gradients on backgrounds — pure white or #F7F7F7 only (except DarkImageCard)
❌ DO NOT use rounded-lg — always use rounded-xl or rounded-2xl or rounded-full
❌ DO NOT use border-radius less than 12px on any card
❌ DO NOT center-align body paragraphs in cards — left-align content inside cards
❌ DO NOT use colored backgrounds on FarmerCard — white only (lime only on HeroStatCard primary)
❌ DO NOT stack more than 2 full-width buttons in a row — use GreenArrowCTA for secondary actions
❌ DO NOT use bold text smaller than 13px — minimum bold text is 13px (StatusBadge labels)
❌ DO NOT use blue as an accent color anywhere — green is the ONLY brand accent
❌ DO NOT show a loading skeleton — use spinner or nothing (instant Firestore data)
❌ DO NOT use emoji in headings or body text except EmergencyBanner (⚠️ only)
```
