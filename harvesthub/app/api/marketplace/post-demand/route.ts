import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MSP_VALUES: Record<string, number> = {
    paddy: 2183, cotton: 7121, maize: 2225, turmeric: 7000, red_chilli: 5500,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { buyerUid, crop, variety, quantityQtl, targetDate, pricePerQtl, district } = body;

        if (!buyerUid || !crop || !quantityQtl || !pricePerQtl) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const msp = MSP_VALUES[crop] || 2183;
        const isBelowMSP = pricePerQtl < msp;
        const listingId = `listing_${buyerUid}_${Date.now()}`;

        await setDoc(doc(db, 'buyer_listings', listingId), {
            listingId,
            buyerUid,
            crop,
            variety: variety || '',
            quantityQtl: Number(quantityQtl),
            targetDate: targetDate || '',
            pricePerQtl: Number(pricePerQtl),
            district: district || '',
            isBelowMSP,
            status: 'open',
            postedAt: serverTimestamp(),
        });

        return NextResponse.json({ success: true, listingId, isBelowMSP });
    } catch (error) {
        console.error('Post demand error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
