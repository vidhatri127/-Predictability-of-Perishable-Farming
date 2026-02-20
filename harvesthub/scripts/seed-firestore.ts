// Firestore Seed Script
// Run: npx ts-node scripts/seed-firestore.ts
// Requires: Firebase project set up and .env.local populated

import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ─── MSP Values ─────────────────────────────────────────
const MSP_VALUES = [
    { crop: 'paddy', pricePerQtl: 2183, season: '2024-25' },
    { crop: 'cotton', pricePerQtl: 7121, season: '2024-25' },
    { crop: 'maize', pricePerQtl: 2225, season: '2024-25' },
    { crop: 'turmeric', pricePerQtl: 7000, season: '2024-25' },
    { crop: 'red_chilli', pricePerQtl: 5500, season: '2024-25' },
];

// ─── Demo Farmers ────────────────────────────────────────
// 8 Paddy farmers Week 1 (RED supply pressure)
const PADDY_FARMERS_WEEK1 = Array.from({ length: 8 }, (_, i) => ({
    uid: `demo_farmer_w1_${i + 1}`,
    crop: 'paddy',
    variety: 'Sona Masuri',
    sownDate: '2024-09-01',
    fieldSize_acres: 3 + i,
    soilType: 'black_cotton',
    district: 'Warangal',
    mandal: 'Warangal Urban',
    expectedQtl: (3 + i) * 18,
    quantityConfirmed: false,
    viability_days: 10 + i,
    harvestWeek: 1,
    status: 'growing',
    estimatedPrice: 2100,
    actualPrice: null,
}));

// 2 Paddy farmers Week 2 (YELLOW)
const PADDY_FARMERS_WEEK2 = [
    {
        uid: 'demo_farmer_w2_1',
        crop: 'paddy', variety: 'BPT-5204', sownDate: '2024-09-08',
        fieldSize_acres: 5, soilType: 'red_loam', district: 'Warangal', mandal: 'Hanamkonda',
        expectedQtl: 90, quantityConfirmed: false, viability_days: 18, harvestWeek: 2,
        status: 'growing', estimatedPrice: 2100, actualPrice: null,
    },
    {
        uid: 'demo_farmer_w2_2',
        crop: 'paddy', variety: 'RNR-15048', sownDate: '2024-09-10',
        fieldSize_acres: 4, soilType: 'black_cotton', district: 'Warangal', mandal: 'Hanamkonda',
        expectedQtl: 72, quantityConfirmed: false, viability_days: 20, harvestWeek: 2,
        status: 'growing', estimatedPrice: 2100, actualPrice: null,
    },
];

// 1 Paddy farmer Week 3 (GREEN)
const PADDY_FARMER_WEEK3 = {
    uid: 'demo_farmer_w3_1',
    crop: 'paddy', variety: 'MTU-1010', sownDate: '2024-09-15',
    fieldSize_acres: 6, soilType: 'black_cotton', district: 'Warangal', mandal: 'Kazipet',
    expectedQtl: 108, quantityConfirmed: false, viability_days: 25, harvestWeek: 3,
    status: 'growing', estimatedPrice: 2150, actualPrice: null,
};

// 1 Cotton farmer — emergency (viability_days=2)
const COTTON_EMERGENCY = {
    uid: 'demo_cotton_emergency',
    crop: 'cotton', variety: 'MCU-5', sownDate: '2024-08-01',
    fieldSize_acres: 4, soilType: 'black_cotton', district: 'Warangal', mandal: 'Warangal Urban',
    expectedQtl: 20, quantityConfirmed: false, viability_days: 2, harvestWeek: 1,
    status: 'growing', estimatedPrice: 7200, actualPrice: null,
};

// ─── Demo Users ──────────────────────────────────────────
const DEMO_USERS = [
    ...PADDY_FARMERS_WEEK1.map(f => ({
        uid: f.uid, name: `Farmer ${f.uid.slice(-1)}`, phone: `+9190000000${f.uid.slice(-2)}`,
        role: 'farmer', district: f.district, mandal: f.mandal, language: 'te',
    })),
    ...PADDY_FARMERS_WEEK2.map(f => ({
        uid: f.uid, name: `Farmer ${f.uid.slice(-1)}`, phone: `+919100000020`,
        role: 'farmer', district: f.district, mandal: f.mandal, language: 'te',
    })),
    {
        uid: PADDY_FARMER_WEEK3.uid, name: 'Ravi Kumar', phone: '+919100000030',
        role: 'farmer', district: PADDY_FARMER_WEEK3.district, mandal: PADDY_FARMER_WEEK3.mandal, language: 'te',
    },
    {
        uid: COTTON_EMERGENCY.uid, name: 'Suresh Cotton', phone: '+919100000040',
        role: 'farmer', district: COTTON_EMERGENCY.district, mandal: COTTON_EMERGENCY.mandal, language: 'te',
    },
];

// ─── Buyer Listings ──────────────────────────────────────
const BUYER_LISTINGS = [
    {
        listingId: 'listing_paddy_1', buyerUid: 'demo_buyer_1',
        crop: 'paddy', variety: 'Sona Masuri', quantityQtl: 100,
        targetDate: '2024-11-20', pricePerQtl: 2300,
        district: 'Warangal', isBelowMSP: false, status: 'open',
    },
    {
        listingId: 'listing_cotton_1', buyerUid: 'demo_buyer_2',
        crop: 'cotton', variety: 'MCU-5', quantityQtl: 50,
        targetDate: '2024-11-25', pricePerQtl: 7200,
        district: 'Warangal', isBelowMSP: false, status: 'open',
    },
    {
        listingId: 'listing_chilli_1', buyerUid: 'demo_buyer_3',
        crop: 'red_chilli', variety: 'Teja', quantityQtl: 30,
        targetDate: '2024-12-01', pricePerQtl: 8500,
        district: 'Khammam', isBelowMSP: false, status: 'open',
    },
];

// ─── Harvest Calendar ────────────────────────────────────
const HARVEST_CALENDAR = [
    {
        id: 'Warangal Urban_paddy_1',
        mandal: 'Warangal Urban', crop: 'paddy', week: 1,
        farmerCount: 8,
        farmerUids: PADDY_FARMERS_WEEK1.map(f => f.uid),
    },
    {
        id: 'Hanamkonda_paddy_2',
        mandal: 'Hanamkonda', crop: 'paddy', week: 2,
        farmerCount: 2,
        farmerUids: PADDY_FARMERS_WEEK2.map(f => f.uid),
    },
    {
        id: 'Kazipet_paddy_3',
        mandal: 'Kazipet', crop: 'paddy', week: 3,
        farmerCount: 1,
        farmerUids: [PADDY_FARMER_WEEK3.uid],
    },
    {
        id: 'Warangal Urban_cotton_1',
        mandal: 'Warangal Urban', crop: 'cotton', week: 1,
        farmerCount: 1,
        farmerUids: [COTTON_EMERGENCY.uid],
    },
];

async function seed() {
    console.log('🌾 Starting HarvestHub seed...\n');

    // MSP Values
    console.log('📊 Seeding MSP values...');
    for (const msp of MSP_VALUES) {
        await setDoc(doc(db, 'msp_values', msp.crop), { ...msp, updatedAt: Timestamp.now() });
        console.log(`  ✓ ${msp.crop}: ₹${msp.pricePerQtl}`);
    }

    // Users
    console.log('\n👤 Seeding users...');
    for (const user of DEMO_USERS) {
        await setDoc(doc(db, 'users', user.uid), { ...user, createdAt: Timestamp.now() });
        console.log(`  ✓ ${user.name} (${user.uid})`);
    }

    // Farmers Week 1
    console.log('\n🌾 Seeding Week 1 farmers (RED pressure)...');
    for (const farmer of PADDY_FARMERS_WEEK1) {
        await setDoc(doc(db, 'farmers', farmer.uid), farmer);
        console.log(`  ✓ ${farmer.uid}`);
    }

    // Farmers Week 2
    console.log('\n🌾 Seeding Week 2 farmers (YELLOW pressure)...');
    for (const farmer of PADDY_FARMERS_WEEK2) {
        await setDoc(doc(db, 'farmers', farmer.uid), farmer);
        console.log(`  ✓ ${farmer.uid}`);
    }

    // Farmer Week 3
    console.log('\n🌾 Seeding Week 3 farmer (GREEN pressure)...');
    await setDoc(doc(db, 'farmers', PADDY_FARMER_WEEK3.uid), PADDY_FARMER_WEEK3);
    console.log(`  ✓ ${PADDY_FARMER_WEEK3.uid}`);

    // Emergency Cotton
    console.log('\n⚠️  Seeding emergency cotton farmer (viability=2)...');
    await setDoc(doc(db, 'farmers', COTTON_EMERGENCY.uid), COTTON_EMERGENCY);
    console.log(`  ✓ ${COTTON_EMERGENCY.uid}`);

    // Buyer Listings
    console.log('\n🏪 Seeding buyer listings...');
    for (const listing of BUYER_LISTINGS) {
        await setDoc(doc(db, 'buyer_listings', listing.listingId), { ...listing, postedAt: Timestamp.now() });
        console.log(`  ✓ ${listing.crop}: ₹${listing.pricePerQtl}/qtl`);
    }

    // Harvest Calendar
    console.log('\n📅 Seeding harvest calendar...');
    for (const cal of HARVEST_CALENDAR) {
        const { id, ...data } = cal;
        await setDoc(doc(db, 'harvest_calendar', id), { ...data, updatedAt: Timestamp.now() });
        console.log(`  ✓ ${id}: ${data.farmerCount} farmers`);
    }

    console.log('\n✅ Seed complete! All collections populated.\n');
    console.log('Collections created:');
    console.log('  - users  (12 documents)');
    console.log('  - farmers (12 documents)');
    console.log('  - msp_values (5 documents)');
    console.log('  - buyer_listings (3 documents)');
    console.log('  - harvest_calendar (4 documents)');

    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
