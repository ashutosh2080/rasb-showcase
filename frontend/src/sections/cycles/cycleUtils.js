// src/sections/cycles/cycleUtils.js

export const RECURRENCE_TYPES = {
  DAILY: "daily",
  WEEKLY: "weekly",
  MONTHLY: "monthly",
  CUSTOM: "custom",
};

export const PRIORITIES = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  VERY_HIGH: "very_high",
};

export const CYCLE_STATUS = {
  ACTIVE: "active",
  PAUSED: "paused",
};

export const OCCURRENCE_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  MISSED: "missed",
  SNOOZED: "snoozed",
  SKIPPED: "skipped",
};

export const CATEGORIES = [
  "Finance",
  "Subscriptions",
  "Personal",
  "Work",
  "Academic",
  "Health",
  "Maintenance",
  "Social",
  "Other",
];

export const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function formatPriority(priority) {
  return {
    low: "Low",
    medium: "Medium",
    high: "High",
    very_high: "Very High",
  }[priority] || priority;
}

export function getPriorityNotificationDefaults(priority) {
  switch (priority) {
    case PRIORITIES.LOW:
      return [
        {
          value: 0,
          unit: "minutes",
          label: "At event",
        },
      ];

    case PRIORITIES.MEDIUM:
      return [
        {
          value: 1,
          unit: "hours",
          label: "1 hour before",
        },
        {
          value: 0,
          unit: "minutes",
          label: "At event",
        },
      ];

    case PRIORITIES.HIGH:
      return [
        {
          value: 1,
          unit: "days",
          label: "1 day before",
        },
        {
          value: 1,
          unit: "hours",
          label: "1 hour before",
        },
        {
          value: 0,
          unit: "minutes",
          label: "At event",
        },
      ];

    case PRIORITIES.VERY_HIGH:
      return [
        {
          value: 3,
          unit: "days",
          label: "3 days before",
        },
        {
          value: 1,
          unit: "days",
          label: "1 day before",
        },
        {
          value: 1,
          unit: "hours",
          label: "1 hour before",
        },
        {
          value: 0,
          unit: "minutes",
          label: "At event",
        },
      ];

    default:
      return [];
  }
}

export function formatRecurrence(cycle) {
  const rule = cycle.recurrence_rule;

  if (!rule) return "";

  switch (rule.type) {
    case "daily":
      return `Every ${rule.interval || 1} day${
        (rule.interval || 1) > 1 ? "s" : ""
      }`;

    case "weekly":
      return `Every ${rule.interval || 1} week${
        (rule.interval || 1) > 1 ? "s" : ""
      }`;

    case "monthly":
      if (rule.mode === "date") {
        return `Monthly · ${rule.date}`;
      }

      return `Monthly · ${rule.month_pattern} ${rule.day}`;

    case "custom":
      return `Every ${rule.interval} ${rule.unit}`;

    default:
      return "";
  }
}

export function formatTime(time) {
  if (!time) return "";

  const [hours, minutes] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString([], {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatShortDate(date) {
  if (!date) return "";

  return new Date(date).toLocaleDateString([], {
    day: "2-digit",
    month: "short",
  });
}

export function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;

  const a = new Date(date1);
  const b = new Date(date2);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getCalendarDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = getDaysInMonth(year, month);

  // Convert Sunday-first JS index to Monday-first.
  const startOffset = (firstDay.getDay() + 6) % 7;

  const days = [];

  for (let i = 0; i < startOffset; i++) {
    days.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export function getMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString([], {
    month: "long",
    year: "numeric",
  });
}

export function getNextMonth(year, month) {
  if (month === 11) {
    return {
      year: year + 1,
      month: 0,
    };
  }

  return {
    year,
    month: month + 1,
  };
}

export function getPreviousMonth(year, month) {
  if (month === 0) {
    return {
      year: year - 1,
      month: 11,
    };
  }

  return {
    year,
    month: month - 1,
  };
}

export function getDateRange(filter) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(today);
  const end = new Date(today);

  switch (filter) {
    case "today":
      break;

    case "tomorrow":
      start.setDate(start.getDate() + 1);
      end.setDate(end.getDate() + 1);
      break;

    case "week": {
      const day = start.getDay();
      const mondayOffset = day === 0 ? -6 : 1 - day;

      start.setDate(start.getDate() + mondayOffset);
      end.setTime(start.getTime());
      end.setDate(start.getDate() + 6);

      break;
    }

    case "month":
      start.setDate(1);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      break;

    default:
      break;
  }

  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
}

export function getOccurrencesForDate(occurrences, date) {
  return occurrences.filter((occurrence) =>
    isSameDay(occurrence.scheduled_at, date)
  );
}