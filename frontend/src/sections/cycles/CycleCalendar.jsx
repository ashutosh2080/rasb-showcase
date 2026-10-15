// src/sections/cycles/CycleCalendar.jsx

import React from "react";

import {
  getCalendarDays,
  getMonthLabel,
  getNextMonth,
  getPreviousMonth,
  getOccurrencesForDate,
  isSameDay,
} from "./cycleUtils";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function CycleCalendar({
  year,
  month,
  selectedDate,
  occurrences,
  onDateSelect,
  onPreviousMonth,
  onNextMonth,
  onToday,
}) {
  const days = getCalendarDays(year, month);

  const today = new Date();

  return (
    <section className="cycles-calendar-panel">
      <div className="calendar-header">
        <div className="calendar-navigation">
          <button
            type="button"
            className="calendar-nav-button"
            onClick={onPreviousMonth}
            aria-label="Previous month"
          >
            ‹
          </button>

          <h2>{getMonthLabel(year, month)}</h2>

          <button
            type="button"
            className="calendar-nav-button"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>

        <button
          type="button"
          className="calendar-today-button"
          onClick={onToday}
        >
          Today
        </button>
      </div>

      <div className="calendar-weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-grid">
        {days.map((date, index) => {
          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="calendar-cell calendar-cell-empty"
              />
            );
          }

          const dayOccurrences = getOccurrencesForDate(
            occurrences,
            date
          );

          const selected = isSameDay(date, selectedDate);
          const current = isSameDay(date, today);

          return (
            <button
              type="button"
              key={date.toISOString()}
              className={[
                "calendar-cell",
                selected ? "is-selected" : "",
                current ? "is-today" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => onDateSelect(date)}
            >
              <span className="calendar-date-number">
                {date.getDate()}
              </span>

              {dayOccurrences.length > 0 && (
                <span className="calendar-occurrence-markers">
                  {dayOccurrences.slice(0, 4).map((occurrence) => (
                    <span
                      key={occurrence.id}
                      className={[
                        "calendar-occurrence-dot",
                        `priority-${occurrence.priority || "medium"}`,
                        `status-${occurrence.status || "pending"}`,
                      ].join(" ")}
                    />
                  ))}

                  {dayOccurrences.length > 4 && (
                    <span className="calendar-more-count">
                      +{dayOccurrences.length - 4}
                    </span>
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default CycleCalendar;