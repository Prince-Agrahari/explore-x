import test from 'node:test';
import assert from 'node:assert/strict';
import { isValidItinerary, viewDay, viewSlots } from './itinerary.js';

const modern = {
  days: [
    {
      day: 1,
      title: 'Tea hills',
      morning: [{ title: 'Tea walk', description: 'Mist over the estate.', estimatedCost: 800 }],
      afternoon: [{ title: 'Viewpoints', description: 'Cardamom drive.', estimatedCost: 1500 }],
      evening: [{ title: 'Dinner', description: 'Homestay meal.', estimatedCost: 1200 }],
      estimatedCost: 3500,
    },
  ],
  totalEstimatedCost: 3500,
};

const legacy = {
  days: [
    {
      dayNumber: 1,
      morning: { activity: 'Tea walk', description: 'Mist over the estate.', estimatedCost: 800 },
      afternoon: { activity: 'Viewpoints', description: 'Cardamom drive.', estimatedCost: 1500 },
      evening: { activity: 'Dinner', description: 'Homestay meal.', estimatedCost: 1200 },
    },
  ],
  totalEstimatedCost: 3500,
};

test('accepts modern and legacy itineraries before save', () => {
  assert.equal(isValidItinerary(modern), true);
  assert.equal(isValidItinerary(legacy), true);
});

test('rejects malformed itineraries so they are never saved', () => {
  assert.equal(isValidItinerary(null), false);
  assert.equal(isValidItinerary({ days: [] }), false);
  assert.equal(isValidItinerary({ days: [{ day: 1, morning: [] }], totalEstimatedCost: 0 }), false);
  assert.equal(isValidItinerary({ days: [{ ...modern.days[0], day: 2 }], totalEstimatedCost: 10 }), false);
});

test('preserves the trip-details UI contract', () => {
  const viewed = viewDay(modern.days[0], 0);
  const slots = viewSlots(modern.days[0]);
  assert.equal(viewed.dayNumber, 1);
  assert.equal(viewed.title, 'Tea hills');
  assert.equal(slots[0].label, 'Morning');
  assert.equal(slots[0].activity, 'Tea walk');
  assert.equal(viewDay(legacy.days[0], 0).morning[0].activity, 'Tea walk');
});
