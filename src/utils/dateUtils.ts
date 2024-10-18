// src/utils/dateUtils.ts

import { format, formatDistanceToNow, isToday, isValid } from 'date-fns';

/**
 * Calculates the number of days since the creation date.
 * @param creationDate - The creation date as a string.
 * @returns Number of days since creation.
 */
export const getDaysSinceCreation = (creationDate: string): number => {
  const startDate = new Date(creationDate);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Formats the timestamp for display.
 * @param timestamp - The timestamp as a string.
 * @returns A formatted date string or 'Invalid date' if the timestamp is invalid.
 */
export const formatTimestamp = (timestamp: string): string => {
  if (!timestamp) {
    console.error('Invalid timestamp provided: Empty string');
    return 'Invalid date';
  }

  const date = new Date(timestamp);

  // Safeguard to prevent crashes if the date is invalid
  if (!isValid(date)) {
    console.error('Invalid timestamp provided:', timestamp);
    return 'Invalid date';
  }

  if (isToday(date)) {
    return format(date, 'h:mm a'); // Format as time for today
  } else {
    // Use formatDistanceToNow to show how long ago the message was created
    return formatDistanceToNow(date, { addSuffix: true });
  }
};

/**
 * Formats the date string into a relative time description.
 * @param dateString - The date string to format.
 * @returns A formatted relative time string.
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) {
    console.error('Invalid date string provided: Empty string');
    return 'Invalid date';
  }

  const date = new Date(dateString);
  const now = new Date();

  if (!isValid(date)) {
    console.error('Invalid date string provided:', dateString);
    return 'Invalid date';
  }

  const diff = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minute(s) ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour(s) ago`;
  } else if (diffDays === 1) {
    return `Yesterday`;
  } else {
    return `${diffDays} day(s) ago`;
  }
};


/**
 * Formats a timestamp into a human-readable "time ago" string.
 * - 0-7 days: "x day(s) ago"
 * - 8 days - 4 weeks: "x week(s) ago"
 * - 29 days - 12 months: "x month(s) ago"
 * - > 365 days: "x year(s) y month(s) ago"
 *
 * @param timestamp - The upload timestamp as a string (ISO format).
 * @returns A formatted string representing the time elapsed.
 */
export const formatTimeAgo = (timestamp: string): string => {
  if (!timestamp) {
    console.error('Invalid timestamp provided: Empty string');
    return 'Invalid date';
  }

  const uploadDate = new Date(timestamp);
  const currentDate = new Date();

  if (!isValid(uploadDate)) {
    console.error('Invalid timestamp provided:', timestamp);
    return 'Invalid date';
  }

  // Calculate the difference in milliseconds
  const diffMs = currentDate.getTime() - uploadDate.getTime();

  // Convert milliseconds to days
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return 'Today';
  } else if (diffDays <= 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffDays <= 28) {
    const weeks = Math.ceil(diffDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffDays <= 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingDays = diffDays % 365;
    const months = Math.floor(remainingDays / 30);
    return months > 0
      ? `${years} year${years > 1 ? 's' : ''} ${months} month${months > 1 ? 's' : ''} ago`
      : `${years} year${years > 1 ? 's' : ''} ago`;
  }
};

/**
 * Formats a number into a human-readable string.
 * - < 10,000: Displays with commas (e.g., 1,000)
 * - 10,000 ≤ number < 1,000,000: Displays in 'k' (e.g., 10k, 10.1k)
 * - ≥ 1,000,000: Displays in 'M' (e.g., 2.2M)
 *
 * @param count - The number to format.
 * @returns A formatted string representing the count.
 */
export const formatCounts = (count: number): string => {
  let result: string;

  if (count < 10000) {
    result = count.toLocaleString();
  } else if (count < 1000000) {
    const k = count / 1000;
    result = k % 1 === 0 ? `${k}k` : `${k.toFixed(1)}k`;
  } else {
    const m = count / 1000000;
    result = m % 1 === 0 ? `${m}M` : `${m.toFixed(1)}M`;
  }

  return result;
};


// Inline test function for formatCounts and formatTimeAgo, do not comment out
(function testHelpers() {
  // Test formatCounts
  const testCounts = [999, 1000, 10000, 10100, 264444, 2243321];
  //console.log('Testing formatCounts:');
  //testCounts.forEach((value) => {
  //  console.log(`Count: ${value}, Formatted: ${formatCounts(value)}`);
  //});
//
  // Test formatTimeAgo
  const today = new Date();
  const testDates = [
    new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
    new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
    new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    new Date(today.getTime() - 645 * 24 * 60 * 60 * 1000).toISOString(), // 645 days ago
    new Date(today.getTime() - 400 * 24 * 60 * 60 * 1000).toISOString(), // 400 days ago
    new Date(today.getTime() - 800 * 24 * 60 * 60 * 1000).toISOString(), // 800 days ago
  ];
 // console.log('\nTesting formatTimeAgo:');
 // testDates.forEach((date) => {
 //   console.log(`Timestamp: ${date}, Formatted: ${formatTimeAgo(date)}`);
 // });
})();
