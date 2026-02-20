import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');

    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });

    try {
        const [farmerSnap, userSnap] = await Promise.all([
            getDoc(doc(db, 'farmers', uid)),
            getDoc(doc(db, 'users', uid)),
        ]);

        if (!farmerSnap.exists()) return NextResponse.json({ error: 'Farmer not found' }, { status: 404 });

        const farmer = farmerSnap.data();
        const user = userSnap.data();

        // Get MSP for this crop
        const mspSnap = await getDoc(doc(db, 'msp_values', farmer.crop));
        const msp = mspSnap.exists() ? mspSnap.data().pricePerQtl : 2183;

        // Get supply pressure from harvest_calendar
        const calKey = `${farmer.mandal}_${farmer.crop}_${farmer.harvestWeek}`;
        const calSnap = await getDoc(doc(db, 'harvest_calendar', calKey));
        const farmerCount = calSnap.exists() ? calSnap.data().farmerCount : 1;

        let supplyLevel: 'green' | 'yellow' | 'red' = 'green';
        if (farmerCount >= 5) supplyLevel = 'red';
        else if (farmerCount >= 3) supplyLevel = 'yellow';

        // Viability status
        const vd = farmer.viability_days;
        const viabilityStatus = vd > 7 ? 'green' : vd >= 3 ? 'yellow' : 'red';

        return NextResponse.json({
            farmer: {
                uid,
                name: user?.name || '',
                crop: farmer.crop,
                variety: farmer.variety,
                sownDate: farmer.sownDate,
                fieldSize_acres: farmer.fieldSize_acres,
                expectedQtl: farmer.expectedQtl,
                viability_days: farmer.viability_days,
                harvestWeek: farmer.harvestWeek,
                status: farmer.status,
                estimatedPrice: farmer.estimatedPrice,
                actualPrice: farmer.actualPrice,
            },
            supply_pressure: {
                farmer_count: farmerCount,
                level: supplyLevel,
                label: `Based on ${farmerCount} farmers in your mandal`,
            },
            msp,
            current_mandi_price: farmer.estimatedPrice || 2100,
            viability_status: viabilityStatus,
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
