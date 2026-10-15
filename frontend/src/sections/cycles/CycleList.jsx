// src/sections/cycles/CycleList.jsx

import React from "react";

import {
    formatPriority,
    formatShortDate,
    formatTime,
} from "./cycleUtils";

function CycleList({
    occurrences,
    onComplete,
    onSnooze,
    onSkip,
    onSelect,
}) {
    if (!occurrences.length) {
        return (
            <section className="cycle-occurrence-section">
                <div className="cycle-empty-occurrences">
                    <span>No occurrences found.</span>
                </div>
            </section>
        );
    }

    const grouped = occurrences.reduce((groups, occurrence) => {
        const dateKey = new Date(
            occurrence.scheduled_at
        ).toDateString();

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }

        groups[dateKey].push(occurrence);

        return groups;
    }, {});

    return (
        <section className="cycle-occurrence-section">
            <div className="cycle-occurrence-header">
                <div>
                    <span className="section-eyebrow">
                        Upcoming occurrences
                    </span>

                    <h2>
                        {occurrences.length} occurrence
                        {occurrences.length !== 1 ? "s" : ""}
                    </h2>
                </div>
            </div>

            <div className="cycle-occurrence-list">
                {Object.entries(grouped).map(
                    ([dateKey, dateOccurrences]) => {
                        const date = new Date(dateKey);

                        return (
                            <div
                                className="occurrence-date-group"
                                key={dateKey}
                            >
                                <div className="occurrence-date-heading">
                                    <span>
                                        {date
                                            .toLocaleDateString([], {
                                                weekday: "short",
                                            })
                                            .toUpperCase()}
                                    </span>

                                    <strong>
                                        {formatShortDate(date)}
                                    </strong>
                                </div>

                                {dateOccurrences.map((occurrence) => (
                                    <article
                                        className={`occurrence-row status-${occurrence.status}`}
                                        key={occurrence.id}
                                    >
                                        <button
                                            type="button"
                                            className="occurrence-main"
                                            onClick={() =>
                                                onSelect?.(occurrence)
                                            }
                                        >
                                            <span className="occurrence-time">
                                                {formatTime(
                                                    new Date(
                                                        occurrence.scheduled_at
                                                    )
                                                        .toTimeString()
                                                        .slice(0, 5)
                                                )}
                                            </span>

                                            <span className="occurrence-content">
                                                <strong>
                                                    {occurrence.name || occurrence.cycle_name}
                                                </strong>

                                                <span className="occurrence-meta">
                                                    {occurrence.category} ·{" "}
                                                    {formatPriority(
                                                        occurrence.priority
                                                    )}
                                                </span>

                                                {occurrence.notification_summary && (
                                                    <span className="occurrence-notification">
                                                        {occurrence.notification_summary}
                                                    </span>
                                                )}
                                            </span>
                                        </button>

                                        {occurrence.status === "pending" && (
                                            <div className="occurrence-actions">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onComplete(occurrence)
                                                    }
                                                    title="Complete"
                                                >
                                                    ✓
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onSnooze(occurrence)
                                                    }
                                                    title="Snooze"
                                                >
                                                    Z
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onSkip(occurrence)
                                                    }
                                                    title="Skip"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                ))}
                            </div>
                        );
                    }
                )}
            </div>
        </section>
    );
}

export default CycleList;