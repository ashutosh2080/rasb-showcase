// src/sections/executor/ExecutorTimeline.jsx

import React from "react";

import ExecutorItemCard from "./ExecutorItemCard";

function EmptyState({
    title,
    description,
}) {
    return (
        <div className="executor-empty-state">
            <div className="executor-empty-marker">
                —
            </div>

            <strong>{title}</strong>

            <span>{description}</span>
        </div>
    );
}

function TimelineSection({
    label,
    count,
    children,
    className = "",
}) {
    return (
        <section
            className={`executor-timeline-section ${className}`}
        >
            <div className="executor-section-header">
                <div>
                    <span className="executor-section-label">
                        {label}
                    </span>

                    {count !== undefined && (
                        <span className="executor-section-count">
                            {count}
                        </span>
                    )}
                </div>
            </div>

            {children}
        </section>
    );
}

function ExecutorTimeline({
    timeline,
    selectedDate,
    onRefresh,
    onEditItem,
    onDeleteItem,
}) {
    const current =
        timeline?.current || null;

    const next =
        timeline?.next || null;

    const upcoming = Array.isArray(
        timeline?.upcoming
    )
        ? timeline.upcoming
        : [];

    const items = Array.isArray(
        timeline?.items
    )
        ? timeline.items
        : [];

    const cardProps = {
        onRefresh,
        onEdit: onEditItem,
        onDelete: onDeleteItem,
    };

    return (
        <main className="executor-timeline">
            <TimelineSection
                label="Current"
                className="executor-current-section"
            >
                {current ? (
                    <ExecutorItemCard
                        {...cardProps}
                        item={current}
                        variant="current"
                    />
                ) : (
                    <EmptyState
                        title="Nothing is currently running"
                        description="There is no active time window right now."
                    />
                )}
            </TimelineSection>

            <TimelineSection
                label="Next"
                className="executor-next-section"
            >
                {next ? (
                    <ExecutorItemCard
                        {...cardProps}
                        item={next}
                        variant="next"
                    />
                ) : (
                    <EmptyState
                        title="No upcoming item"
                        description="There is nothing scheduled after the current timeline."
                    />
                )}
            </TimelineSection>

            <TimelineSection
                label="Upcoming"
                count={upcoming.length}
                className="executor-upcoming-section"
            >
                {upcoming.length > 0 ? (
                    <div className="executor-upcoming-list">
                        {upcoming.map(
                            (item) => (
                                <ExecutorItemCard
                                    {...cardProps}
                                    key={item.id}
                                    item={item}
                                    variant="upcoming"
                                />
                            )
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title="No more items"
                        description="There are no additional future items scheduled for this day."
                    />
                )}
            </TimelineSection>

            <TimelineSection
                label="Day Timeline"
                count={items.length}
                className="executor-full-day-section"
            >
                {items.length > 0 ? (
                    <div className="executor-full-day-list">
                        {items.map(
                            (item) => (
                                <ExecutorItemCard
                                    {...cardProps}
                                    key={item.id}
                                    item={item}
                                    variant="full"
                                />
                            )
                        )}
                    </div>
                ) : (
                    <EmptyState
                        title="No items scheduled"
                        description={`Nothing is planned for ${selectedDate}.`}
                    />
                )}
            </TimelineSection>
        </main>
    );
}

export default ExecutorTimeline;