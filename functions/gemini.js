const { GoogleGenAI, Type } = require('@google/genai');
const { buildPrompt } = require('./itinerary');

const GEMINI_MODELS = [...new Set([
  process.env.GEMINI_MODEL,
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
].filter(Boolean))];

const activitySchema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    estimatedCost: { type: Type.NUMBER },
  },
  required: ['title', 'description', 'estimatedCost'],
};

const itinerarySchema = {
  type: Type.OBJECT,
  properties: {
    days: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          morning: { type: Type.ARRAY, items: activitySchema },
          afternoon: { type: Type.ARRAY, items: activitySchema },
          evening: { type: Type.ARRAY, items: activitySchema },
          estimatedCost: { type: Type.NUMBER },
        },
        required: ['day', 'title', 'morning', 'afternoon', 'evening', 'estimatedCost'],
      },
    },
    totalEstimatedCost: { type: Type.NUMBER },
    generalTips: { type: Type.ARRAY, items: { type: Type.STRING } },
    accommodationSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
    transportationOptions: { type: Type.ARRAY, items: { type: Type.STRING } },
  },
  required: ['days', 'totalEstimatedCost', 'generalTips', 'accommodationSuggestions', 'transportationOptions'],
};

const extractText = (response) => {
  if (typeof response?.text === 'function') return response.text();
  if (typeof response?.text === 'string') return response.text;
  const part = response?.candidates?.[0]?.content?.parts?.find((item) => item.text);
  return part?.text || '';
};

const isModelUnavailable = (error) => {
  const status = Number(error?.status || error?.httpStatusCode);
  const message = String(error?.message || '').toLowerCase();
  return status === 404
    || message.includes('no longer available')
    || message.includes('not found')
    || message.includes('is not supported');
};

const createGeminiClient = (apiKey) => new GoogleGenAI({ apiKey });

const requestItineraryJson = async (ai, trip) => {
  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: buildPrompt(trip),
        config: {
          responseMimeType: 'application/json',
          responseSchema: itinerarySchema,
        },
      });
      return extractText(response);
    } catch (error) {
      lastError = error;
      if (isModelUnavailable(error)) continue;
      throw error;
    }
  }

  throw lastError || Object.assign(new Error('Gemini model is unavailable.'), { status: 503 });
};

module.exports = {
  GEMINI_MODELS,
  Type,
  itinerarySchema,
  createGeminiClient,
  requestItineraryJson,
};
