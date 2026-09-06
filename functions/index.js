const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const { createGeminiClient, requestItineraryJson } = require('./gemini');
const {
  classifyGeminiError,
  generateValidatedItinerary,
  userFacingMessage,
  validateTripInput,
} = require('./itinerary');

const geminiApiKey = defineSecret('GEMINI_API_KEY');

const toHttpsError = (error) => {
  if (error instanceof HttpsError) return error;
  if (error?.code === 'invalid-argument') {
    return new HttpsError('invalid-argument', error.message);
  }
  const kind = error?.kind || classifyGeminiError(error);
  const message = userFacingMessage(kind);
  if (kind === 'quota') return new HttpsError('resource-exhausted', message);
  if (kind === 'config' || kind === 'revoked') return new HttpsError('failed-precondition', message);
  if (kind === 'unavailable') return new HttpsError('unavailable', message);
  return new HttpsError('internal', message);
};

exports.generateItinerary = onCall(
  {
    secrets: [geminiApiKey],
    cors: [
      /localhost(:\d+)?$/,
      /127\.0\.0\.1(:\d+)?$/,
      /\.web\.app$/,
      /\.firebaseapp\.com$/,
    ],
    timeoutSeconds: 120,
    memory: '512MiB',
    region: 'us-central1',
  },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError('unauthenticated', 'Sign in to generate an itinerary.');
    }

    try {
      const trip = validateTripInput(request.data);
      const apiKey = geminiApiKey.value() || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new HttpsError('failed-precondition', userFacingMessage('config'));
      }
      const ai = createGeminiClient(apiKey);
      const itinerary = await generateValidatedItinerary((validatedTrip) => (
        requestItineraryJson(ai, validatedTrip)
      ), trip);
      return { itinerary };
    } catch (error) {
      if (error instanceof HttpsError) throw error;
      console.error('Itinerary generation failed', error?.name || 'Error');
      throw toHttpsError(error);
    }
  }
);
