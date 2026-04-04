const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

export interface LitterResult {
  count: number;
  items: { label: string; confidence: string }[];
  summary: string;
}

export async function detectLitter(base64Image: string): Promise<LitterResult> {
  const prompt = `You are a litter detection assistant. Analyze this outdoor photo and count all visible litter/trash items.

Respond ONLY with valid JSON in this exact format, no markdown, no explanation:
{
  "count": <number>,
  "items": [
    { "label": "<type of item e.g. plastic bottle, paper cup>", "confidence": "<high|medium|low>" }
  ],
  "summary": "<one sentence description of what you see>"
}

If there is no litter, return count: 0 and empty items array.`;

  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Image,
            },
          },
          { text: prompt },
        ],
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^[^{]*/,'')  // strip anything before the first {
      .replace(/[^}]*$/, '') // strip anything after the last }
      .trim();
    return JSON.parse(cleaned) as LitterResult;
  } catch {
    throw new Error('Failed to parse Gemini response: ' + text);
  }
}
