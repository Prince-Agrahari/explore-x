const asActivities = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => ({
        activity: item?.title || item?.activity || item?.name || '',
        description: item?.description || '',
        estimatedCost: Number(item?.estimatedCost) || 0,
      }))
      .filter((item) => item.activity);
  }

  if (value && typeof value === 'object') {
    const activity = value.title || value.activity || value.name || '';
    if (!activity) return [];
    return [{
      activity,
      description: value.description || '',
      estimatedCost: Number(value.estimatedCost) || 0,
    }];
  }

  return [];
};

export const isValidItinerary = (itinerary) => {
  if (!itinerary || typeof itinerary !== 'object' || !Array.isArray(itinerary.days) || itinerary.days.length < 1) {
    return false;
  }

  return itinerary.days.every((day, index) => {
    const dayNumber = Number(day?.day ?? day?.dayNumber);
    const morning = asActivities(day?.morning);
    const afternoon = asActivities(day?.afternoon);
    const evening = asActivities(day?.evening);
    return Number.isInteger(dayNumber)
      && dayNumber === index + 1
      && morning.length > 0
      && afternoon.length > 0
      && evening.length > 0
      && Number.isFinite(Number(itinerary.totalEstimatedCost));
  });
};

export const viewDay = (day, index = 0) => {
  const dayNumber = Number(day?.day ?? day?.dayNumber ?? index + 1);
  const morning = asActivities(day?.morning);
  const afternoon = asActivities(day?.afternoon);
  const evening = asActivities(day?.evening);
  const estimatedCost = Number.isFinite(Number(day?.estimatedCost))
    ? Number(day.estimatedCost)
    : [...morning, ...afternoon, ...evening, day?.accommodation].reduce(
      (sum, item) => sum + Number(item?.estimatedCost || 0),
      0
    );

  return {
    day: dayNumber,
    dayNumber,
    title: typeof day?.title === 'string' ? day.title : '',
    date: day?.date,
    morning,
    afternoon,
    evening,
    estimatedCost,
    accommodation: day?.accommodation && !Array.isArray(day.accommodation) ? day.accommodation : null,
  };
};

export const viewSlots = (day) => {
  const viewed = viewDay(day);
  return [
    ...viewed.morning.map((item) => ({ label: 'Morning', ...item })),
    ...viewed.afternoon.map((item) => ({ label: 'Afternoon', ...item })),
    ...viewed.evening.map((item) => ({ label: 'Evening', ...item })),
  ];
};
