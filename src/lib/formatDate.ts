export function formatAppleDate(date: Date) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateObj = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
  });
  
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
  });

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (dateObj.getTime() === today.getTime()) {
      return `Today at ${timeFormatter.format(date)}`;
  } else if (dateObj.getTime() === yesterday.getTime()) {
      return `Yesterday at ${timeFormatter.format(date)}`;
  } else if (dateObj.getTime() === tomorrow.getTime()) {
      return `Tomorrow at ${timeFormatter.format(date)}`;
  } else {
      return `${dateFormatter.format(date)} at ${timeFormatter.format(date)}`;
  }
}
