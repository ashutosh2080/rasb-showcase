// src/sections/cycles/CycleForm.jsx

import React, { useEffect, useState } from "react";

import {
    CATEGORIES,
    PRIORITIES,
    RECURRENCE_TYPES,
    WEEK_DAYS,
    getPriorityNotificationDefaults,
} from "./cycleUtils";

function getLocalDateString(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function normalizeWeekdayLabels(days) {
    if (!Array.isArray(days)) return [];

    return days
        .map((day) => {
            if (typeof day === "number" && Number.isInteger(day)) {
                return WEEK_DAYS[day - 1] || null;
            }

            const match = WEEK_DAYS.find(
                (weekday) => weekday.toLowerCase() === String(day).toLowerCase()
            );
            return match || null;
        })
        .filter(Boolean);
}

const DEFAULT_FORM = {
    name: "",
    description: "",
    category: "Personal",
    priority: "medium",
    start_date: getLocalDateString(),
    end_date: "",
    end_after_occurrences: "",
    end_condition: "never",
    timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        "Asia/Kolkata",
    status: "active",
    recurrence_type: "daily",

    recurrence_rule: {
        type: "daily",
        interval: 1,
        time: "09:00",
        days: [],
        date: 1,
        mode: "date",

        monthPattern: "first",
        month_pattern: "first",

        day: "Monday",
        unit: "days",
        exception_days: [],
        exception_dates: [],
        exception_weeks: [],
    },
    messaging_enabled: false,
    notification_channels: ["in_app"],
    recipients: ["me"],

    notifications: [],

    message_type: "default",
    custom_message: "",

    completion_tracking_enabled: true,
};

function CycleForm({
    cycle,
    onClose,
    onSubmit,
}) {
    const [form, setForm] = useState(
        cycle || DEFAULT_FORM
    );

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!cycle) {
            setForm({
                ...DEFAULT_FORM,
                start_date: getLocalDateString(),
            });
            return;
        }

        const rule =
            cycle.recurrence_rule ||
            cycle.recurrenceRule ||
            {};

        setForm({
            ...DEFAULT_FORM,
            ...cycle,

            // API/database may return either snake_case or camelCase.
            // Always give <input type="date"> exactly YYYY-MM-DD.
            start_date: normalizeDateForForm(
                cycle.start_date ??
                cycle.startDate
            ),

            end_date: normalizeDateForForm(
                cycle.end_date ??
                cycle.endDate
            ),

            end_condition:
                cycle.end_condition ||
                (cycle.end_date
                    ? "date"
                    : cycle.end_after_occurrences
                      ? "occurrences"
                      : "never"),

            end_after_occurrences:
                cycle.end_after_occurrences ??
                cycle.endAfterOccurrences ??
                "",

            recurrence_type:
                cycle.recurrence_type ??
                cycle.recurrenceType ??
                DEFAULT_FORM.recurrence_type,

            recurrence_rule: {
                ...DEFAULT_FORM.recurrence_rule,
                ...rule,

                // The API normalizes weekday names to ISO weekday numbers (Mon=1…Sun=7).
                // Convert them back to the labels used by the checkbox controls.
                days: normalizeWeekdayLabels(rule.days),

                // The backend expects monthPattern.
                monthPattern:
                    rule.monthPattern ||
                    rule.month_pattern ||
                    "first",

                // Keep the legacy UI field synchronized.
                month_pattern:
                    rule.month_pattern ||
                    rule.monthPattern ||
                    "first",

                exceptions: {
                    ...(rule.exceptions || {}),
                },

                exception_days:
                    rule.exception_days ||
                    rule.exceptions?.days ||
                    [],

                exception_dates:
                    rule.exception_dates ||
                    rule.exceptions?.dates ||
                    [],

                exception_weeks:
                    rule.exception_weeks ||
                    rule.exceptions?.weeks ||
                    [],
            },

            notifications:
                Array.isArray(cycle.notifications)
                    ? cycle.notifications
                    : [],

            notification_channels:
                cycle.notification_channels ||
                cycle.notificationPolicy?.mediums ||
                DEFAULT_FORM.notification_channels,

            recipients:
                cycle.recipients ||
                cycle.notificationPolicy?.recipients ||
                DEFAULT_FORM.recipients,

            messaging_enabled:
                cycle.messaging_enabled ??
                cycle.messagingEnabled ??
                false,

            completion_tracking_enabled:
                cycle.completion_tracking_enabled ??
                cycle.completionTrackingEnabled ??
                true,
        });
    }, [cycle]);

    function updateField(field, value) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function updateRule(field, value) {
        setForm((previous) => ({
            ...previous,
            recurrence_rule: {
                ...previous.recurrence_rule,
                [field]: value,
            },
        }));
    }

    function handlePriorityChange(value) {
        updateField("priority", value);

        if (!cycle) {
            setForm((previous) => ({
                ...previous,
                priority: value,
                notifications:
                    getPriorityNotificationDefaults(value),
            }));
        }
    }

    function toggleArrayValue(field, value) {
        const current =
            form.recurrence_rule[field] || [];

        const next = current.includes(value)
            ? current.filter((item) => item !== value)
            : [...current, value];

        updateRule(field, next);
    }

    function toggleChannel(channel) {
        const current = form.notification_channels || [];

        updateField(
            "notification_channels",
            current.includes(channel)
                ? current.filter((item) => item !== channel)
                : [...current, channel]
        );
    }

    function addExceptionDate() {
        const value = window.prompt(
            "Enter exception date (YYYY-MM-DD)"
        );

        if (!value) return;

        updateRule("exception_dates", [
            ...(form.recurrence_rule.exception_dates || []),
            value,
        ]);
    }

    function addExceptionWeek() {
        const value = window.prompt(
            "Enter week start date (YYYY-MM-DD)"
        );

        if (!value) return;

        updateRule("exception_weeks", [
            ...(form.recurrence_rule.exception_weeks || []),
            value,
        ]);
    }

    function addNotification() {
        updateField("notifications", [
            ...(form.notifications || []),
            {
                value: 1,
                unit: "days",
                label: "1 day before",
            },
        ]);
    }

    function updateNotification(index, field, value) {
        const notifications = [
            ...(form.notifications || []),
        ];

        notifications[index] = {
            ...notifications[index],
            [field]: value,
        };

        if (
            field === "value" ||
            field === "unit"
        ) {
            const unitLabel =
                value === 0
                    ? "At event"
                    : `${notifications[index].value} ${notifications[index].unit} before`;

            notifications[index].label = unitLabel;
        }

        updateField("notifications", notifications);
    }

    function removeNotification(index) {
        updateField(
            "notifications",
            form.notifications.filter(
                (_, itemIndex) => itemIndex !== index
            )
        );
    }

    function normalizeDateForForm(value) {
        if (!value) return "";

        if (value instanceof Date) {
            if (Number.isNaN(value.getTime())) return "";

            const year = value.getFullYear();
            const month = String(
                value.getMonth() + 1
            ).padStart(2, "0");
            const day = String(
                value.getDate()
            ).padStart(2, "0");

            return `${year}-${month}-${day}`;
        }

        const stringValue = String(value).trim();

        // YYYY-MM-DD or an ISO timestamp beginning with YYYY-MM-DD.
        const isoMatch = stringValue.match(
            /^(\d{4}-\d{2}-\d{2})/
        );

        if (isoMatch) {
            return isoMatch[1];
        }

        // DD-MM-YYYY
        const dashMatch = stringValue.match(
            /^(\d{2})-(\d{2})-(\d{4})$/
        );

        if (dashMatch) {
            return `${dashMatch[3]}-${dashMatch[2]}-${dashMatch[1]}`;
        }

        // DD/MM/YYYY
        const slashMatch = stringValue.match(
            /^(\d{2})\/(\d{2})\/(\d{4})$/
        );

        if (slashMatch) {
            return `${slashMatch[3]}-${slashMatch[2]}-${slashMatch[1]}`;
        }

        return "";
    }

    function normalizeDateForApi(value, fieldName) {
        const normalized = normalizeDateForForm(value);

        if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
            throw new Error(
                `${fieldName} must use YYYY-MM-DD format`
            );
        }

        return normalized;
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.name.trim()) {
            window.alert("Cycle name is required.");
            return;
        }

        let startDate;
        let endDate = null;

        try {
            startDate = normalizeDateForApi(
                form.start_date,
                "startDate"
            );

            if (
                form.end_condition === "date" &&
                form.end_date
            ) {
                endDate = normalizeDateForApi(
                    form.end_date,
                    "endDate"
                );
            }
        } catch (error) {
            window.alert(error.message);
            return;
        }

        const rule = form.recurrence_rule || {};

        const recurrenceRule = {
            ...rule,

            // Backend uses monthPattern for Monthly → Day of week.
            monthPattern:
                rule.monthPattern ||
                rule.month_pattern ||
                "first",

            // Normalize monthly date mode.
            date:
                rule.date === "last" ||
                rule.date === 32
                    ? 32
                    : Number(rule.date || 1),

            exceptions: {
                days:
                    rule.exception_days ||
                    rule.exceptions?.days ||
                    [],
                dates:
                    rule.exception_dates ||
                    rule.exceptions?.dates ||
                    [],
                weeks:
                    rule.exception_weeks ||
                    rule.exceptions?.weeks ||
                    [],
            },
        };

        // Do not send the frontend-only duplicate field to the API.
        delete recurrenceRule.month_pattern;
        delete recurrenceRule.exception_days;
        delete recurrenceRule.exception_dates;
        delete recurrenceRule.exception_weeks;

        const notificationPolicy = {
            mediums:
                form.notification_channels || [],
            recipients:
                form.recipients || [],
            offsets:
                (form.notifications || []).map(
                    (notification) => {
                        const multiplier = {
                            minutes: 1,
                            hours: 60,
                            days: 1440,
                        };

                        return {
                            minutes:
                                Number(
                                    notification.value || 0
                                ) *
                                (
                                    multiplier[
                                        notification.unit
                                    ] || 1
                                ),
                        };
                    }
                ),
            messageMode:
                form.message_type === "custom"
                    ? "custom"
                    : "default",
            customMessage:
                form.message_type === "custom"
                    ? form.custom_message
                    : null,
        };

        const payload = {
            name: form.name.trim(),
            description: form.description,
            category: form.category,
            priority: form.priority,

            recurrenceType:
                form.recurrence_type,

            recurrenceRule,

            // Always an exact YYYY-MM-DD string.
            startDate,

            endDate,

            endAfterOccurrences:
                form.end_condition === "occurrences"
                    ? Number(
                          form.end_after_occurrences
                      )
                    : null,

            timezone: form.timezone,

            status: form.status,

            messagingEnabled:
                Boolean(
                    form.messaging_enabled
                ),

            completionTrackingEnabled:
                form.completion_tracking_enabled !==
                false,

            notificationPolicy,
        };

        setSaving(true);

        try {
            await onSubmit(payload);
        } catch (error) {
            throw error;
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="cycle-form-overlay">
            <div className="cycle-form-modal">
                <div className="cycle-form-header">
                    <div>
                        <span className="section-eyebrow">
                            {cycle ? "Edit cycle" : "New cycle"}
                        </span>

                        <h2>
                            {cycle
                                ? "Update recurring definition"
                                : "Create something that repeats"}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="details-close"
                    >
                        ×
                    </button>
                </div>

                <form
                    className="cycle-form"
                    onSubmit={handleSubmit}
                >
                    {/* BASIC INFORMATION */}

                    <section className="form-section">
                        <div className="form-section-heading">
                            <h3>Basic information</h3>
                        </div>

                        <div className="form-grid">
                            <label className="form-field form-field-full">
                                <span>Name of cycle *</span>

                                <input
                                    value={form.name}
                                    onChange={(event) =>
                                        updateField(
                                            "name",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Pay Rent"
                                    required
                                />
                            </label>

                            <label className="form-field form-field-full">
                                <span>Description</span>

                                <textarea
                                    value={form.description}
                                    onChange={(event) =>
                                        updateField(
                                            "description",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Monthly rent payment."
                                    rows={3}
                                />
                            </label>

                            <label className="form-field">
                                <span>Category</span>

                                <select
                                    value={form.category}
                                    onChange={(event) =>
                                        updateField(
                                            "category",
                                            event.target.value
                                        )
                                    }
                                >
                                    {CATEGORIES.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <label className="form-field">
                                <span>Priority</span>

                                <select
                                    value={form.priority}
                                    onChange={(event) =>
                                        handlePriorityChange(
                                            event.target.value
                                        )
                                    }
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">
                                        Medium
                                    </option>
                                    <option value="high">High</option>
                                    <option value="very_high">
                                        Very High
                                    </option>
                                </select>
                            </label>

                            <label className="form-field">
                                <span>Start date *</span>

                                <input
                                    type="date"
                                    value={form.start_date}
                                    onChange={(event) =>
                                        updateField(
                                            "start_date",
                                            event.target.value
                                        )
                                    }
                                    required
                                />
                            </label>

                            <label className="form-field">
                                <span>Timezone</span>

                                <input
                                    value={form.timezone}
                                    onChange={(event) =>
                                        updateField(
                                            "timezone",
                                            event.target.value
                                        )
                                    }
                                />
                            </label>
                        </div>
                    </section>

                    {/* END CONDITION */}

                    <section className="form-section">
                        <div className="form-section-heading">
                            <h3>End condition</h3>
                        </div>

                        <div className="form-inline-options">
                            <label>
                                <input
                                    type="radio"
                                    checked={
                                        form.end_condition === "never"
                                    }
                                    onChange={() =>
                                        updateField(
                                            "end_condition",
                                            "never"
                                        )
                                    }
                                />
                                Never
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    checked={
                                        form.end_condition === "date"
                                    }
                                    onChange={() =>
                                        updateField(
                                            "end_condition",
                                            "date"
                                        )
                                    }
                                />
                                On date
                            </label>

                            <label>
                                <input
                                    type="radio"
                                    checked={
                                        form.end_condition ===
                                        "occurrences"
                                    }
                                    onChange={() =>
                                        updateField(
                                            "end_condition",
                                            "occurrences"
                                        )
                                    }
                                />
                                After N occurrences
                            </label>
                        </div>

                        {form.end_condition === "date" && (
                            <input
                                type="date"
                                value={form.end_date}
                                onChange={(event) =>
                                    updateField(
                                        "end_date",
                                        event.target.value
                                    )
                                }
                            />
                        )}

                        {form.end_condition ===
                            "occurrences" && (
                                <input
                                    type="number"
                                    min="1"
                                    value={
                                        form.end_after_occurrences
                                    }
                                    onChange={(event) =>
                                        updateField(
                                            "end_after_occurrences",
                                            event.target.value
                                        )
                                    }
                                    placeholder="Number of occurrences"
                                />
                            )}
                    </section>

                    {/* RECURRENCE */}

                    <section className="form-section">
                        <div className="form-section-heading">
                            <h3>Recurrence</h3>

                            <p>
                                The schedule controls how future
                                occurrences are generated.
                            </p>
                        </div>

                        <label className="form-field">
                            <span>Type of recurrence</span>

                            <select
                                value={form.recurrence_type}
                                onChange={(event) => {
                                    const type =
                                        event.target.value;

                                    updateField(
                                        "recurrence_type",
                                        type
                                    );

                                    updateRule("type", type);
                                }}
                            >
                                <option value="daily">
                                    Daily
                                </option>
                                <option value="weekly">
                                    Weekly
                                </option>
                                <option value="monthly">
                                    Monthly
                                </option>
                                <option value="custom">
                                    Custom
                                </option>
                            </select>
                        </label>

                        {/* DAILY */}

                        {form.recurrence_type ===
                            RECURRENCE_TYPES.DAILY && (
                                <div className="recurrence-builder">
                                    <div className="form-grid">
                                        <label className="form-field">
                                            <span>
                                                Repeat every
                                            </span>

                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    form.recurrence_rule
                                                        .interval
                                                }
                                                onChange={(event) =>
                                                    updateRule(
                                                        "interval",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className="form-field">
                                            <span>Time</span>

                                            <input
                                                type="time"
                                                value={
                                                    form.recurrence_rule.time
                                                }
                                                onChange={(event) =>
                                                    updateRule(
                                                        "time",
                                                        event.target.value
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>

                                    <ExceptionFields
                                        rule={
                                            form.recurrence_rule
                                        }
                                        toggleArrayValue={
                                            toggleArrayValue
                                        }
                                        addExceptionDate={
                                            addExceptionDate
                                        }
                                        addExceptionWeek={
                                            addExceptionWeek
                                        }
                                    />
                                </div>
                            )}

                        {/* WEEKLY */}

                        {form.recurrence_type ===
                            RECURRENCE_TYPES.WEEKLY && (
                                <div className="recurrence-builder">
                                    <label className="form-field">
                                        <span>
                                            Repeat every week(s)
                                        </span>

                                        <input
                                            type="number"
                                            min="1"
                                            value={
                                                form.recurrence_rule
                                                    .interval
                                            }
                                            onChange={(event) =>
                                                updateRule(
                                                    "interval",
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                        />
                                    </label>

                                    <div className="form-field">
                                        <span>Days</span>

                                        <div className="weekday-selector">
                                            {WEEK_DAYS.map((day) => (
                                                <label
                                                    key={day}
                                                    className={
                                                        form.recurrence_rule.days.includes(
                                                            day
                                                        )
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={form.recurrence_rule.days.includes(
                                                            day
                                                        )}
                                                        onChange={() =>
                                                            toggleArrayValue(
                                                                "days",
                                                                day
                                                            )
                                                        }
                                                    />

                                                    {day.slice(0, 3)}
                                                </label>
                                            ))}
                                        </div>
                                    </div>

                                    <label className="form-field">
                                        <span>Time</span>

                                        <input
                                            type="time"
                                            value={
                                                form.recurrence_rule.time
                                            }
                                            onChange={(event) =>
                                                updateRule(
                                                    "time",
                                                    event.target.value
                                                )
                                            }
                                        />
                                    </label>

                                    <ExceptionFields
                                        rule={
                                            form.recurrence_rule
                                        }
                                        toggleArrayValue={
                                            toggleArrayValue
                                        }
                                        addExceptionDate={
                                            addExceptionDate
                                        }
                                        addExceptionWeek={
                                            addExceptionWeek
                                        }
                                    />
                                </div>
                            )}

                        {/* MONTHLY */}

                        {form.recurrence_type ===
                            RECURRENCE_TYPES.MONTHLY && (
                                <div className="recurrence-builder">
                                    <div className="form-inline-options">
                                        <label>
                                            <input
                                                type="radio"
                                                checked={
                                                    form.recurrence_rule
                                                        .mode === "date"
                                                }
                                                onChange={() =>
                                                    updateRule(
                                                        "mode",
                                                        "date"
                                                    )
                                                }
                                            />
                                            Date
                                        </label>

                                        <label>
                                            <input
                                                type="radio"
                                                checked={
                                                    form.recurrence_rule
                                                        .mode === "weekday"
                                                }
                                                onChange={() =>
                                                    updateRule(
                                                        "mode",
                                                        "weekday"
                                                    )
                                                }
                                            />
                                            Day of week
                                        </label>
                                    </div>

                                    {form.recurrence_rule.mode ===
                                        "date" && (
                                            <div className="form-grid">
                                                <label className="form-field">
                                                    <span>Date</span>

                                                    <select
                                                        value={
                                                            form.recurrence_rule
                                                                .date
                                                        }
                                                        onChange={(event) =>
                                                            updateRule(
                                                                "date",
                                                                Number(
                                                                    event.target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    >
                                                        {Array.from(
                                                            { length: 31 },
                                                            (_, index) =>
                                                                index + 1
                                                        ).map((date) => (
                                                            <option
                                                                key={date}
                                                                value={date}
                                                            >
                                                                {date}
                                                            </option>
                                                        ))}

                                                        <option value={32}>
                                                            Last day of month
                                                        </option>
                                                    </select>
                                                </label>

                                                <label className="form-field">
                                                    <span>Time</span>

                                                    <input
                                                        type="time"
                                                        value={
                                                            form.recurrence_rule
                                                                .time
                                                        }
                                                        onChange={(event) =>
                                                            updateRule(
                                                                "time",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                </label>
                                            </div>
                                        )}

                                    {form.recurrence_rule.mode ===
                                        "weekday" && (
                                            <div className="form-grid">
                                                <label className="form-field">
                                                    <span>Week</span>

                                                    <select
                                                        value={
                                                            form.recurrence_rule
                                                                .monthPattern
                                                        }
                                                        onChange={(event) =>
                                                            updateRule(
                                                                "monthPattern",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="first">
                                                            First
                                                        </option>
                                                        <option value="second">
                                                            Second
                                                        </option>
                                                        <option value="third">
                                                            Third
                                                        </option>
                                                        <option value="fourth">
                                                            Fourth
                                                        </option>
                                                        <option value="last">
                                                            Last
                                                        </option>
                                                    </select>
                                                </label>

                                                <label className="form-field">
                                                    <span>Day</span>

                                                    <select
                                                        value={
                                                            form.recurrence_rule
                                                                .day
                                                        }
                                                        onChange={(event) =>
                                                            updateRule(
                                                                "day",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        {WEEK_DAYS.map(
                                                            (day) => (
                                                                <option
                                                                    key={day}
                                                                    value={day}
                                                                >
                                                                    {day}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </label>

                                                <label className="form-field">
                                                    <span>Time</span>

                                                    <input
                                                        type="time"
                                                        value={
                                                            form.recurrence_rule
                                                                .time
                                                        }
                                                        onChange={(event) =>
                                                            updateRule(
                                                                "time",
                                                                event.target
                                                                    .value
                                                            )
                                                        }
                                                    />
                                                </label>
                                            </div>
                                        )}

                                    <ExceptionFields
                                        rule={
                                            form.recurrence_rule
                                        }
                                        toggleArrayValue={
                                            toggleArrayValue
                                        }
                                        addExceptionDate={
                                            addExceptionDate
                                        }
                                        addExceptionWeek={
                                            addExceptionWeek
                                        }
                                    />
                                </div>
                            )}

                        {/* CUSTOM */}

                        {form.recurrence_type ===
                            RECURRENCE_TYPES.CUSTOM && (
                                <div className="recurrence-builder">
                                    <div className="form-grid">
                                        <label className="form-field">
                                            <span>Repeat every</span>

                                            <input
                                                type="number"
                                                min="1"
                                                value={
                                                    form.recurrence_rule
                                                        .interval
                                                }
                                                onChange={(event) =>
                                                    updateRule(
                                                        "interval",
                                                        Number(
                                                            event.target.value
                                                        )
                                                    )
                                                }
                                            />
                                        </label>

                                        <label className="form-field">
                                            <span>Unit</span>

                                            <select
                                                value={
                                                    form.recurrence_rule
                                                        .unit
                                                }
                                                onChange={(event) =>
                                                    updateRule(
                                                        "unit",
                                                        event.target
                                                            .value
                                                    )
                                                }
                                            >
                                                <option value="days">
                                                    Days
                                                </option>

                                                <option value="weeks">
                                                    Weeks
                                                </option>

                                                <option value="months">
                                                    Months
                                                </option>

                                                <option value="years">
                                                    Years
                                                </option>
                                            </select>
                                        </label>

                                        <label className="form-field">
                                            <span>Time</span>

                                            <input
                                                type="time"
                                                value={
                                                    form.recurrence_rule
                                                        .time
                                                }
                                                onChange={(event) =>
                                                    updateRule(
                                                        "time",
                                                        event.target
                                                            .value
                                                    )
                                                }
                                            />
                                        </label>
                                    </div>

                                    <ExceptionFields
                                        rule={
                                            form.recurrence_rule
                                        }
                                        toggleArrayValue={
                                            toggleArrayValue
                                        }
                                        addExceptionDate={
                                            addExceptionDate
                                        }
                                        addExceptionWeek={
                                            addExceptionWeek
                                        }
                                    />
                                </div>
                            )}
                    </section>

                    {/* MESSAGING */}

                    <section className="form-section">
                        <div className="form-section-heading form-heading-toggle">
                            <div>
                                <h3>Messaging</h3>

                                <p>
                                    Configure how RASB should notify
                                    you.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={`toggle ${form.messaging_enabled
                                    ? "is-on"
                                    : ""
                                    }`}
                                onClick={() =>
                                    updateField(
                                        "messaging_enabled",
                                        !form.messaging_enabled
                                    )
                                }
                            >
                                <span />
                            </button>
                        </div>

                        {form.messaging_enabled && (
                            <>
                                <div className="form-field">
                                    <span>Medium</span>

                                    <div className="channel-selector">
                                        {[
                                            ["email", "Email"],
                                            [
                                                "whatsapp",
                                                "WhatsApp",
                                            ],
                                            [
                                                "in_app",
                                                "In-app notification",
                                            ],
                                        ].map(
                                            ([value, label]) => (
                                                <label
                                                    key={value}
                                                    className={
                                                        form.notification_channels.includes(
                                                            value
                                                        )
                                                            ? "selected"
                                                            : ""
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={form.notification_channels.includes(
                                                            value
                                                        )}
                                                        onChange={() =>
                                                            toggleChannel(
                                                                value
                                                            )
                                                        }
                                                    />

                                                    {label}
                                                </label>
                                            )
                                        )}
                                    </div>
                                </div>

                                <div className="form-field">
                                    <span>Recipients</span>

                                    <div className="recipient-list">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={form.recipients.includes(
                                                    "me"
                                                )}
                                                onChange={(event) => {
                                                    const checked =
                                                        event.target
                                                            .checked;

                                                    updateField(
                                                        "recipients",
                                                        checked
                                                            ? [
                                                                ...form.recipients,
                                                                "me",
                                                            ]
                                                            : form.recipients.filter(
                                                                (item) =>
                                                                    item !==
                                                                    "me"
                                                            )
                                                    );
                                                }}
                                            />

                                            Me
                                        </label>

                                        <button
                                            type="button"
                                            className="button-small"
                                            onClick={() =>
                                                window.alert(
                                                    "Recipient management will be connected to RASB contacts."
                                                )
                                            }
                                        >
                                            + Add recipient
                                        </button>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <span>
                                        Notification timing
                                    </span>

                                    <div className="notification-editor">
                                        {form.notifications.map(
                                            (
                                                notification,
                                                index
                                            ) => (
                                                <div
                                                    className="notification-editor-row"
                                                    key={index}
                                                >
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            notification.value
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateNotification(
                                                                index,
                                                                "value",
                                                                Number(
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            )
                                                        }
                                                    />

                                                    <select
                                                        value={
                                                            notification.unit
                                                        }
                                                        onChange={(
                                                            event
                                                        ) =>
                                                            updateNotification(
                                                                index,
                                                                "unit",
                                                                event
                                                                    .target
                                                                    .value
                                                            )
                                                        }
                                                    >
                                                        <option value="minutes">
                                                            Minutes
                                                        </option>

                                                        <option value="hours">
                                                            Hours
                                                        </option>

                                                        <option value="days">
                                                            Days
                                                        </option>
                                                    </select>

                                                    <span>
                                                        {notification.value ===
                                                            0
                                                            ? "At event"
                                                            : "before"}
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeNotification(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                            )
                                        )}

                                        <button
                                            type="button"
                                            className="button-small"
                                            onClick={
                                                addNotification
                                            }
                                        >
                                            + Add notification
                                        </button>
                                    </div>
                                </div>

                                <div className="form-field">
                                    <span>Message</span>

                                    <div className="message-mode">
                                        <label>
                                            <input
                                                type="radio"
                                                checked={
                                                    form.message_type ===
                                                    "default"
                                                }
                                                onChange={() =>
                                                    updateField(
                                                        "message_type",
                                                        "default"
                                                    )
                                                }
                                            />

                                            Use default message
                                        </label>

                                        <label>
                                            <input
                                                type="radio"
                                                checked={
                                                    form.message_type ===
                                                    "custom"
                                                }
                                                onChange={() =>
                                                    updateField(
                                                        "message_type",
                                                        "custom"
                                                    )
                                                }
                                            />

                                            Custom message
                                        </label>
                                    </div>

                                    {form.message_type ===
                                        "custom" && (
                                            <textarea
                                                value={
                                                    form.custom_message
                                                }
                                                onChange={(event) =>
                                                    updateField(
                                                        "custom_message",
                                                        event.target.value
                                                    )
                                                }
                                                placeholder="Don't forget to complete {{cycle_name}}..."
                                                rows={4}
                                            />
                                        )}
                                </div>
                            </>
                        )}
                    </section>

                    {/* COMPLETION */}

                    <section className="form-section">
                        <div className="form-heading-toggle">
                            <div>
                                <h3>Track completion</h3>

                                <p>
                                    Keep a history for every generated
                                    occurrence.
                                </p>
                            </div>

                            <button
                                type="button"
                                className={`toggle ${form.completion_tracking_enabled
                                    ? "is-on"
                                    : ""
                                    }`}
                                onClick={() =>
                                    updateField(
                                        "completion_tracking_enabled",
                                        !form.completion_tracking_enabled
                                    )
                                }
                            >
                                <span />
                            </button>
                        </div>
                    </section>

                    <div className="cycle-form-footer">
                        <button
                            type="button"
                            className="button-secondary"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="button-primary"
                            disabled={saving}
                        >
                            {saving
                                ? "Saving..."
                                : cycle
                                    ? "Save changes"
                                    : "Create cycle"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}


function ExceptionFields({
    rule,
    toggleArrayValue,
    addExceptionDate,
    addExceptionWeek,
}) {
    // Safely handle missing optional exception data.
    const safeRule =
        rule && typeof rule === "object" ? rule : {};

    const exceptionDays = Array.isArray(safeRule.exception_days)
        ? safeRule.exception_days
        : [];

    const exceptionDates = Array.isArray(safeRule.exception_dates)
        ? safeRule.exception_dates
        : [];

    const exceptionWeeks = Array.isArray(safeRule.exception_weeks)
        ? safeRule.exception_weeks
        : [];

    return (
        <div className="exception-fields">
            <details>
                <summary>Exception days</summary>

                <div className="exception-day-list">
                    {WEEK_DAYS.map((day) => (
                        <label key={day}>
                            <input
                                type="checkbox"
                                checked={exceptionDays.includes(day)}
                                onChange={() =>
                                    toggleArrayValue(
                                        "exception_days",
                                        day
                                    )
                                }
                            />
                            {day}
                        </label>
                    ))}
                </div>
            </details>

            <details>
                <summary>Exception dates</summary>

                <button
                    type="button"
                    className="button-small"
                    onClick={addExceptionDate}
                >
                    + Add exception date
                </button>

                <div className="exception-items">
                    {exceptionDates.map((date) => (
                        <span key={date}>{date}</span>
                    ))}
                </div>
            </details>

            <details>
                <summary>Exception weeks</summary>

                <button
                    type="button"
                    className="button-small"
                    onClick={addExceptionWeek}
                >
                    + Add exception week
                </button>

                <div className="exception-items">
                    {exceptionWeeks.map((week) => (
                        <span key={week}>{week}</span>
                    ))}
                </div>
            </details>
        </div>
    );
}


export default CycleForm;