export const INTERESTS = [
  'History', 'Art', 'Museums', 'Food', 'Nightlife', 'Shopping',
  'Nature', 'Adventure', 'Relaxation', 'Photography', 'Architecture', 'Local Culture',
  'Beaches', 'Hiking', 'Wildlife', 'Music', 'Sports', 'Family Activities',
];

export const ACCOMMODATION_TYPES = ['Hotel', 'Hostel', 'Resort', 'Apartment', 'Guesthouse', 'Any'];
export const TRANSPORTATION_TYPES = ['Public Transport', 'Rental Car', 'Walking/Biking', 'Guided Tours', 'Taxi/Rideshare', 'Any'];

export const EMPTY_TRIP_FORM = {
  destination: '',
  startDate: '',
  endDate: '',
  budget: '',
  travelers: 1,
  interests: [],
  accommodationType: 'Any',
  transportationType: 'Any',
  notes: '',
};

const todayStamp = () => new Date().toISOString().split('T')[0];

export const toDateInput = (value) => {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  if (typeof value.toDate === 'function') return value.toDate().toISOString().slice(0, 10);
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value.seconds === 'number') return new Date(value.seconds * 1000).toISOString().slice(0, 10);
  return '';
};

export const tripToForm = (trip) => ({
  destination: trip.destination || '',
  startDate: toDateInput(trip.startDate),
  endDate: toDateInput(trip.endDate),
  budget: trip.budget ?? '',
  travelers: trip.travelers || 1,
  interests: Array.isArray(trip.interests) ? trip.interests.filter((item) => INTERESTS.includes(item)) : [],
  accommodationType: ACCOMMODATION_TYPES.includes(trip.accommodationType) ? trip.accommodationType : 'Any',
  transportationType: TRANSPORTATION_TYPES.includes(trip.transportationType) ? trip.transportationType : 'Any',
  notes: trip.notes || '',
});

export const generationPayload = (formData) => ({
  destination: formData.destination,
  startDate: formData.startDate,
  endDate: formData.endDate,
  budget: Number(formData.budget),
  travelers: Number(formData.travelers),
  interests: formData.interests,
  accommodationType: formData.accommodationType,
  transportationType: formData.transportationType,
  notes: formData.notes || '',
});

export const validateStep1 = (formData, { originalStartDate } = {}) => {
  if (!formData.destination) return 'Please enter a destination';
  if (!formData.startDate) return 'Please select a start date';
  if (!formData.endDate) return 'Please select an end date';

  const start = new Date(formData.startDate);
  const end = new Date(formData.endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const isOriginalStart = originalStartDate && formData.startDate === originalStartDate;
  if (start < today && !isOriginalStart) return 'Start date cannot be in the past';
  if (end < start) return 'End date cannot be before start date';

  return null;
};

export const validateStep2 = (formData) => {
  if (!formData.budget || isNaN(formData.budget) || formData.budget <= 0) {
    return 'Please enter a valid budget amount';
  }
  if (!formData.travelers || isNaN(formData.travelers) || formData.travelers < 1) {
    return 'Please enter at least 1 traveler';
  }
  if (formData.interests.length === 0) {
    return 'Please select at least one interest';
  }
  return null;
};

export const minStartDate = (originalStartDate) => {
  const today = todayStamp();
  if (originalStartDate && originalStartDate < today) return originalStartDate;
  return today;
};
