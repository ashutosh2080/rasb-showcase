// src/sections/cycles/CycleFilters.jsx

import React from "react";

const DATE_FILTERS = [
  ["today", "Today"],
  ["tomorrow", "Tomorrow"],
  ["week", "This Week"],
  ["month", "This Month"],
  ["custom", "Custom"],
];

const PRIORITY_FILTERS = [
  ["all", "All"],
  ["very_high", "Very High"],
  ["high", "High"],
  ["medium", "Medium"],
  ["low", "Low"],
];

function CycleFilters({
  dateFilter,
  setDateFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  categories,
  customStart,
  customEnd,
  setCustomStart,
  setCustomEnd,
}) {
  return (
    <div className="cycles-filters">
      <div className="cycle-filter-row">
        <div className="cycle-filter-group cycle-date-filters">
          {DATE_FILTERS.map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={
                dateFilter === value ? "is-active" : ""
              }
              onClick={() => setDateFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="cycle-filter-group">
          <select
            value={priorityFilter}
            onChange={(event) =>
              setPriorityFilter(event.target.value)
            }
            aria-label="Priority filter"
          >
            {PRIORITY_FILTERS.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <select
            value={categoryFilter}
            onChange={(event) =>
              setCategoryFilter(event.target.value)
            }
            aria-label="Category filter"
          >
            <option value="all">All categories</option>

            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {dateFilter === "custom" && (
        <div className="custom-date-range">
          <label>
            From
            <input
              type="date"
              value={customStart}
              onChange={(event) =>
                setCustomStart(event.target.value)
              }
            />
          </label>

          <label>
            To
            <input
              type="date"
              value={customEnd}
              onChange={(event) =>
                setCustomEnd(event.target.value)
              }
            />
          </label>
        </div>
      )}
    </div>
  );
}

export default CycleFilters;