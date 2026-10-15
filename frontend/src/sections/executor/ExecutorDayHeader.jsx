// src/sections/executor/ExecutorDayHeader.jsx

import React, { useState } from "react";

import { executorService } from "./executor.api";

function formatDate(dateString) {
    const date = new Date(
        `${dateString}T12:00:00`
    );

    return date.toLocaleDateString([], {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function formatShortDate(dateString) {
    const date = new Date(
        `${dateString}T12:00:00`
    );

    return date.toLocaleDateString([], {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

function ExecutorDayHeader({
    selectedDate,
    day,
    onPreviousDay,
    onNextDay,
    onToday,
    onRefresh,
    onCreateItem,
    refreshing,
    timezone,
}) {
    const [materializing, setMaterializing] =
        useState(false);

    const [materializeMessage, setMaterializeMessage] =
        useState("");

    const [statusUpdating, setStatusUpdating] =
        useState(false);

    const [localError, setLocalError] =
        useState("");

    async function handleMaterialize() {
        try {
            setMaterializing(true);
            setMaterializeMessage("");
            setLocalError("");

            await executorService.materializeDay(
                selectedDate
            );

            setMaterializeMessage(
                "Day materialized successfully."
            );

            await onRefresh?.();
        } catch (err) {
            console.error(
                "Unable to materialize Executor day:",
                err
            );

            setLocalError(
                err.message ||
                    "Unable to materialize day."
            );
        } finally {
            setMaterializing(false);
        }
    }

    async function handleStatusChange(
        event
    ) {
        const newStatus =
            event.target.value;

        if (!day?.id) return;

        try {
            setStatusUpdating(true);
            setLocalError("");

            await executorService.updateDayStatus(
                day.id,
                newStatus
            );

            await onRefresh?.();
        } catch (err) {
            console.error(
                "Unable to update Executor day status:",
                err
            );

            setLocalError(
                err.message ||
                    "Unable to update day status."
            );
        } finally {
            setStatusUpdating(false);
        }
    }

    const itemCount =
        day?.item_count ??
        day?.items_count ??
        null;

    return (
        <header className="executor-day-header">
            <div className="executor-day-heading">
                <div className="executor-eyebrow">
                    RASB · EXECUTOR
                </div>

                <h1>Executor</h1>

                <p>
                    Execute your day with a
                    time-aware plan.
                </p>
            </div>

            <div className="executor-day-controls">
                <div className="executor-date-navigation">
                    <button
                        type="button"
                        className="executor-icon-button"
                        onClick={onPreviousDay}
                        aria-label="Previous day"
                        title="Previous day"
                    >
                        ←
                    </button>

                    <button
                        type="button"
                        className="executor-date-button"
                        onClick={onToday}
                        title="Go to today"
                    >
                        <span>
                            {formatShortDate(
                                selectedDate
                            )}
                        </span>

                        <strong>
                            {formatDate(
                                selectedDate
                            )}
                        </strong>
                    </button>

                    <button
                        type="button"
                        className="executor-icon-button"
                        onClick={onNextDay}
                        aria-label="Next day"
                        title="Next day"
                    >
                        →
                    </button>
                </div>

                <div className="executor-header-actions">
                    <button
                        type="button"
                        className="executor-secondary-button"
                        onClick={onToday}
                    >
                        Today
                    </button>

                    <button
                        type="button"
                        className="executor-secondary-button"
                        onClick={onRefresh}
                        disabled={refreshing}
                    >
                        {refreshing
                            ? "Refreshing..."
                            : "Refresh"}
                    </button>

                    <button
                        type="button"
                        className="executor-secondary-button"
                        onClick={
                            onCreateItem
                        }
                    >
                        + New Item
                    </button>

                    <button
                        type="button"
                        className="executor-primary-button"
                        onClick={
                            handleMaterialize
                        }
                        disabled={
                            materializing
                        }
                    >
                        {materializing
                            ? "Materializing..."
                            : "Materialize Day"}
                    </button>
                </div>
            </div>

            <div className="executor-day-meta">
                <div className="executor-day-meta-item">
                    <span>DATE</span>

                    <strong>
                        {formatShortDate(
                            selectedDate
                        )}
                    </strong>
                </div>

                <div className="executor-day-meta-item">
                    <span>TIMEZONE</span>

                    <strong>
                        {day?.timezone ||
                            timezone}
                    </strong>
                </div>

                <div className="executor-day-meta-item">
                    <span>DAY STATUS</span>

                    <select
                        value={
                            day?.status ||
                            "planned"
                        }
                        onChange={
                            handleStatusChange
                        }
                        disabled={
                            !day?.id ||
                            statusUpdating
                        }
                        aria-label="Day status"
                    >
                        <option value="planned">
                            Planned
                        </option>

                        <option value="active">
                            Active
                        </option>

                        <option value="completed">
                            Completed
                        </option>

                        <option value="archived">
                            Archived
                        </option>
                    </select>
                </div>

                {itemCount !== null && (
                    <div className="executor-day-meta-item">
                        <span>ITEMS</span>

                        <strong>
                            {itemCount}
                        </strong>
                    </div>
                )}
            </div>

            {(materializeMessage ||
                localError) && (
                <div
                    className={
                        localError
                            ? "executor-inline-error"
                            : "executor-inline-success"
                    }
                >
                    {localError ||
                        materializeMessage}
                </div>
            )}
        </header>
    );
}

export default ExecutorDayHeader;