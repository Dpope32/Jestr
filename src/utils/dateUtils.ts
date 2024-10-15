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
