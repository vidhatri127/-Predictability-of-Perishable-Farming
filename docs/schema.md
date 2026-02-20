# schema.md — Firestore Collections

## Collection: users/{uid}

```
uid:                  string
name:                 string
phone:                string
role:                 "farmer" | "buyer"
district:             string
mandal:               string
language:             "te" | "hi" | "en"
createdAt:            timestamp
```

---

## Collection: farmers/{uid}

```
uid:                  string
crop:                 "paddy" | "cotton" | "maize" | "turmeric" | "red_chilli"
variety:              string
sownDate:             string            // ISO date e.g. "2024-09-01"
fieldSize_acres:      number
soilType:             "black_cotton" | "red_loam"
district:             string
mandal:               string
expectedQtl:          number            // from Prompt 2 or farmer-entered
quantityConfirmed:    boolean
viability_days:       number            // days until crop spoilage risk
harvestWeek:          1 | 2 | 3        // which week farmer plans to harvest
status:               "growing" | "harvested" | "stored" | "transported" | "sold"
estimatedPrice:       number | null     // ₹ per quintal from market data
actualPrice:          number | null     // ₹ per quintal — entered after sale
```

---

## Collection: buyers/{uid}

```
uid:                  string
businessName:         string
district:             string
phone:                string
```

---

## Collection: buyer_listings/{listingId}

```
listingId:            string
buyerUid:             string
crop:                 "paddy" | "cotton" | "maize" | "turmeric" | "red_chilli"
variety:              string
quantityQtl:          number
targetDate:           string            // ISO date
pricePerQtl:          number
district:             string
isBelowMSP:           boolean           // set server-side on write
status:               "open" | "matched" | "closed"
postedAt:             timestamp
```

---

## Collection: matches/{matchId}

```
matchId:              string
farmerUid:            string
buyerUid:             string
listingId:            string
crop:                 string
quantityQtl:          number
pricePerQtl:          number
matchedAt:            timestamp
```

---

## Collection: harvest_calendar/{mandal}_{crop}_{week}

```
mandal:               string
crop:                 string
week:                 1 | 2 | 3
farmerCount:          number            // INCREMENT by 1 per farmer — never sum quintals
farmerUids:           string[]
updatedAt:            timestamp
```

> CRITICAL: farmerCount is always count of farmers (1 farmer = 1), never total quintals.
> Supply pressure thresholds: GREEN ≤ 2, YELLOW 3–4, RED ≥ 5

---

## Collection: msp_values/{crop}

```
crop:                 string
pricePerQtl:          number
season:               string            // "2024-25"
updatedAt:            timestamp
```

Seed values:
```
paddy:       2183
cotton:      7121
maize:       2225
turmeric:    7000
red_chilli:  5500
```

---

## Collection: ai_cache/{uid}_{promptType}

```
uid:                  string
promptType:           "harvest" | "quantity" | "sell"
input_hash:           string            // hash of prompt inputs
response:             object            // full JSON response from Gemini
cachedAt:             timestamp
```

> Cache per farmer per prompt type. On dashboard load, check cache first before calling Gemini.
