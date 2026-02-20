import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const crop = searchParams.get('crop') || 'paddy';
    const days = parseInt(searchParams.get('days') || '30');

    const agmarknetKey = process.env.AGMARKNET_API_KEY;

    // Try Agmarknet API if key is available
    if (agmarknetKey) {
        try {
            // Agmarknet API integration would go here
            // For now, fall through to fallback
        } catch {
            // Fall through to fallback
        }
    }

    // Load fallback data
    try {
        const fallbackPath = join(process.cwd(), 'public', 'fallback-data', 'mandi-prices.json');
        const raw = readFileSync(fallbackPath, 'utf-8');
        const data = JSON.parse(raw);

        const cropData = data[crop] || data['paddy'];
        const prices = cropData.prices.slice(-days);

        return NextResponse.json({
            crop,
            apmc: cropData.apmc || 'Warangal',
            days,
            prices,
            current_price: prices[prices.length - 1]?.price || 2100,
            source: 'fallback',
        });
    } catch {
        // If fallback also fails, return generated data
        const today = new Date();
        const prices = Array.from({ length: days }, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - (days - i));
            return { date: d.toISOString().split('T')[0], price: 2050 + Math.floor(Math.random() * 200) };
        });
        return NextResponse.json({ crop, apmc: 'Warangal', days, prices, current_price: 2100, source: 'fallback' });
    }
}
