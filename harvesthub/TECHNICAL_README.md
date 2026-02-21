# HarvestHub - Strategic Agriculture Coordination System

HarvestHub is a Next.js-based SaaS platform designed to coordinate agricultural supply chains in Telangana. It leverages AI to prevent regional oversupply, protect farmers through MSP-aware matching, and optimize harvest windows for maximum profitability.

## 🚀 Successfully Working Features

### 1. Farmer Coordination Dashboard
- **Regional Coordination Insights**: Real-time visualization of how many farmers in a specific Mandal are targeting the same harvest window.
- **Strategic AI Harvest Windows**: AI-driven recommendations for the optimal harvest week based on sown date, crop variety, and regional supply pressure.
- **Post-Harvest Tracker**: Interactive progress tracking from 'Harvested' to 'Sold', including logistics status.
- **Profit/Loss Tracker**: Quantitative analysis of sales compared to government Minimum Support Prices (MSP).

### 2. AI Intelligence Suite (Powered by Gemini 1.5 Flash)
- **Sell Intelligence**: Coordination-aware advisor that recommends "Sell Now", "Wait", or "Emergency Sell" based on crop viability and market saturation.
- **Yield Intelligence**: Predictive yield estimation based on field size and crop-specific variety factors.
- **Harvest Window Optimizer**: Strategic selection of harvest dates to avoid market crashes caused by regional supply surges.

### 3. Buyer Marketplace Terminal
- **Demand Posting**: Buyers can specify crop needs, target dates, and offer prices.
- **MSP-Aware Matching**: Real-time protection logic that highlights and restricts transactions below the official Government MSP.
- **Fairness Match Pipeline**: Visual tracking of verified matches between farmers and buyers.

### 4. Core Infrastructure
- **Hybrid Data Model**: Uses Firestore for real-time transactions with a robust JSON-fallback system to ensure high-scale demos (1100+ records).
- **Role-Based Onboarding**: Specialized registration flows for Farmers and Buyers with regional specificity (Telangana districts/mandals).
- **Multilingual Support**: Fully localized interface in **Telugu, Hindi, and English**.
- **Phone Auth**: Secure OTP-based authentication via Firebase.

---

## ⚠️ Partially Implemented / Known Limitations

### 1. External Integrations
- **Weather Outlook**: The weather chart currently uses high-fidelity simulated data (`WeatherChart.tsx`) rather than a live 3rd-party weather API integration.
- **Logistics API**: Truck assignments, driver contact info, and route statuses are high-fidelity mock data points displayed to showcase the coordination workflow.

### 2. User Input Enhancements
- **Voice Input**: The `VoiceInputButton` component is a UI enhancement that utilizes the browser's Web Speech API. Its reliability may vary across different mobile browsers and environments.

### 3. Pricing Policy Enforcement
- **MSP Protection**: While the system restricts deals below MSP in the marketplace, it currently functions as a "Soft Restriction" (user alert/block) rather than a rigid protocol integration with government banking APIs.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS.
- **Backend API**: Next.js Serverless Functions.
- **AI Engine**: Google Generative AI (Gemini 1.5 Flash).
- **Database/Auth**: Firebase Firestore & Firebase Auth.
- **Icons**: Lucide React.
- **Design System**: Custom high-fidelity agricultural coordination UI.

## ⚙️ Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd harvesthub
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   GEMINI_API_KEY=...
   ```

4. **Seed the Showcase Data**:
   ```bash
   npx ts-node scripts/seed_showcase.ts
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```
