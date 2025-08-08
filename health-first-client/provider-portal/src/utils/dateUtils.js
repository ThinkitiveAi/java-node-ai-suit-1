// Date utilities for healthcare platform
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  
  switch (format) {
    case 'MM/DD/YYYY':
      return `${month}/${day}/${year}`;
    case 'YYYY-MM-DD':
      return `${year}-${month}-${day}`;
    case 'DD/MM/YYYY':
      return `${day}/${month}/${year}`;
    case 'MMM DD, YYYY':
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    case 'MMMM DD, YYYY':
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    default:
      return `${month}/${day}/${year}`;
  }
};

export const formatTime = (time, format = '12h') => {
  if (!time) return '';
  
  // Handle different time formats
  let timeObj;
  if (typeof time === 'string') {
    // Handle HH:mm format
    if (time.includes(':')) {
      const [hours, minutes] = time.split(':');
      timeObj = new Date();
      timeObj.setHours(parseInt(hours, 10));
      timeObj.setMinutes(parseInt(minutes, 10));
    } else {
      timeObj = new Date(time);
    }
  } else {
    timeObj = new Date(time);
  }
  
  if (isNaN(timeObj.getTime())) return '';
  
  if (format === '12h') {
    return timeObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } else {
    return timeObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }
};

export const formatDateTime = (dateTime, dateFormat = 'MM/DD/YYYY', timeFormat = '12h') => {
  if (!dateTime) return '';
  
  const dateObj = new Date(dateTime);
  if (isNaN(dateObj.getTime())) return '';
  
  const formattedDate = formatDate(dateObj, dateFormat);
  const formattedTime = formatTime(dateObj, timeFormat);
  
  return `${formattedDate} at ${formattedTime}`;
};

export const isValidDate = (date) => {
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
};

export const isValidTime = (time) => {
  if (!time) return false;
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
};

export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addHours = (date, hours) => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

export const addMinutes = (date, minutes) => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

export const isSameDay = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

export const isToday = (date) => {
  return isSameDay(date, new Date());
};

export const isTomorrow = (date) => {
  const tomorrow = addDays(new Date(), 1);
  return isSameDay(date, tomorrow);
};

export const isPast = (date) => {
  return new Date(date) < new Date();
};

export const isFuture = (date) => {
  return new Date(date) > new Date();
};

export const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  return new Date(d.setDate(diff));
};

export const getWeekEnd = (date) => {
  const weekStart = getWeekStart(date);
  return addDays(weekStart, 6);
};

export const getMonthStart = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), 1);
};

export const getMonthEnd = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
};

export const getDayName = (date) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
};

export const getMonthName = (date) => {
  return new Date(date).toLocaleDateString('en-US', { month: 'long' });
};

// Timezone utilities
export const getTimezone = () => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

export const convertToTimezone = (date, timezone) => {
  return new Date(date).toLocaleString('en-US', { timeZone: timezone });
};

export const getTimezoneOffset = (timezone) => {
  const now = new Date();
  const localTime = now.getTime();
  const localOffset = now.getTimezoneOffset() * 60000;
  const utc = localTime + localOffset;
  
  const targetTime = new Date(utc + (getTimezoneOffsetInMs(timezone)));
  return (targetTime.getTime() - now.getTime()) / (1000 * 60 * 60);
};

const getTimezoneOffsetInMs = (timezone) => {
  const now = new Date();
  const target = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
  return target.getTime() - now.getTime();
};

// Business hours utilities
export const isBusinessHours = (date, businessStart = '09:00', businessEnd = '17:00') => {
  const dateObj = new Date(date);
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();
  const currentTime = hours + (minutes / 60);
  
  const [startHour, startMin] = businessStart.split(':').map(Number);
  const [endHour, endMin] = businessEnd.split(':').map(Number);
  
  const startTime = startHour + (startMin / 60);
  const endTime = endHour + (endMin / 60);
  
  return currentTime >= startTime && currentTime <= endTime;
};

export const isWeekend = (date) => {
  const day = new Date(date).getDay();
  return day === 0 || day === 6; // Sunday or Saturday
};

export const isWorkingDay = (date) => {
  return !isWeekend(date);
};

// Generate time slots
export const generateTimeSlots = (startTime, endTime, duration = 30) => {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentTime = new Date();
  currentTime.setHours(startHour, startMin, 0, 0);
  
  const endTimeObj = new Date();
  endTimeObj.setHours(endHour, endMin, 0, 0);
  
  while (currentTime < endTimeObj) {
    const timeString = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    slots.push(timeString);
    currentTime.setMinutes(currentTime.getMinutes() + duration);
  }
  
  return slots;
};

// Duration utilities
export const calculateDuration = (startTime, endTime) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  
  if (diffMins < 60) {
    return `${diffMins} minutes`;
  }
  
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  if (minutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minutes`;
};

export const getRelativeTimeString = (date) => {
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = targetDate.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    if (isToday(targetDate)) return 'Today';
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else if (diffDays > 1 && diffDays <= 7) {
    return `In ${diffDays} days`;
  } else if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)} days ago`;
  } else {
    return formatDate(targetDate, 'MMM DD, YYYY');
  }
}; 