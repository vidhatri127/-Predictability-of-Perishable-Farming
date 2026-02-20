import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const MOCK_HARVEST = {
    recommended_window: 'Nov 14–18',
    emergency_sell: false,
    reasoning_telugu: 'మీ పొలంలో పంట సిద్ధంగా ఉంది. నవంబర్ 14-18 మధ్య కోత చేస్తే మంచి ధర పొందవచ్చు. మీ మండలంలో తక్కువ మంది రైతులు ఆ వారంలో కోత చేయడం వల్ల మంచి మార్కెట్ లభిస్తుంది.',
    reasoning_english: 'Only 2 farmers harvest that week — prices will be higher. Weather conditions are favorable. Harvest now to maximize price.',
    price_estimate: '₹2,100–2,300/quintal',
};

const MOCK_HARVEST_EMERGENCY = {
    recommended_window: null,
    emergency_sell: true,
    reasoning_telugu: 'మీ పంట వెంటనే కోయాలి! ఆలస్యం చేస్తే పూర్తి నష్టం జరుగుతుంది. ఇప్పుడే కోత చేయండి.',
    reasoning_english: 'Your crop must be harvested now. Waiting risks complete loss.',
    price_estimate: null,
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { viability_days } = body;
        const mockGemini = process.env.MOCK_GEMINI !== 'false';

        if (mockGemini) {
            if (viability_days < 3) return NextResponse.json(MOCK_HARVEST_EMERGENCY);
            return NextResponse.json(MOCK_HARVEST);
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `You are an agricultural advisor for Telangana farmers.
Given the following data, recommend the optimal harvest window:
${JSON.stringify(body, null, 2)}

Return ONLY a JSON object. No markdown. No explanation. No code blocks.
Schema:
{
  "recommended_window": "string or null",
  "emergency_sell": boolean,
  "reasoning_telugu": "string in Telugu script",
  "reasoning_english": "string",
  "price_estimate": "string or null"
}

If viability_days < 3, set emergency_sell: true and recommended_window: null.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Invalid response from Gemini');
        return NextResponse.json(JSON.parse(jsonMatch[0]));

    } catch (error) {
        console.error('Harvest API error:', error);
        return NextResponse.json({
            recommended_window: 'This week',
            emergency_sell: false,
            reasoning_telugu: 'సమాచారం అందుబాటులో లేదు. మంచి వాతావరణంలో కోత చేయండి.',
            reasoning_english: 'Recommendation temporarily unavailable. Harvest when weather is clear.',
            price_estimate: null,
        });
    }
}
