import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const MSP_VALUES: Record<string, number> = {
    paddy: 2183, cotton: 7121, maize: 2225, turmeric: 7000, red_chilli: 5500,
};

export async function POST(req: NextRequest) {
    try {
        const { farmerUid, listingId } = await req.json();
        if (!farmerUid || !listingId) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        // Get listing
        const listingSnap = await getDoc(doc(db, 'buyer_listings', listingId));
        if (!listingSnap.exists()) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });

        const listing = listingSnap.data();
        const msp = MSP_VALUES[listing.crop] || 2183;

        if (listing.pricePerQtl < msp) {
            return NextResponse.json({
                success: false,
                reason: 'below_msp',
                message: `This offer is below the MSP of ₹${msp}/quintal for ${listing.crop}.`,
            });
        }

        if (listing.status !== 'open') {
            return NextResponse.json({ success: false, reason: 'not_available', message: 'This listing is no longer available.' });
        }

        // Create match
        const matchId = `match_${farmerUid}_${listingId}_${Date.now()}`;
        await setDoc(doc(db, 'matches', matchId), {
            matchId,
            farmerUid,
            buyerUid: listing.buyerUid,
            listingId,
            crop: listing.crop,
            quantityQtl: listing.quantityQtl,
            pricePerQtl: listing.pricePerQtl,
            matchedAt: serverTimestamp(),
        });

        // Update listing status
        await setDoc(doc(db, 'buyer_listings', listingId), { ...listing, status: 'matched' });

        return NextResponse.json({ success: true, matchId });
    } catch (error) {
        console.error('Accept error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
