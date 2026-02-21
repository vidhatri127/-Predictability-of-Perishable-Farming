// scripts/seed_showcase.ts
// Run: npx ts-node scripts/seed_showcase.ts

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

const SHOWCASE_FARMERS = [
    {
        uid: 'showcase_farmer_1',
        phone: '+910000000001',
        name: 'Venkatesh (Paddy - Wait Scenario)',
        crop: 'paddy',
        variety: 'Sona Masuri',
        mandal: 'Warangal Urban',
        district: 'Warangal',
        sownDate: '2024-09-01',
        fieldSize_acres: 5,
        expectedQtl: 90,
        status: 'harvested',
        harvestWeek: 1,
        viability_days: 12,
        estimatedPrice: 2200,
        actualPrice: null,
        description: 'High viability and high supply pressure (8 farmers) triggers a WAIT recommendation.'
    },
    {
        uid: 'showcase_farmer_2',
        phone: '+910000000002',
        name: 'Anila (Cotton - Sell Scenario)',
        crop: 'cotton',
        variety: 'MCU-5',
        mandal: 'Hanamkonda',
        district: 'Warangal',
        sownDate: '2024-08-15',
        fieldSize_acres: 4,
        expectedQtl: 20,
        status: 'harvested',
        harvestWeek: 2,
        viability_days: 8,
        estimatedPrice: 7200,
        actualPrice: null,
        description: 'Low supply pressure and decent price triggers a SELL recommendation.'
    },
    {
        uid: 'showcase_farmer_3',
        phone: '+910000000003',
        name: 'Rajesh (Maize - Emergency)',
        crop: 'maize',
        variety: 'Hybrid',
        mandal: 'Kazipet',
        district: 'Warangal',
        sownDate: '2024-09-10',
        fieldSize_acres: 6,
        expectedQtl: 108,
        status: 'harvested',
        harvestWeek: 1,
        viability_days: 2,
        estimatedPrice: 2250,
        actualPrice: null,
        description: 'Critical viability (2 days) triggers EMERGENCY SELL banner.'
    },
    {
        uid: 'showcase_farmer_4',
        phone: '+910000000004',
        name: 'Swapna (Turmeric - Growing)',
        crop: 'turmeric',
        variety: 'Salem',
        mandal: 'Parkal',
        district: 'Warangal',
        sownDate: '2024-10-01',
        fieldSize_acres: 3,
        expectedQtl: 54,
        status: 'growing',
        harvestWeek: 4,
        viability_days: 25,
        estimatedPrice: 7000,
        actualPrice: null,
        description: 'Crop in growing phase shows Market Forecast instead of Sell Intelligence.'
    },
    {
        uid: 'showcase_farmer_5',
        phone: '+910000000005',
        name: 'Srinivas (Chilli - Sold)',
        crop: 'red_chilli',
        variety: 'Teja',
        mandal: 'Mulugu',
        district: 'Warangal',
        sownDate: '2024-08-01',
        fieldSize_acres: 2,
        expectedQtl: 40,
        status: 'sold',
        harvestWeek: 1,
        viability_days: 0,
        estimatedPrice: 5600,
        actualPrice: 5800,
        description: 'Sold status shows Profit Tracker and Receipt View.'
    }
];

const REGIONAL_STATS = [
    { key: 'Warangal Urban_paddy_1', farmerCount: 8, level: 'red' }, // High pressure for Farmer 1
    { key: 'Hanamkonda_cotton_2', farmerCount: 1, level: 'green' }, // Low pressure for Farmer 2
    { key: 'Kazipet_maize_1', farmerCount: 2, level: 'green' },
    { key: 'Parkal_turmeric_4', farmerCount: 3, level: 'yellow' },
    { key: 'Mulugu_red_chilli_1', farmerCount: 5, level: 'red' }
];

async function seed() {
    console.log('🌟 Seeding Showcase Data into Firestore...\n');

    for (const data of SHOWCASE_FARMERS) {
        const { description, phone, name, ...farmerData } = data;

        // Seed User
        await setDoc(doc(db, 'users', data.uid), {
            uid: data.uid,
            phone: phone,
            name: name,
            role: 'farmer',
            district: data.district,
            mandal: data.mandal,
            onboarded: true,
            createdAt: Timestamp.now()
        });
        console.log(`👤 User: ${name} (${phone})`);

        // Seed Farmer
        await setDoc(doc(db, 'farmers', data.uid), {
            ...farmerData,
            name,
            lastUpdated: Timestamp.now().toDate().toISOString()
        });
        console.log(`🌾 Farmer Profile: ${data.crop} - ${description}`);
    }

    console.log('\n📊 Seeding Regional Stats...');
    for (const stat of REGIONAL_STATS) {
        await setDoc(doc(db, 'regional_stats', stat.key), {
            farmerCount: stat.farmerCount,
            level: stat.level,
            updatedAt: Timestamp.now()
        });
        console.log(`📈 ${stat.key}: ${stat.farmerCount} farmers`);
    }

    console.log('\n✅ Showcase seed complete!');
    process.exit(0);
}

seed().catch(err => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
