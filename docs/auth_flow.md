# HarvestHub Authentication Flow

Authentication System: Firebase Phone OTP
No email. No password. No Google Sign-In. Phone OTP only.

---

## Login Flow

1. User opens `/` → selects role (Farmer or Buyer) → redirected to `/auth?role=farmer` or `/auth?role=buyer`
2. User enters phone number on `/auth`
3. App calls Firebase `signInWithPhoneNumber()` → Firebase sends OTP via SMS
4. User enters 6-digit OTP
5. App calls `confirmationResult.confirm(otp)`
6. Firebase verifies OTP → returns Firebase UID

---

## After Verification

Immediately after Firebase confirms the OTP, check Firestore collection `users`:

```
IF document exists at users/{uid}:
  → redirect to /dashboard (farmer) or /buyer/dashboard (buyer)

IF no document exists at users/{uid}:
  → redirect to /onboarding?role={role}
```

Role is carried from the query param through to onboarding. Do not ask for role again during onboarding.

---

## Onboarding Write

On `/onboarding` final submit, create TWO documents:

**1. Write to `users/{uid}`:**
```
uid:        string   (from Firebase Auth)
name:       string   (from form)
phone:      string   (from Firebase Auth currentUser.phoneNumber)
role:       "farmer" | "buyer"
district:   string
mandal:     string
crops:      string[] (array, max 3 — farmers only; empty array for buyers)
language:   "te" | "hi" | "en"
createdAt:  timestamp
```

**2. If role = "farmer", also write to `farmers/{uid}`:**
```
uid:               string
crop:              string   (primary crop — first in crops array)
variety:           string
sownDate:          string   (ISO date)
fieldSize_acres:   number
soilType:          "black_cotton" | "red_loam"
district:          string
mandal:            string
expectedQtl:       number | null   (null until Prompt 2 runs or farmer enters manually)
quantityConfirmed: false
viability_days:    number   (calculate from crop type default on creation)
harvestWeek:       1        (default — updated when farmer accepts recommendation)
status:            "growing"
estimatedPrice:    null
actualPrice:       null
```

**3. If role = "buyer", also write to `buyers/{uid}`:**
```
uid:          string
businessName: string   (use name field for now)
district:     string
phone:        string
```

After all writes complete → redirect to `/dashboard` (farmer) or `/buyer/dashboard` (buyer).

---

## Default Viability Days by Crop (Use on Farmer Creation)

```
paddy:      14 days
cotton:     21 days
maize:      10 days
turmeric:   30 days
red_chilli: 7 days
```

These are days from harvest readiness until quality loss risk. Decrement by 1 per day using a scheduled function or calculate on read from (readyDate - today).

---

## Session Requirements

- Use Firebase Auth `onAuthStateChanged` listener in a root layout provider
- Wrap entire app in an `AuthProvider` component that exposes `{ user, loading }`
- On every protected page: if `loading` is true → show full-screen spinner
- If `loading` is false and `user` is null → redirect to `/auth`
- If `loading` is false and `user` exists → render page

Protected pages (redirect to `/auth` if not authenticated):
```
/dashboard
/market
/marketplace
/profile
/buyer/dashboard
/buyer/post-demand
```

Public pages (accessible without auth):
```
/
/auth
```

---

## Logout

Logout button location: `/profile` page (bottom of page)

On logout:
1. Call Firebase `signOut()`
2. Clear any local state
3. Redirect to `/auth`

---

## reCAPTCHA (Firebase Phone Auth Requirement)

Firebase Phone Auth requires a reCAPTCHA verifier for web.

Use `RecaptchaVerifier` with `size: 'invisible'` so farmers never see a CAPTCHA:

```typescript
const recaptchaVerifier = new RecaptchaVerifier(auth, 'sign-in-button', {
  size: 'invisible',
  callback: () => {}
})
```

Attach to the "Send OTP" button element. This is mandatory — Firebase will reject the call without it.

---

## Auth Error Handling

Handle these specific Firebase error codes with user-friendly messages:

```
auth/invalid-phone-number     → "Please enter a valid 10-digit Indian mobile number."
auth/too-many-requests        → "Too many attempts. Please wait a few minutes and try again."
auth/code-expired             → "OTP has expired. Please request a new one."
auth/invalid-verification-code → "Incorrect OTP. Please check and try again."
auth/quota-exceeded           → "SMS service temporarily unavailable. Please try again later."
```

Display errors as a red text block below the relevant input field.
Never show raw Firebase error codes to the user.

---

## Demo Account (For Hackathon — Pre-logged-in States)

To avoid OTP dependency during live demo, seed these two pre-authenticated states in the demo environment:

Farmer demo account:
```
Phone: pre-seeded in Firestore with uid matching a seeded farmer document
Crop: Paddy, Warangal, 8 farmers in same mandal (RED supply pressure)
viability_days: 10 (normal state)
```

Emergency demo farmer (for viability override demo):
```
Same setup but viability_days: 2 (triggers emergency alert)
```

Buyer demo account:
```
Pre-seeded buyer with 3 open listings already posted
```

Keep one browser tab logged in as farmer and another as buyer before demo starts.
Do not rely on live OTP during the presentation.
