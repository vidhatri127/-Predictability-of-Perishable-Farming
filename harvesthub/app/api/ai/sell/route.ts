import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MOCK_SELL = {
    decision: 'Sell Now',
    wait_days: null,
    factor_breakdown: [
        { factor: 'Crop Viability', status: '10 days — OK', impact: 'none' },
        { factor: 'Weather', status: 'Clear for 3 days', impact: 'none' },
        { factor: 'Price vs MSP', status: 'Above MSP — GOOD', impact: 'none' },
        { factor: 'Supply Pressure', status: '2 farmers — LOW', impact: 'none' },
        { factor: 'Storage', status: '70% full — OK', impact: 'none' },
        { factor: 'Transport', status: 'Medium availability', impact: 'act soon' },
        { factor: 'Buyer Demand', status: 'Matched offer ₹2300 — GOOD', impact: 'accept offer' },
    ],
    reasoning_telugu: 'వాతావరణం అనుకూలంగా ఉంది. కొనుగోలుదారు మంచి ధర ఇస్తున్నారు. ఇప్పుడు అమ్మడం లాభకరం.',
    reasoning_english: 'Weather is clear for 3 days. A matched buyer offers ₹2300 which is above MSP. Recommend selling now.',
};

const MOCK_SELL_EMERGENCY = {
    decision: 'Emergency: Sell Immediately',
    wait_days: null,
    factor_breakdown: [
        { factor: 'Crop Viability', status: '2 days — CRITICAL', impact: 'sell immediately' },
        { factor: 'Weather', status: 'Rain expected', impact: 'harvest now' },
        { factor: 'Price vs MSP', status: 'Any price — accept', impact: 'avoid total loss' },
        { factor: 'Supply Pressure', status: 'Emergency override', impact: 'sell immediately' },
        { factor: 'Storage', status: 'No time to store', impact: 'sell immediately' },
        { factor: 'Transport', status: 'Arrange urgently', impact: 'sell immediately' },
        { factor: 'Buyer Demand', status: 'Take any offer', impact: 'sell immediately' },
    ],
    reasoning_telugu: 'మీ పంట 2 రోజుల్లో పాడవుతుంది! వెంటనే అమ్మండి. ఆలస్యం చేస్తే పూర్తి నష్టం జరుగుతుంది.',
    reasoning_english: 'EMERGENCY: Your crop will spoil in 2 days. Sell immediately at any available price to avoid total loss.',
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { viability_days } = body;
        const mockGemini = process.env.MOCK_GEMINI !== 'false';

        if (mockGemini) {
            if (viability_days < 3) return NextResponse.json(MOCK_SELL_EMERGENCY);
            return NextResponse.json(MOCK_SELL);
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are a sell/wait advisor for Telangana farmers.
Analyze these 7 factors and give a sell/wait recommendation:
${JSON.stringify(body, null, 2)}

Return ONLY a JSON object. No markdown. No explanation. No code blocks.
Schema:
{
  "decision": "Sell Now" | "Wait X days" | "Emergency: Sell Immediately",
  "wait_days": number | null,
  "factor_breakdown": [
    { "factor": string, "status": string, "impact": string }
  ],
  "reasoning_telugu": "string in Telugu script",
  "reasoning_english": "string"
}
If viability_days < 3, decision must be "Emergency: Sell Immediately".`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid response');
        return NextResponse.json(JSON.parse(jsonMatch[0]));

    } catch (error) {
        console.error('Sell API error:', error);
        return NextResponse.json(MOCK_SELL);
    }
}
