import React from "react";

function formatTime(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "—";
    }

    return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
    });
}

function formatType(value) {
    if (!value) return "Other";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function ConflictPanel({
    conflicts = [],
    onSelectItem,
    onClose,
}) {
    if (!conflicts.length) {
        return null;
    }

    return (
        <aside className="executor-conflict-panel">
            <div className="executor-conflict-header">
                <div>
                    <span className="executor-conflict-eyebrow">
                        SCHEDULING
                    </span>

                    <h3>
                        {conflicts.length === 1
                            ? "Scheduling conflict"
                            : `${conflicts.length} scheduling conflicts`}
                    </h3>

                    <p>
                        These items overlap in the
                        current execution plan.
                    </p>
                </div>

                {onClose && (
                    <button
                        type="button"
                        className="executor-conflict-close"
                        onClick={onClose}
                        aria-label="Close conflict panel"
                    >
                        ×
                    </button>
                )}
            </div>

            <div className="executor-conflict-list">
                {conflicts.map((conflict, index) => {
                    const conflictingItem =
                        conflict?.item ||
                        conflict;

                    const analysis =
                        conflict?.analysis ||
                        null;

                    return (
                        <div
                            className="executor-conflict-item"
                            key={
                                conflictingItem?.id ??
                                index
                            }
                        >
                            <div className="executor-conflict-time">
                                <strong>
                                    {formatTime(
                                        conflictingItem?.start_at
                                    )}
                                </strong>

                                <span>
                                    {formatTime(
                                        conflictingItem?.end_at
                                    )}
                                </span>
                            </div>

                            <div className="executor-conflict-content">
                                <strong>
                                    {conflictingItem?.title ||
                                        "Untitled item"}
                                </strong>

                                <div className="executor-conflict-meta">
                                    <span>
                                        {formatType(
                                            conflictingItem?.type
                                        )}
                                    </span>

                                    {conflictingItem?.priority && (
                                        <span>
                                            {
                                                conflictingItem.priority
                                            }
                                        </span>
                                    )}

                                    {conflictingItem?.status && (
                                        <span>
                                            {
                                                conflictingItem.status
                                            }
                                        </span>
                                    )}
                                </div>

                                {analysis && (
                                    <p>
                                        {analysis.message ||
                                            analysis.reason ||
                                            "This item overlaps with another scheduled item."}
                                    </p>
                                )}

                                {onSelectItem &&
                                    conflictingItem?.id && (
                                        <button
                                            type="button"
                                            className="executor-conflict-view-button"
                                            onClick={() =>
                                                onSelectItem(
                                                    conflictingItem
                                                )
                                            }
                                        >
                                            View item
                                        </button>
                                    )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
}

export default ConflictPanel;