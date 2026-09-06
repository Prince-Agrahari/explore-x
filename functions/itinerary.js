const MAX_STRING = 400;
const MAX_TIPS = 12;
const MAX_LIST = 8;
const MAX_SLOT_ITEMS = 6;

const asText = (value) => {
  if (typeof value !== 'string') return '';
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();
};

const asCost = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return Math.round(amount);
};

const dateForDay = (startDate, dayNumber) => {
  const date = new Date(`${startDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + (dayNumber - 1));
  return date.toISOString().slice(0, 10);
};

const asActivity = (item) => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const title = asText(item.title || item.activity || item.name).slice(0, MAX_STRING);
  const description = asText(item.description).slice(0, MAX_STRING);
  const estimatedCost = asCost(item.estimatedCost);
  if (!title || !description || estimatedCost === null) return null;
  return { title, description, estimatedCost };
};

const asActivityList = (value) => {
  if (Array.isArray(value)) {
    return value.map(asActivity).filter(Boolean).slice(0, MAX_SLOT_ITEMS);
  }
  const single = asActivity(value);
  return single ? [single] : [];
};

const asStringList = (value, limit) => {
  if (!Array.isArray(value)) return null;
  return value.map((item) => asText(item).slice(0, MAX_STRING)).filter(Boolean).slice(0, limit);
};

const parseModelJson = (text) => {
  if (text && typeof text === 'object' && !Array.isArray(text)) {
    return text;
  }
  const raw = String(text || '');
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) {
    throw Object.assign(new Error('MALFORMED_ITINERARY'), { code: 'malformed' });
  }
  try {
    return JSON.parse(match[0]);
  } catch {
    throw Object.assign(new Error('MALFORMED_ITINERARY'), { code: 'malformed' });
  }
};

const validateItinerary = (raw, trip) => {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw Object.assign(new Error('INVALID_ITINERARY'), { code: 'invalid' });
  }

  if (!Array.isArray(raw.days) || raw.days.length !== trip.days) {
    throw Object.assign(new Error('INVALID_ITINERARY'), { code: 'invalid' });
  }

  const days = raw.days.map((day, index) => {
    const dayNumber = Number(day?.day ?? day?.dayNumber);
    const title = asText(day?.title).slice(0, MAX_STRING);
    const morning = asActivityList(day?.morning);
    const afternoon = asActivityList(day?.afternoon);
    const evening = asActivityList(day?.evening);
    const estimatedCost = asCost(day?.estimatedCost);

    if (!Number.isInteger(dayNumber) || dayNumber !== index + 1) {
      throw Object.assign(new Error('INVALID_ITINERARY'), { code: 'invalid' });
    }
    if (!title || morning.length < 1 || afternoon.length < 1 || evening.length < 1 || estimatedCost === null) {
      throw Object.assign(new Error('INVALID_ITINERARY'), { code: 'invalid' });
    }

    return {
      day: dayNumber,
      title,
      date: dateForDay(trip.startDate, dayNumber),
      morning,
      afternoon,
      evening,
      estimatedCost,
    };
  });

  const generalTips = asStringList(raw.generalTips, MAX_TIPS);
  const accommodationSuggestions = asStringList(raw.accommodationSuggestions, MAX_LIST);
  const transportationOptions = asStringList(raw.transportationOptions, MAX_LIST);
  const totalEstimatedCost = asCost(raw.totalEstimatedCost);

  if (!generalTips || !accommodationSuggestions || !transportationOptions || totalEstimatedCost === null) {
    throw Object.assign(new Error('INVALID_ITINERARY'), { code: 'invalid' });
  }

  return {
    days,
    totalEstimatedCost,
    generalTips,
    accommodationSuggestions,
    transportationOptions,
  };
};

const buildPrompt = (trip) => `
Create a detailed travel itinerary for this trip.

Destination: ${trip.destination}
Start Date: ${trip.startDate}
End Date: ${trip.endDate}
Number of days: ${trip.days}
Budget: ₹${trip.budget} INR
Currency: Indian Rupees only. Put every estimatedCost and totalEstimatedCost in INR.
Number of travelers: ${trip.travelers}
Interests: ${trip.interests.join(', ')}
Accommodation preference: ${trip.accommodationType}
Transportation preference: ${trip.transportationType}
${trip.notes ? `Traveler notes: ${trip.notes}` : ''}

Return one JSON object only, with exactly ${trip.days} days.
Each day must include morning, afternoon, and evening arrays of activities.
Each activity must include title, description, and estimatedCost.
`;

const classifyGeminiError = (error) => {
  const status = Number(error?.status || error?.httpStatusCode || error?.code);
  const message = String(error?.message || error?.statusText || '').toLowerCase();

  if (error?.code === 'malformed' || error?.code === 'invalid') {
    return error.code;
  }
  if (
    status === 429
    || message.includes('quota')
    || message.includes('resource_exhausted')
    || message.includes('rate limit')
  ) {
    return 'quota';
  }
  if (message.includes('leaked') || message.includes('revoked')) {
    return 'revoked';
  }
  if (
    status === 401
    || status === 403
    || message.includes('api_key_invalid')
    || message.includes('api key not valid')
    || message.includes('permission_denied')
  ) {
    return 'config';
  }
  if (
    status === 404
    || status === 503
    || status === 500
    || message.includes('unavailable')
    || message.includes('overloaded')
    || message.includes('no longer available')
  ) {
    return 'unavailable';
  }
  return 'internal';
};

const shouldRetry = (kind, attempt) => {
  if (attempt >= 2) return false;
  return kind === 'unavailable' || kind === 'quota' || kind === 'malformed' || kind === 'invalid';
};

const retryDelayMs = (kind, attempt) => (kind === 'quota' ? 2000 * (attempt + 1) : 500 * (attempt + 1));

const INTERESTS = [
  'History', 'Art', 'Museums', 'Food', 'Nightlife', 'Shopping',
  'Nature', 'Adventure', 'Relaxation', 'Photography', 'Architecture', 'Local Culture',
  'Beaches', 'Hiking', 'Wildlife', 'Music', 'Sports', 'Family Activities',
];

const ACCOMMODATION_TYPES = ['Hotel', 'Hostel', 'Resort', 'Apartment', 'Guesthouse', 'Any'];
const TRANSPORTATION_TYPES = ['Public Transport', 'Rental Car', 'Walking/Biking', 'Guided Tours', 'Taxi/Rideshare', 'Any'];
const MAX_DESTINATION = 120;
const MAX_NOTES = 500;
const MAX_TRIP_DAYS = 21;
const MAX_TRAVELERS = 20;
const MAX_BUDGET = 10000000;

const dayCount = (startDate, endDate) => {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.floor((end - start) / 86400000) + 1;
};

const isIsoDate = (value) => /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

const inputError = (message) => Object.assign(new Error(message), { code: 'invalid-argument' });

const validateTripInput = (data) => {
  if (!data || typeof data !== 'object') {
    throw inputError('Trip details are required.');
  }

  const destination = asText(data.destination);
  const startDate = asText(data.startDate);
  const endDate = asText(data.endDate);
  const budget = Number(data.budget);
  const travelers = Number(data.travelers);
  const notes = asText(data.notes).slice(0, MAX_NOTES);
  const accommodationType = asText(data.accommodationType || 'Any');
  const transportationType = asText(data.transportationType || 'Any');
  const interests = Array.isArray(data.interests) ? data.interests.map((item) => asText(item)) : [];

  if (!destination || destination.length > MAX_DESTINATION) {
    throw inputError('Enter a destination of 1 to 120 characters.');
  }
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) {
    throw inputError('Start and end dates must be valid calendar dates.');
  }
  if (endDate < startDate) {
    throw inputError('End date cannot be before start date.');
  }

  const days = dayCount(startDate, endDate);
  if (days < 1 || days > MAX_TRIP_DAYS) {
    throw inputError(`Trips can be 1 to ${MAX_TRIP_DAYS} days.`);
  }
  if (!Number.isFinite(budget) || budget < 1 || budget > MAX_BUDGET) {
    throw inputError('Enter a valid budget in INR.');
  }
  if (!Number.isInteger(travelers) || travelers < 1 || travelers > MAX_TRAVELERS) {
    throw inputError('Enter between 1 and 20 travelers.');
  }
  if (interests.length < 1 || interests.length > 5 || interests.some((item) => !INTERESTS.includes(item))) {
    throw inputError('Choose 1 to 5 supported interests.');
  }
  if (!ACCOMMODATION_TYPES.includes(accommodationType)) {
    throw inputError('Choose a supported accommodation type.');
  }
  if (!TRANSPORTATION_TYPES.includes(transportationType)) {
    throw inputError('Choose a supported transportation type.');
  }

  return {
    destination,
    startDate,
    endDate,
    budget,
    travelers,
    interests,
    accommodationType,
    transportationType,
    notes,
    days,
  };
};

const userFacingMessage = (kind) => {
  if (kind === 'quota') return 'Gemini is at its quota limit. Please try again shortly.';
  if (kind === 'revoked') {
    return 'The Gemini API key was revoked because it was reported as leaked. Create a new key at https://aistudio.google.com/apikey, save it as GEMINI_API_KEY in functions/.env, and restart the dev server.';
  }
  if (kind === 'config') {
    return 'Itinerary generation is not configured. Add a valid GEMINI_API_KEY to functions/.env (never use a VITE_ prefix) and restart the dev server.';
  }
  if (kind === 'unavailable') return 'Gemini is temporarily unavailable. Please try again.';
  if (kind === 'malformed' || kind === 'invalid') return 'The generated itinerary was not valid. Please try again.';
  if (kind === 'unauthenticated') return 'You must be logged in to create a trip.';
  if (kind === 'invalid-argument') return 'Please check your trip details and try again.';
  return 'Failed to generate itinerary. Please try again later.';
};

const wait = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
});

const generateValidatedItinerary = async (requestText, trip) => {
  let lastKind = 'internal';

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const text = await requestText(trip);
      return validateItinerary(parseModelJson(text), trip);
    } catch (error) {
      lastKind = error?.code === 'invalid-argument' ? 'invalid-argument' : classifyGeminiError(error);
      if (lastKind === 'invalid-argument') {
        throw error;
      }
      if (!shouldRetry(lastKind, attempt)) {
        throw Object.assign(new Error(userFacingMessage(lastKind)), { kind: lastKind });
      }
      await wait(retryDelayMs(lastKind, attempt));
    }
  }

  throw Object.assign(new Error(userFacingMessage(lastKind)), { kind: lastKind });
};

module.exports = {
  asText,
  parseModelJson,
  validateItinerary,
  validateTripInput,
  buildPrompt,
  classifyGeminiError,
  shouldRetry,
  retryDelayMs,
  userFacingMessage,
  generateValidatedItinerary,
};
