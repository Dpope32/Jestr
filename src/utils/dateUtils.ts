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
      return formatDistanceToNow(date, {addSuffix: true});
    }
  };

  