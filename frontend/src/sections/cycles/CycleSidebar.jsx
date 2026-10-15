// src/sections/cycles/CycleSidebar.jsx

import React, { useMemo, useState } from "react";
import {
  formatPriority,
  formatRecurrence,
  formatShortDate,
} from "./cycleUtils";

function CycleSidebar({
  cycles,
  selectedCycle,
  onSelectCycle,
}) {
  const [collapsed, setCollapsed] = useState({});

  const groupedCycles = useMemo(() => {
    return cycles.reduce((groups, cycle) => {
      const category = cycle.category || "Other";

      if (!groups[category]) {
        groups[category] = [];
      }

      groups[category].push(cycle);

      return groups;
    }, {});
  }, [cycles]);

  function toggleCategory(category) {
    setCollapsed((previous) => ({
      ...previous,
      [category]: !previous[category],
    }));
  }

  return (
    <aside className="cycles-sidebar">
      <div className="cycles-sidebar-header">
        <span>Active cycles</span>

        <span className="cycles-sidebar-count">
          {cycles.length}
        </span>
      </div>

      <div className="cycle-category-list">
        {Object.entries(groupedCycles).map(
          ([category, categoryCycles]) => {
            const isCollapsed = collapsed[category];

            return (
              <div
                key={category}
                className="cycle-category"
              >
                <button
                  type="button"
                  className="cycle-category-header"
                  onClick={() => toggleCategory(category)}
                >
                  <span>{category}</span>

                  <span>
                    {isCollapsed ? "+" : "−"}
                  </span>
                </button>

                {!isCollapsed && (
                  <div className="cycle-category-items">
                    {categoryCycles.map((cycle) => (
                      <button
                        type="button"
                        key={cycle.id}
                        className={[
                          "cycle-sidebar-item",
                          selectedCycle?.id === cycle.id
                            ? "is-active"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() =>
                          onSelectCycle(cycle)
                        }
                      >
                        <div className="cycle-sidebar-item-top">
                          <span className="cycle-sidebar-name">
                            {cycle.name}
                          </span>

                          <span
                            className={`priority-indicator priority-${cycle.priority}`}
                            aria-label={formatPriority(
                              cycle.priority
                            )}
                          />
                        </div>

                        <div className="cycle-sidebar-meta">
                          <span>
                            {formatRecurrence(cycle)}
                          </span>

                          {cycle.next_occurrence && (
                            <span>
                              Next:{" "}
                              {formatShortDate(
                                cycle.next_occurrence
                              )}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </aside>
  );
}

export default CycleSidebar;