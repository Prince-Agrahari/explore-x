export const formatINR = (value) => {
  if (value === null || value === undefined || value === '' || value === 'N/A') {
    return 'N/A';
  }
  const amount = Number(value);
  if (Number.isNaN(amount)) {
    return 'N/A';
  }
  return `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};
