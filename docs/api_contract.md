# api_contract.md — API Routes

All routes live under `/app/api/`. All responses are JSON.
All Gemini routes use hardcoded mock responses first — swap for live calls only after dashboard renders correctly.

---

## POST /api/ai/harvest

Calls Gemini Prompt 1. Returns optimal harvest window.

**Input:**
```json
{
  "crop": "paddy",
  "variety": "Sona Masuri",
  "sownDate": "2024-09-01",
  "fieldSize_acres": 5,
  "soilType": "black_cotton",
  "district": "Warangal",
  "weather_json": { "day1": "sunny", "day2": "sunny", "day3": "rain", "day4": "cloudy" },
  "farmer_count": 8,
  "viability_days": 10,
  "current_price": 2100,
  "msp": 2183,
  "language": "te"
}
```

**Output:**
```json
{
  "recommended_window": "Nov 14–18",
  "emergency_sell": false,
  "reasoning_telugu": "...",
  "reasoning_english": "Only 2 farmers harvest that week — prices will be higher.",
  "price_estimate": "₹2100–2300/quintal"
}
```

**Emergency override:** If `viability_days < 3`, return immediately:
```json
{
  "recommended_window": null,
  "emergency_sell": true,
  "reasoning_telugu": "...",
  "reasoning_english": "Your crop must be harvested now. Waiting risks complete loss.",
  "price_estimate": null
}
```

---

## POST /api/ai/quantity

Calls Gemini Prompt 2. Estimates yield if farmer doesn't know their quantity.

**Input:**
```json
{
  "crop": "paddy",
  "variety": "Sona Masuri",
  "fieldSize_acres": 5,
  "district": "Warangal",
  "season": "Kharif",
  "district_avg_qtl_per_acre": 18
}
```

**Output:**
```json
{
  "estimated_quintals": 90,
  "range_low": 76,
  "range_high": 104,
  "basis": "District average for Sona Masuri in Warangal Kharif 2024"
}
```

---

## POST /api/ai/sell

Calls Gemini Prompt 3. 7-factor sell/wait recommendation.

**Input:**
```json
{
  "viability_days": 5,
  "rain_in_3_days": true,
  "current_price": 2100,
  "msp": 2183,
  "farmer_count_this_week": 8,
  "storage_capacity_pct": 70,
  "transport_availability": "medium",
  "matched_buyer_offer": {
    "exists": true,
    "price": 2300
  },
  "language": "te"
}
```

**Output:**
```json
{
  "decision": "Sell Now",
  "wait_days": null,
  "factor_breakdown": [
    { "factor": "Crop Viability", "status": "5 days — OK", "impact": "none" },
    { "factor": "Weather", "status": "Rain in 2 days — WARNING", "impact": "harvest now" },
    { "factor": "Price vs MSP", "status": "Below MSP — CAUTION", "impact": "avoid selling" },
    { "factor": "Supply Pressure", "status": "8 farmers — HIGH", "impact": "delay recommended" },
    { "factor": "Storage", "status": "70% full — OK", "impact": "none" },
    { "factor": "Transport", "status": "Medium availability", "impact": "act soon" },
    { "factor": "Buyer Demand", "status": "Matched offer ₹2300 — GOOD", "impact": "accept offer" }
  ],
  "reasoning_telugu": "...",
  "reasoning_english": "Rain forecast overrides price optimization. Harvest now and accept the matched offer at ₹2300."
}
```

**Decision values:**
- `"Sell Now"` — immediate sale recommended
- `"Wait X days"` — wait_days is a number
- `"Emergency: Sell Immediately"` — viability_days < 3, overrides all other factors

---

## GET /api/dashboard/summary

Returns all data needed to render the farmer dashboard in one call.

**Query params:** `?uid={farmerUid}`

**Output:**
```json
{
  "farmer": {
    "uid": "abc123",
    "crop": "paddy",
    "variety": "Sona Masuri",
    "sownDate": "2024-09-01",
    "fieldSize_acres": 5,
    "expectedQtl": 90,
    "viability_days": 10,
    "harvestWeek": 1,
    "status": "growing",
    "estimatedPrice": 2200,
    "actualPrice": null
  },
  "supply_pressure": {
    "farmer_count": 8,
    "level": "red",
    "label": "Based on 8 farmers in your mandal"
  },
  "msp": 2183,
  "current_mandi_price": 2100,
  "viability_status": "green"
}
```

**Viability status values:** `"green"` (>7 days), `"yellow"` (3–7 days), `"red"` (<3 days)
**Supply pressure level values:** `"green"` (≤2 farmers), `"yellow"` (3–4), `"red"` (≥5)

---

## GET /api/market/prices

Returns mandi price history and current prices per crop.

**Query params:** `?crop=paddy&days=30`
Days options: `30 | 60 | 90`

**Output:**
```json
{
  "crop": "paddy",
  "apmc": "Warangal",
  "days": 30,
  "prices": [
    { "date": "2024-10-01", "price": 2050 },
    { "date": "2024-10-02", "price": 2080 }
  ],
  "current_price": 2100,
  "source": "agmarknet"
}
```

If Agmarknet API is unavailable, load from `/public/fallback-data/mandi-prices.json` and set `"source": "fallback"`.

---

## POST /api/marketplace/accept

Farmer accepts a buyer listing. Blocked if price < MSP.

**Input:**
```json
{
  "farmerUid": "abc123",
  "listingId": "listing456"
}
```

**Output (success):**
```json
{
  "success": true,
  "matchId": "match789"
}
```

**Output (blocked — below MSP):**
```json
{
  "success": false,
  "reason": "below_msp",
  "message": "This offer is below the MSP of ₹2183/quintal for Paddy."
}
```

---

## POST /api/marketplace/post-demand

Buyer posts a demand listing.

**Input:**
```json
{
  "buyerUid": "buyer123",
  "crop": "paddy",
  "variety": "Sona Masuri",
  "quantityQtl": 50,
  "targetDate": "2024-11-20",
  "pricePerQtl": 2300,
  "district": "Warangal"
}
```

**Output:**
```json
{
  "success": true,
  "listingId": "listing456",
  "isBelowMSP": false
}
```
