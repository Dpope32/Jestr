import {format, formatDistanceToNow, isToday} from 'date-fns';

export const getDaysSinceCreation = (creationDate: string) => {
  const startDate = new Date(creationDate);
  const currentDate = new Date();
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else {
    // FIXME: This is crashing the app
    // "ERROR  RangeError: Invalid time value"
    // return formatDistanceToNow(date, {addSuffix: true});
    return '';
  }
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.abs(now.getTime() - date.getTime());
  const diffMinutes = Math.floor(diff / (1000 * 60));
  const diffHours = Math.floor(diff / (1000 * 60 * 60));
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffMinutes < 60) {
    return `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return `Yesterday`;
  } else {
    return `${diffDays} days ago`;
  }
};
