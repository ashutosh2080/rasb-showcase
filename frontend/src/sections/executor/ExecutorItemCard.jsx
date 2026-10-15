// src/sections/executor/ExecutorItemCard.jsx

import React, { useMemo, useState } from "react";

import { executorService } from "./executor.api";

function formatTime(dateString) {
    if (!dateString) return "—";

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatDuration(minutes) {
    if (minutes === null || minutes === undefined) {
        return "—";
    }

    const value = Number(minutes);

    if (Number.isNaN(value)) {
        return "—";
    }

    if (value < 60) {
        return `${value} min`;
    }

    const hours = Math.floor(value / 60);
    const remaining = value % 60;

    if (remaining === 0) {
        return `${hours} hr`;
    }

    return `${hours} hr ${remaining} min`;
}

function formatLabel(value) {
    if (!value) return "—";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function getSourceLabel(item) {
    return formatLabel(
        item?.source_type || "executor"
    );
}

function getCardClassName(item, variant) {
    const classes = [
        "executor-item-card",
        `executor-item-card-${variant}`,
    ];

    if (item?.status) {
        classes.push(
            `executor-item-status-${item.status}`
        );
    }

    if (item?.priority) {
        classes.push(
            `executor-item-priority-${item.priority}`
        );
    }

    return classes.join(" ");
}

function getAvailableActions(status) {
    switch (status) {
        case "planned":
            return [
                {
                    value: "in_progress",
                    label: "Start",
                },
                {
                    value: "completed",
                    label: "Complete",
                },
                {
                    value: "skipped",
                    label: "Skip",
                },
                {
                    value: "postponed",
                    label: "Postpone",
                },
                {
                    value: "cancelled",
                    label: "Cancel",
                },
            ];

        case "current":
            return [
                {
                    value: "in_progress",
                    label: "Start",
                },
                {
                    value: "completed",
                    label: "Complete",
                },
                {
                    value: "skipped",
                    label: "Skip",
                },
                {
                    value: "postponed",
                    label: "Postpone",
                },
            ];

        case "in_progress":
            return [
                {
                    value: "completed",
                    label: "Complete",
                },
                {
                    value: "skipped",
                    label: "Skip",
                },
                {
                    value: "postponed",
                    label: "Postpone",
                },
            ];

        case "postponed":
            return [
                {
                    value: "in_progress",
                    label: "Resume",
                },
                {
                    value: "completed",
                    label: "Complete",
                },
                {
                    value: "cancelled",
                    label: "Cancel",
                },
            ];

        default:
            return [];
    }
}

function ExecutorItemCard({
    item,
    variant = "full",
    onRefresh,
    onEdit,
    onDelete,
}) {
    const [updating, setUpdating] =
        useState(false);

    const [error, setError] = useState("");
    const [expanded, setExpanded] =
        useState(false);

    const actions = useMemo(
        () =>
            getAvailableActions(
                item?.status
            ),
        [item?.status]
    );

    const duration =
        item?.duration_minutes ??
        item?.durationMinutes ??
        null;

    const hasConflict =
        item?.has_conflict ||
        item?.hasConflict ||
        item?.conflict === true;

    const terminalStatuses = [
        "completed",
        "cancelled",
        "skipped",
    ];

    const isTerminal = terminalStatuses.includes(
        item?.status
    );

    async function handleStatusChange(
        newStatus
    ) {
        if (!item?.id || updating) {
            return;
        }

        try {
            setUpdating(true);
            setError("");

            await executorService.updateItem(
                item.id,
                {
                    status: newStatus,
                }
            );

            await onRefresh?.();
        } catch (err) {
            console.error(
                "Unable to update Executor item:",
                err
            );

            setError(
                err.message ||
                    "Unable to update item."
            );
        } finally {
            setUpdating(false);
        }
    }

    async function handleDelete() {
        if (!item?.id || updating) {
            return;
        }

        const confirmed = window.confirm(
            `Delete "${item.title}"? This cannot be undone.`
        );

        if (!confirmed) {
            return;
        }

        try {
            setUpdating(true);
            setError("");

            await executorService.deleteItem(
                item.id
            );

            await onRefresh?.();
        } catch (err) {
            console.error(
                "Unable to delete Executor item:",
                err
            );

            setError(
                err.message ||
                    "Unable to delete item."
            );
        } finally {
            setUpdating(false);
        }
    }

    return (
        <article
            className={getCardClassName(
                item,
                variant
            )}
        >
            <div className="executor-item-main">
                <div className="executor-item-time">
                    <strong>
                        {formatTime(
                            item?.start_at
                        )}
                    </strong>

                    <span>
                        {formatTime(
                            item?.end_at
                        )}
                    </span>
                </div>

                <div className="executor-item-content">
                    <div className="executor-item-topline">
                        <div className="executor-item-title-row">
                            <h3>
                                {item?.title ||
                                    "Untitled item"}
                            </h3>

                            {hasConflict && (
                                <span className="executor-item-conflict-badge">
                                    Conflict
                                </span>
                            )}
                        </div>

                        <span className="executor-item-duration">
                            {formatDuration(
                                duration
                            )}
                        </span>
                    </div>

                    {item?.description && (
                        <p className="executor-item-description">
                            {item.description}
                        </p>
                    )}

                    <div className="executor-item-meta">
                        <span className="executor-item-type">
                            {formatLabel(
                                item?.type
                            )}
                        </span>

                        <span
                            className={`executor-item-priority executor-item-priority-${item?.priority || "medium"}`}
                        >
                            {formatLabel(
                                item?.priority ||
                                    "medium"
                            )}
                        </span>

                        <span className="executor-item-source">
                            {getSourceLabel(item)}
                        </span>

                        <span className="executor-item-status">
                            {formatLabel(
                                item?.status
                            )}
                        </span>
                    </div>
                </div>
            </div>

            <div className="executor-item-footer">
                <div className="executor-item-footer-left">
                    {item?.flexibility && (
                        <span>
                            {formatLabel(
                                item.flexibility
                            )}
                        </span>
                    )}

                    {item?.notification_lead_minutes !=
                        null && (
                        <span>
                            Notify{" "}
                            {
                                item.notification_lead_minutes
                            }
                            m before
                        </span>
                    )}
                </div>

                <div className="executor-item-actions">
                    {!isTerminal &&
                        actions
                            .slice(0, 2)
                            .map((action) => (
                                <button
                                    key={
                                        action.value
                                    }
                                    type="button"
                                    className="executor-item-action-button"
                                    onClick={() =>
                                        handleStatusChange(
                                            action.value
                                        )
                                    }
                                    disabled={
                                        updating
                                    }
                                >
                                    {action.label}
                                </button>
                            ))}

                    {!isTerminal &&
                        actions.length > 2 && (
                            <button
                                type="button"
                                className="executor-item-more-button"
                                onClick={() =>
                                    setExpanded(
                                        (value) =>
                                            !value
                                    )
                                }
                                disabled={
                                    updating
                                }
                            >
                                {expanded
                                    ? "Less"
                                    : "More"}
                            </button>
                        )}

                    {onEdit && (
                        <button
                            type="button"
                            className="executor-item-edit-button"
                            onClick={() =>
                                onEdit(item)
                            }
                            disabled={updating}
                        >
                            Edit
                        </button>
                    )}

                    {onDelete && (
                        <button
                            type="button"
                            className="executor-item-delete-button"
                            onClick={handleDelete}
                            disabled={updating}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </div>

            {expanded &&
                actions.length > 2 && (
                    <div className="executor-item-expanded-actions">
                        {actions
                            .slice(2)
                            .map((action) => (
                                <button
                                    key={
                                        action.value
                                    }
                                    type="button"
                                    className="executor-item-action-button"
                                    onClick={() =>
                                        handleStatusChange(
                                            action.value
                                        )
                                    }
                                    disabled={
                                        updating
                                    }
                                >
                                    {action.label}
                                </button>
                            ))}
                    </div>
                )}

            {error && (
                <div className="executor-item-error">
                    {error}
                </div>
            )}
        </article>
    );
}

export default ExecutorItemCard;