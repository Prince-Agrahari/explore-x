import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../firebase/config';
import { isValidItinerary } from './itinerary';

const generateItineraryFn = httpsCallable(functions, 'generateItinerary', { timeout: 120000 });

const functionMessage = (error) => {
  const code = error?.code || '';
  const text = String(error?.message || '');
  if (code === 'functions/unauthenticated') {
    return 'You must be logged in to create a trip.';
  }
  if (code === 'functions/invalid-argument') {
    return error.message || 'Please check your trip details and try again.';
  }
  if (code === 'functions/failed-precondition') {
    return error.message || 'Itinerary generation is not configured. Add a valid GEMINI_API_KEY to functions/.env and restart the dev server.';
  }
  if (code === 'functions/resource-exhausted') {
    return 'Gemini is at its quota limit. Please try again shortly.';
  }
  if (code === 'functions/unavailable') {
    return 'Gemini is temporarily unavailable. Please try again.';
  }
  if (
    code === 'functions/internal'
    || /cors|failed to fetch|network|err_failed|preflight/i.test(text)
  ) {
    return 'Explore X could not reach the itinerary service. If you are on localhost, refresh and try again.';
  }
  return 'Failed to generate itinerary. Please try again later.';
};

const payload = (tripData) => ({
  destination: tripData.destination,
  startDate: tripData.startDate,
  endDate: tripData.endDate,
  budget: Number(tripData.budget),
  travelers: Number(tripData.travelers),
  interests: tripData.interests,
  accommodationType: tripData.accommodationType,
  transportationType: tripData.transportationType,
  notes: tripData.notes || '',
});

const generateViaLocalApi = async (tripData) => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error('You must be logged in to create a trip.');
  }

  const response = await fetch('/api/generate-itinerary', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload(tripData)),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Failed to generate itinerary. Please try again later.');
  }
  return data.itinerary;
};

const generateViaCallable = async (tripData) => {
  const result = await generateItineraryFn(payload(tripData));
  return result?.data?.itinerary;
};

export const generateItinerary = async (tripData) => {
  try {
    const itinerary = import.meta.env.DEV
      ? await generateViaLocalApi(tripData)
      : await generateViaCallable(tripData);

    if (!isValidItinerary(itinerary)) {
      throw new Error('The generated itinerary was not valid. Please try again.');
    }

    return itinerary;
  } catch (error) {
    if (error?.message && /itinerary|logged in|trip details|configured|quota|unavailable|localhost|api key|revoked|aistudio|gemini/i.test(error.message)) {
      throw error;
    }
    throw new Error(functionMessage(error));
  }
};
