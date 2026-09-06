const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseModelJson,
  validateItinerary,
  classifyGeminiError,
  shouldRetry,
} = require('./itinerary');

const trip = {
  destination: 'Munnar',
  startDate: '2026-10-01',
  endDate: '2026-10-02',
  days: 2,
};

const validDay = (day) => ({
  day,
  title: `Hills and tea, day ${day}`,
  morning: [{ title: 'Tea walk', description: 'Walk the estates while mist lifts.', estimatedCost: 800 }],
  afternoon: [{ title: 'Viewpoints', description: 'Quiet drive through cardamom hills.', estimatedCost: 1500 }],
  evening: [{ title: 'Homestay dinner', description: 'Simple Kerala meal at the stay.', estimatedCost: 1200 }],
  estimatedCost: 3500,
});

const validItinerary = {
  days: [validDay(1), validDay(2)],
  totalEstimatedCost: 7000,
  generalTips: ['Carry a light jacket.'],
  accommodationSuggestions: ['Tea-estate homestay'],
  transportationOptions: ['Private cab'],
};

test('accepts a complete structured itinerary', () => {
  const result = validateItinerary(validItinerary, trip);
  assert.equal(result.days.length, 2);
  assert.equal(result.days[0].day, 1);
  assert.equal(result.days[0].date, '2026-10-01');
  assert.equal(result.days[1].date, '2026-10-02');
  assert.equal(result.days[0].morning[0].title, 'Tea walk');
  assert.equal(result.totalEstimatedCost, 7000);
});

test('rejects malformed JSON', () => {
  assert.throws(() => parseModelJson('not json'), { code: 'malformed' });
  assert.throws(() => parseModelJson(''), { code: 'malformed' });
});

test('parses JSON buried in extra text', () => {
  const parsed = parseModelJson(`Here you go\n${JSON.stringify(validItinerary)}\nthanks`);
  assert.equal(parsed.days.length, 2);
});

test('rejects missing days, empty slots, and wrong day count', () => {
  assert.throws(() => validateItinerary({ ...validItinerary, days: [validDay(1)] }, trip), { code: 'invalid' });
  assert.throws(
    () => validateItinerary({ ...validItinerary, days: [{ ...validDay(1), morning: [] }, validDay(2)] }, trip),
    { code: 'invalid' }
  );
  assert.throws(() => validateItinerary({ generalTips: [] }, trip), { code: 'invalid' });
  assert.throws(() => validateItinerary(null, trip), { code: 'invalid' });
});

test('classifies quota and availability errors', () => {
  assert.equal(classifyGeminiError({ status: 429 }), 'quota');
  assert.equal(classifyGeminiError({ message: 'RESOURCE_EXHAUSTED quota exceeded' }), 'quota');
  assert.equal(classifyGeminiError({ status: 503 }), 'unavailable');
  assert.equal(classifyGeminiError({ status: 401 }), 'config');
  assert.equal(classifyGeminiError({ message: 'Your API key was reported as leaked. Please use another API key.' }), 'revoked');
  assert.equal(classifyGeminiError({ code: 'malformed' }), 'malformed');
});

test('retries quota, availability, and malformed itineraries', () => {
  assert.equal(shouldRetry('unavailable', 0), true);
  assert.equal(shouldRetry('quota', 1), true);
  assert.equal(shouldRetry('quota', 2), false);
  assert.equal(shouldRetry('malformed', 0), true);
  assert.equal(shouldRetry('invalid', 0), true);
  assert.equal(shouldRetry('config', 0), false);
  assert.equal(shouldRetry('revoked', 0), false);
});
