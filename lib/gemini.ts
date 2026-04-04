const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

//expected structure of result from gemini
export interface LitterResult {
  count: number;
  items: { label: string; confidence: string }[];
  summary: string;
}

//sends a base64 image to gemini, returns structured litter count
export async function detectLitter(base64Image: string): Promise<LitterResult> {
  //prompt
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
            //inline_data sends image directly in the request body
            //simpler than google file API
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
        //low temp good for structured output
        temperature: 0.1,
        //max tokens for 2.0, was running into issues with lower tokens for images with a lot of litter
        //TODO probably increase this since switched to 2.5
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
    //gemini kept wrapping response with the ```json ...``` thing even when told not to
    //strip answer here and trim just in case due to repeated errors
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .replace(/^[^{]*/,'')  // strip anything before the first {
      .replace(/[^}]*$/, '') // strip anything after the last }
      .trim();
    return JSON.parse(cleaned) as LitterResult;
  } catch {
    throw new Error('Failed to parse Gemini response: ' + text); //if failing show exact output
  }
}
