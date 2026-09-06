export const formatDate = (dateString, options = { year: 'numeric', month: 'long', day: 'numeric' }) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatShortDate = (dateString) =>
  formatDate(dateString, { month: 'short', day: 'numeric', year: 'numeric' });

export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
};

export const greetingForNow = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};
