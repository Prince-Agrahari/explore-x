const { loadGeminiApiKey } = require('./secrets');
const { createGeminiClient, requestItineraryJson } = require('./gemini');
const { generateValidatedItinerary } = require('./itinerary');

const trip = {
  destination: 'Munnar',
  startDate: '2026-10-12',
  endDate: '2026-10-12',
  budget: 40000,
  travelers: 2,
  interests: ['Nature', 'Food'],
  accommodationType: 'Guesthouse',
  transportationType: 'Public Transport',
  notes: '',
  days: 1,
};

const main = async () => {
  const apiKey = loadGeminiApiKey();
  if (!apiKey) {
    console.log('SMOKE_SKIPPED: no server Gemini key configured');
    process.exit(0);
  }

  const ai = createGeminiClient(apiKey);
  const itinerary = await generateValidatedItinerary((validatedTrip) => (
    requestItineraryJson(ai, validatedTrip)
  ), trip);

  if (!itinerary.days[0].morning.length || itinerary.days.length !== 1) {
    throw new Error('validated itinerary failed shape check');
  }
  console.log('SMOKE_OK: structured itinerary validated');
};

main().catch((error) => {
  const status = error?.status || error?.kind || error?.code || error?.name || 'Error';
  const message = String(error?.message || error)
    .replace(/AIza[0-9A-Za-z_-]+/g, '[redacted]')
    .slice(0, 180);
  console.error('SMOKE_FAIL:', status, message);
  process.exit(1);
});
