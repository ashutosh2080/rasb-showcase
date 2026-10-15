// src/sections/executor/ExecutorItemModal.jsx

import React, { useEffect, useState } from "react";

import ConflictPanel from "./ConflictPanel";
import { executorService } from "./executor.api";

const TYPE_OPTIONS = [
    "task",
    "event",
    "travel",
    "meeting",
    "study",
    "work",
    "exercise",
    "rest",
    "preparation",
    "personal",
    "errand",
    "meal",
    "sleep",
    "flexible",
    "other",
];

const PRIORITY_OPTIONS = [
    "low",
    "medium",
    "high",
    "critical",
];

const STATUS_OPTIONS = [
    "planned",
    "current",
    "in_progress",
    "completed",
    "skipped",
    "postponed",
    "cancelled",
];

const FLEXIBILITY_OPTIONS = [
    "fixed",
    "flexible",
    "movable",
];

const SOURCE_OPTIONS = [
    "executor",
    "cycle",
    "reminder",
    "task",
    "calendar",
    "ai",
];

function formatLabel(value) {
    if (!value) return "";

    return value
        .replace(/_/g, " ")
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase()
        );
}

function getDatePart(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");
    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getTimePart(value) {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const hours = String(
        date.getHours()
    ).padStart(2, "0");

    const minutes = String(
        date.getMinutes()
    ).padStart(2, "0");

    return `${hours}:${minutes}`;
}

function buildTimestamp(date, time) {
    if (!date || !time) {
        return "";
    }

    return new Date(
        `${date}T${time}:00`
    ).toISOString();
}

function getInitialForm(item, selectedDate) {
    if (!item) {
        return {
            title: "",
            description: "",
            date: selectedDate || "",
            startTime: "",
            endTime: "",
            type: "task",
            priority: "medium",
            status: "planned",
            flexibility: "fixed",
            preparationDuration: "",
            notificationLead: "",
            sourceType: "executor",
            sourceId: "",
            notes: "",
        };
    }

    return {
        title: item.title || "",
        description: item.description || "",
        date:
            getDatePart(item.start_at) ||
            selectedDate ||
            "",
        startTime: getTimePart(item.start_at),
        endTime: getTimePart(item.end_at),
        type: item.type || "task",
        priority: item.priority || "medium",
        status: item.status || "planned",
        flexibility:
            item.flexibility || "fixed",
        preparationDuration:
            item.preparation_duration_minutes ??
            item.preparationDuration ??
            "",
        notificationLead:
            item.notification_lead_minutes ??
            item.notificationLead ??
            "",
        sourceType:
            item.source_type ||
            item.sourceType ||
            "executor",
        sourceId:
            item.source_id ||
            item.sourceId ||
            "",
        notes: item.notes || "",
    };
}

function ExecutorItemModal({
    isOpen,
    item = null,
    selectedDate = "",
    dayId = null,
    onClose,
    onSaved,
}) {
    const isEditMode = Boolean(item?.id);

    const [form, setForm] = useState(
        getInitialForm(item, selectedDate)
    );

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [conflicts, setConflicts] =
        useState([]);
    const [fieldErrors, setFieldErrors] =
        useState({});

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        setForm(
            getInitialForm(
                item,
                selectedDate
            )
        );

        setError("");
        setConflicts([]);
        setFieldErrors({});
    }, [
        isOpen,
        item,
        selectedDate,
    ]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handleKeyDown(event) {
            if (event.key === "Escape") {
                onClose?.();
            }
        }

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, [isOpen, onClose]);

    if (!isOpen) {
        return null;
    }

    function updateField(field, value) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));

        setFieldErrors((previous) => ({
            ...previous,
            [field]: "",
        }));

        setError("");
        setConflicts([]);
    }

    function validateForm() {
        const errors = {};

        if (!form.title.trim()) {
            errors.title =
                "Title is required.";
        }

        if (!form.date) {
            errors.date =
                "Date is required.";
        }

        if (!form.startTime) {
            errors.startTime =
                "Start time is required.";
        }

        if (!form.endTime) {
            errors.endTime =
                "End time is required.";
        }

        if (
            form.startTime &&
            form.endTime &&
            form.endTime <= form.startTime
        ) {
            errors.endTime =
                "End time must be after start time.";
        }

        if (
            form.preparationDuration !== "" &&
            Number(form.preparationDuration) < 0
        ) {
            errors.preparationDuration =
                "Preparation duration cannot be negative.";
        }

        if (
            form.notificationLead !== "" &&
            Number(form.notificationLead) < 0
        ) {
            errors.notificationLead =
                "Notification lead cannot be negative.";
        }

        setFieldErrors(errors);

        return Object.keys(errors).length === 0;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (saving) {
            return;
        }

        setError("");

        if (!validateForm()) {
            return;
        }

        const startAt = buildTimestamp(
            form.date,
            form.startTime
        );

        const endAt = buildTimestamp(
            form.date,
            form.endTime
        );

        const payload = {
            title: form.title.trim(),
            description:
                form.description.trim(),

            startAt,
            endAt,

            type: form.type,
            priority: form.priority,
            status: form.status,
            flexibility: form.flexibility,

            sourceType: form.sourceType,
            sourceId:
                form.sourceId.trim() || null,

            notes:
                form.notes.trim() || null,

            preparationDurationMinutes:
                form.preparationDuration === ""
                    ? null
                    : Number(
                          form.preparationDuration
                      ),

            notificationLeadMinutes:
                form.notificationLead === ""
                    ? null
                    : Number(
                          form.notificationLead
                      ),
        };

        /*
         * The backend currently resolves the day
         * using planDate during item creation.
         * Keep both values here for compatibility.
         */
        if (!isEditMode) {
            payload.dayId = dayId;
            payload.planDate = form.date;
        }

        try {
            setSaving(true);

            let response;

            if (isEditMode) {
                response =
                    await executorService.updateItem(
                        item.id,
                        payload
                    );
            } else {
                response =
                    await executorService.createItem(
                        payload
                    );
            }

            const responseConflicts =
                Array.isArray(response?.conflicts)
                    ? response.conflicts
                    : [];

            if (responseConflicts.length > 0) {
                setConflicts(responseConflicts);
                setError(
                    "Saved, but this item overlaps with existing scheduled time."
                );

                if (onSaved) {
                    await onSaved(response, {
                        keepOpen: true,
                    });
                }

                return;
            }

            if (onSaved) {
                await onSaved(response);
            }

            onClose?.();
        } catch (err) {
            console.error(
                "Unable to save Executor item:",
                err
            );

            setError(
                err.message ||
                    "Unable to save Executor item."
            );
        } finally {
            setSaving(false);
        }
    }

    function handleBackdropClick(event) {
        if (
            event.target === event.currentTarget &&
            !saving
        ) {
            onClose?.();
        }
    }

    return (
        <div
            className="executor-modal-backdrop"
            onMouseDown={handleBackdropClick}
            role="presentation"
        >
            <div
                className="executor-item-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="executor-item-modal-title"
            >
                <div className="executor-modal-header">
                    <div>
                        <span className="executor-modal-eyebrow">
                            RASB · EXECUTOR
                        </span>

                        <h2 id="executor-item-modal-title">
                            {isEditMode
                                ? "Edit item"
                                : "Create item"}
                        </h2>

                        <p>
                            Define exactly what
                            should happen and when.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="executor-modal-close"
                        onClick={onClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {error && (
                    <div className="executor-modal-error">
                        {error}
                    </div>
                )}

                <ConflictPanel
                    conflicts={conflicts}
                />

                <form
                    className="executor-item-form"
                    onSubmit={handleSubmit}
                >
                    <div className="executor-form-section">
                        <div className="executor-form-section-title">
                            Basic information
                        </div>

                        <div className="executor-form-field">
                            <label htmlFor="executor-title">
                                Title
                            </label>

                            <input
                                id="executor-title"
                                type="text"
                                value={form.title}
                                onChange={(event) =>
                                    updateField(
                                        "title",
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="e.g. Study mathematics"
                                disabled={saving}
                                autoFocus
                            />

                            {fieldErrors.title && (
                                <span className="executor-field-error">
                                    {
                                        fieldErrors.title
                                    }
                                </span>
                            )}
                        </div>

                        <div className="executor-form-field">
                            <label htmlFor="executor-description">
                                Description
                            </label>

                            <textarea
                                id="executor-description"
                                value={
                                    form.description
                                }
                                onChange={(event) =>
                                    updateField(
                                        "description",
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Add useful context..."
                                rows={3}
                                disabled={saving}
                            />
                        </div>

                        <div className="executor-form-grid">
                            <div className="executor-form-field">
                                <label htmlFor="executor-type">
                                    Type
                                </label>

                                <select
                                    id="executor-type"
                                    value={form.type}
                                    onChange={(event) =>
                                        updateField(
                                            "type",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                >
                                    {TYPE_OPTIONS.map(
                                        (type) => (
                                            <option
                                                key={type}
                                                value={type}
                                            >
                                                {formatLabel(
                                                    type
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="executor-form-field">
                                <label htmlFor="executor-priority">
                                    Priority
                                </label>

                                <select
                                    id="executor-priority"
                                    value={
                                        form.priority
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "priority",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                >
                                    {PRIORITY_OPTIONS.map(
                                        (priority) => (
                                            <option
                                                key={
                                                    priority
                                                }
                                                value={
                                                    priority
                                                }
                                            >
                                                {formatLabel(
                                                    priority
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="executor-form-section">
                        <div className="executor-form-section-title">
                            Schedule
                        </div>

                        <div className="executor-form-grid">
                            <div className="executor-form-field">
                                <label htmlFor="executor-date">
                                    Date
                                </label>

                                <input
                                    id="executor-date"
                                    type="date"
                                    value={form.date}
                                    onChange={(event) =>
                                        updateField(
                                            "date",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                />

                                {fieldErrors.date && (
                                    <span className="executor-field-error">
                                        {
                                            fieldErrors.date
                                        }
                                    </span>
                                )}
                            </div>

                            <div className="executor-form-field">
                                <label htmlFor="executor-flexibility">
                                    Flexibility
                                </label>

                                <select
                                    id="executor-flexibility"
                                    value={
                                        form.flexibility
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "flexibility",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                >
                                    {FLEXIBILITY_OPTIONS.map(
                                        (value) => (
                                            <option
                                                key={value}
                                                value={value}
                                            >
                                                {formatLabel(
                                                    value
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>

                        <div className="executor-form-grid">
                            <div className="executor-form-field">
                                <label htmlFor="executor-start-time">
                                    Start time
                                </label>

                                <input
                                    id="executor-start-time"
                                    type="time"
                                    value={
                                        form.startTime
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "startTime",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                />

                                {fieldErrors.startTime && (
                                    <span className="executor-field-error">
                                        {
                                            fieldErrors.startTime
                                        }
                                    </span>
                                )}
                            </div>

                            <div className="executor-form-field">
                                <label htmlFor="executor-end-time">
                                    End time
                                </label>

                                <input
                                    id="executor-end-time"
                                    type="time"
                                    value={
                                        form.endTime
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "endTime",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                />

                                {fieldErrors.endTime && (
                                    <span className="executor-field-error">
                                        {
                                            fieldErrors.endTime
                                        }
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="executor-form-section">
                        <div className="executor-form-section-title">
                            Execution
                        </div>

                        <div className="executor-form-grid">
                            <div className="executor-form-field">
                                <label htmlFor="executor-status">
                                    Status
                                </label>

                                <select
                                    id="executor-status"
                                    value={form.status}
                                    onChange={(event) =>
                                        updateField(
                                            "status",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={saving}
                                >
                                    {STATUS_OPTIONS.map(
                                        (status) => (
                                            <option
                                                key={status}
                                                value={status}
                                            >
                                                {formatLabel(
                                                    status
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="executor-form-field">
                                <label htmlFor="executor-preparation">
                                    Preparation
                                </label>

                                <input
                                    id="executor-preparation"
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={
                                        form.preparationDuration
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "preparationDuration",
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Minutes"
                                    disabled={saving}
                                />

                                {fieldErrors.preparationDuration && (
                                    <span className="executor-field-error">
                                        {
                                            fieldErrors.preparationDuration
                                        }
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="executor-form-field">
                            <label htmlFor="executor-notification-lead">
                                Notification lead time
                            </label>

                            <input
                                id="executor-notification-lead"
                                type="number"
                                min="0"
                                step="1"
                                value={
                                    form.notificationLead
                                }
                                onChange={(event) =>
                                    updateField(
                                        "notificationLead",
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Minutes before start"
                                disabled={saving}
                            />

                            {fieldErrors.notificationLead && (
                                <span className="executor-field-error">
                                    {
                                        fieldErrors.notificationLead
                                    }
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="executor-form-section">
                        <div className="executor-form-section-title">
                            Source
                        </div>

                        <div className="executor-form-grid">
                            <div className="executor-form-field">
                                <label htmlFor="executor-source-type">
                                    Source type
                                </label>

                                <select
                                    id="executor-source-type"
                                    value={
                                        form.sourceType
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "sourceType",
                                            event.target
                                                .value
                                        )
                                    }
                                    disabled={
                                        saving ||
                                        isEditMode
                                    }
                                >
                                    {SOURCE_OPTIONS.map(
                                        (source) => (
                                            <option
                                                key={
                                                    source
                                                }
                                                value={
                                                    source
                                                }
                                            >
                                                {formatLabel(
                                                    source
                                                )}
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>

                            <div className="executor-form-field">
                                <label htmlFor="executor-source-id">
                                    Source ID
                                </label>

                                <input
                                    id="executor-source-id"
                                    type="text"
                                    value={
                                        form.sourceId
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "sourceId",
                                            event.target
                                                .value
                                        )
                                    }
                                    placeholder="Optional"
                                    disabled={
                                        saving ||
                                        isEditMode
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="executor-form-section">
                        <div className="executor-form-section-title">
                            Notes
                        </div>

                        <div className="executor-form-field">
                            <label htmlFor="executor-notes">
                                Notes
                            </label>

                            <textarea
                                id="executor-notes"
                                value={form.notes}
                                onChange={(event) =>
                                    updateField(
                                        "notes",
                                        event.target
                                            .value
                                    )
                                }
                                placeholder="Anything Executor should remember..."
                                rows={3}
                                disabled={saving}
                            />
                        </div>
                    </div>

                    <div className="executor-modal-footer">
                        <button
                            type="button"
                            className="executor-secondary-button"
                            onClick={onClose}
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="executor-primary-button"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : isEditMode
                                ? "Save Changes"
                                : "Create Item"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ExecutorItemModal;
