/**
 * Formats a date string into a human-readable format.
 * Example: "May 2, 2026 at 3:30 PM"
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';

  const date = new Date(dateString);

  if (isNaN(date.getTime())) return '';

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  };

  const formatted = date.toLocaleString('en-US', options);

  // toLocaleString returns "May 2, 2026, 3:30 PM" — replace the comma before time with " at"
  return formatted.replace(/,([^,]*)$/, ' at$1');
};

/**
 * Alias for formatDate — formats a datetime string with date and time.
 * Example: "May 2, 2026 at 3:30 PM"
 */
export const formatDateTime = formatDate;
