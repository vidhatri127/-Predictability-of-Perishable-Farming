import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const FALLBACK = {
    estimated_quintals: 90, range_low: 76, range_high: 104,
    basis: 'District average for Sona Masuri in Warangal Kharif 2024',
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const mockGemini = process.env.MOCK_GEMINI !== 'false';

        if (mockGemini) {
            const acres = body.fieldSize_acres || 5;
            const estimated = Math.round(acres * 18);
            return NextResponse.json({
                estimated_quintals: estimated,
                range_low: Math.round(estimated * 0.85),
                range_high: Math.round(estimated * 1.15),
                basis: `District average for ${body.variety || 'your crop'} in ${body.district || 'your district'} Kharif 2024`,
            });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an agricultural yield estimator for Telangana.
Given: ${JSON.stringify(body, null, 2)}
Return ONLY a JSON object. No markdown. No explanation. No code blocks.
Schema: { "estimated_quintals": number, "range_low": number, "range_high": number, "basis": "string" }`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid response');
        return NextResponse.json(JSON.parse(jsonMatch[0]));

    } catch (error) {
        console.error('Quantity API error:', error);
        return NextResponse.json(FALLBACK);
    }
}
