// src/sections/cycles/Cycles.jsx

import React, { useEffect, useMemo, useState } from "react";

import CycleCalendar from "./CycleCalendar";
import CycleSidebar from "./CycleSidebar";
import CycleList from "./CycleList";
import CycleFilters from "./CycleFilters";
import CycleForm from "./CycleForm";
import CycleDetails from "./CycleDetails";

import { cycleService } from "./cycleService";

import {
    CATEGORIES,
    getDateRange,
} from "./cycleUtils";

import "./Cycles.css";

function Cycles() {
    const today = new Date();

    const [cycles, setCycles] = useState([]);
    const [occurrences, setOccurrences] = useState([]);
    const [calendarOccurrences, setCalendarOccurrences] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [calendarYear, setCalendarYear] = useState(
        today.getFullYear()
    );

    const [calendarMonth, setCalendarMonth] = useState(
        today.getMonth()
    );

    const [selectedDate, setSelectedDate] = useState(
        today
    );

    const [selectedCycle, setSelectedCycle] =
        useState(null);

    const [selectedOccurrence, setSelectedOccurrence] =
        useState(null);

    const [showForm, setShowForm] =
        useState(false);

    const [editingCycle, setEditingCycle] =
        useState(null);

    const [dateFilter, setDateFilter] =
        useState("week");

    const [priorityFilter, setPriorityFilter] =
        useState("all");

    const [categoryFilter, setCategoryFilter] =
        useState("all");

    const [customStart, setCustomStart] =
        useState("");

    const [customEnd, setCustomEnd] =
        useState("");

    const [search, setSearch] = useState("");

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadOccurrences();
    }, [
        dateFilter,
        priorityFilter,
        categoryFilter,
        customStart,
        customEnd,
    ]);

    useEffect(() => {
        loadCalendarOccurrences(
            calendarYear,
            calendarMonth
        );
    }, [calendarYear, calendarMonth]);


    async function loadData() {
        try {
            setLoading(true);
            setError("");

            const cycleResponse = await cycleService.getCycles();

            const cyclesData = Array.isArray(cycleResponse?.data)
                ? cycleResponse.data
                : Array.isArray(cycleResponse?.cycles)
                    ? cycleResponse.cycles
                    : Array.isArray(cycleResponse)
                        ? cycleResponse
                        : null;

            if (!cyclesData) {
                console.error(
                    "Unexpected GET /api/cycles response:",
                    cycleResponse
                );

                throw new Error(
                    "The cycles API did not return a list of cycles."
                );
            }

            setCycles(cyclesData);
        } catch (err) {
            console.error("Unable to load cycles:", err);

            setError(
                err.message || "Unable to load cycles."
            );
        } finally {
            setLoading(false);
        }
    }
    

    async function loadOccurrences() {
        try {
            let start;
            let end;

            if (dateFilter === "custom") {
                if (!customStart || !customEnd) {
                    setOccurrences([]);
                    return;
                }

                start = new Date(`${ customStart } T00:00:00`);
                end = new Date(`${ customEnd } T23: 59: 59.999`);
            } else {
                const range = getDateRange(dateFilter);

                start = range.start;
                end = range.end;
            }

            const params = {
                start: start.toISOString(),
                end: end.toISOString(),
            };

            if (priorityFilter !== "all") {
                params.priority = priorityFilter;
            }

            if (categoryFilter !== "all") {
                params.category = categoryFilter;
            }

            const response =
                await cycleService.getOccurrences(params);

            const data =
                response?.data ||
                response?.occurrences ||
                response ||
                [];

            setOccurrences(data);
        } catch (err) {
            console.error(
                "Unable to load occurrences:",
                err
            );

            setOccurrences([]);
        }
    }
    async function loadCalendarOccurrences(
        year = calendarYear,
        month = calendarMonth
    ) {
        try {
            const start = new Date(year, month, 1);
            start.setHours(0, 0, 0, 0);

            const end = new Date(year, month + 1, 0);
            end.setHours(23, 59, 59, 999);

            const response =
                await cycleService.getOccurrences({
                    start: start.toISOString(),
                    end: end.toISOString(),
                });

            const data =
                response?.data ||
                response?.occurrences ||
                response ||
                [];

            setCalendarOccurrences(data);
        } catch (err) {
            console.error(
                "Unable to load calendar occurrences:",
                err
            );

            setCalendarOccurrences([]);
        }
    }
    function handlePreviousMonth() {
        if (calendarMonth === 0) {
            setCalendarYear(
                (year) => year - 1
            );
            setCalendarMonth(11);
            return;
        }

        setCalendarMonth(
            (month) => month - 1
        );
    }

    function handleNextMonth() {
        if (calendarMonth === 11) {
            setCalendarYear(
                (year) => year + 1
            );
            setCalendarMonth(0);
            return;
        }

        setCalendarMonth(
            (month) => month + 1
        );
    }

    function handleToday() {
        const current = new Date();

        setCalendarYear(
            current.getFullYear()
        );

        setCalendarMonth(
            current.getMonth()
        );

        setSelectedDate(current);
    }

    function openCreateForm() {
        setEditingCycle(null);
        setShowForm(true);
    }

    function openEditForm(cycle) {
        setEditingCycle(cycle);
        setShowForm(true);
        setSelectedCycle(null);
    }

    async function handleSaveCycle(formData) {
        try {
            if (editingCycle) {
                await cycleService.updateCycle(
                    editingCycle.id,
                    formData
                );
            } else {
                await cycleService.createCycle(
                    formData
                );
            }

            setShowForm(false);
            setEditingCycle(null);

            await loadData();
        } catch (err) {
            console.error(err);

            window.alert(
                err.message ||
                "Unable to save cycle."
            );
        }
    }

    async function handleDeleteCycle(cycle) {
        const confirmed =
            window.confirm(
                `Delete "${cycle.name}" ?\n\nThis will stop future occurrences and notifications.Past history will remain available.`
            );

        if (!confirmed) return;

        try {
            await cycleService.deleteCycle(
                cycle.id
            );

            setSelectedCycle(null);

            await loadData();
        } catch (err) {
            window.alert(
                err.message ||
                "Unable to delete cycle."
            );
        }
    }

    async function handlePauseCycle(cycle) {
        try {
            await cycleService.pauseCycle(
                cycle.id
            );

            setSelectedCycle(null);

            await loadData();
        } catch (err) {
            window.alert(
                err.message ||
                "Unable to pause cycle."
            );
        }
    }

    async function handleResumeCycle(cycle) {
        try {
            await cycleService.resumeCycle(
                cycle.id
            );

            setSelectedCycle(null);

            await loadData();
        } catch (err) {
            window.alert(
                err.message ||
                "Unable to resume cycle."
            );
        }
    }

    async function handleCompleteOccurrence(
        occurrence
    ) {
        try {
            await cycleService.completeOccurrence(
                occurrence.id
            );

            await loadOccurrences();
        } catch (err) {
            window.alert(
                err.message ||
                "Unable to complete occurrence."
            );
        }
    }

    async function handleSkipOccurrence(
        occurrence
    ) {
        try {
            await cycleService.skipOccurrence(
                occurrence.id
            );

            await loadOccurrences();
        } catch (err) {
            window.alert(
                err.message ||
                "Unable to skip occurrence."
            );
        }
    }

    async function handleSnoozeOccurrence(
        occurrence
    ) {
        const value = window.prompt(
            "Snooze for how many minutes?",
            "60"
        );

        if (!value) return;

        try {
            await cycleService.snoozeOccurrence(
                occurrence.id,
                {
                    minutes: Number(value),
                }
            );

            await loadOccurrences();
        } catch (err) {
            window.alert(
                err.message ||
                "Unable to snooze occurrence."
            );
        }
    }

    const visibleCycles = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        if (!query) return cycles;

        return cycles.filter((cycle) => {
            return (
                cycle.name
                    ?.toLowerCase()
                    .includes(query) ||
                cycle.description
                    ?.toLowerCase()
                    .includes(query) ||
                cycle.category
                    ?.toLowerCase()
                    .includes(query)
            );
        });
    }, [cycles, search]);

    const selectedDateOccurrences =
        useMemo(() => {
            return calendarOccurrences.filter(
                (occurrence) => {
                    const occurrenceDate =
                        new Date(
                            occurrence.scheduled_at
                        );

                    return (
                        occurrenceDate.getFullYear() ===
                        selectedDate.getFullYear() &&
                        occurrenceDate.getMonth() ===
                        selectedDate.getMonth() &&
                        occurrenceDate.getDate() ===
                        selectedDate.getDate()
                    );
                }
            );
        }, [
            calendarOccurrences,
            selectedDate,
        ]);

    if (loading) {
        return (
            <div className="cycles-page cycles-loading">
                <div className="cycles-skeleton-header" />

                <div className="cycles-skeleton-layout">
                    <div className="cycles-skeleton-calendar" />
                    <div className="cycles-skeleton-sidebar" />
                </div>

                <div className="cycles-skeleton-list" />
            </div>
        );
    }

    return (
        <div className="cycles-page">
            <header className="cycles-page-header">
                <div>
                    <span className="section-eyebrow">
                        RASB
                    </span>

                    <h1>Cycles</h1>

                    <p>
                        The things that keep repeating in
                        your life.
                    </p>
                </div>

                <div className="cycles-header-actions">
                    <div className="cycles-search">
                        <span>⌕</span>

                        <input
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                            placeholder="Search cycles..."
                        />
                    </div>

                    <button
                        type="button"
                        className="button-primary"
                        onClick={openCreateForm}
                    >
                        + New Cycle
                    </button>
                </div>
            </header>

            {error && (
                <div className="cycles-error">
                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={loadData}
                    >
                        Retry
                    </button>
                </div>
            )}

            <main className="cycles-main">
                <div className="cycles-upper-layout">
                    <div className="cycles-calendar-wrapper">
                        <CycleCalendar
                            year={calendarYear}
                            month={calendarMonth}
                            selectedDate={selectedDate}
                            occurrences={calendarOccurrences}
                            onDateSelect={
                                setSelectedDate
                            }
                            onPreviousMonth={
                                handlePreviousMonth
                            }
                            onNextMonth={
                                handleNextMonth
                            }
                            onToday={handleToday}
                        />

                        <div className="selected-date-panel">
                            <div className="selected-date-header">
                                <div>
                                    <span className="section-eyebrow">
                                        Selected date
                                    </span>

                                    <h3>
                                        {selectedDate.toLocaleDateString(
                                            [],
                                            {
                                                day: "numeric",
                                                month: "long",
                                            }
                                        )}
                                    </h3>
                                </div>

                                <span>
                                    {
                                        selectedDateOccurrences.length
                                    }{" "}
                                    occurrence
                                    {selectedDateOccurrences.length !==
                                        1
                                        ? "s"
                                        : ""}
                                </span>
                            </div>

                            {selectedDateOccurrences.length ===
                                0 ? (
                                <div className="selected-date-empty">
                                    Nothing scheduled for this
                                    date.
                                </div>
                            ) : (
                                <div className="selected-date-occurrences">
                                    {selectedDateOccurrences.map(
                                        (occurrence) => (
                                            <button
                                                type="button"
                                                key={occurrence.id}
                                                onClick={() =>
                                                    setSelectedOccurrence(
                                                        occurrence
                                                    )
                                                }
                                            >
                                                <span>
                                                    {new Date(
                                                        occurrence.scheduled_at
                                                    ).toLocaleTimeString(
                                                        [],
                                                        {
                                                            hour: "numeric",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </span>

                                                <strong>
                                                    {
                                                        occurrence.name ||
                                                        occurrence.cycle_name ||
                                                        "Untitled cycle"
                                                    }
                                                </strong>

                                                <small>
                                                    {
                                                        occurrence.category
                                                    }{" "}
                                                    ·{" "}
                                                    {
                                                        occurrence.priority
                                                    }
                                                </small>
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <CycleSidebar
                        cycles={visibleCycles}
                        selectedCycle={
                            selectedCycle
                        }
                        onSelectCycle={
                            setSelectedCycle
                        }
                    />
                </div>

                <CycleFilters
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    priorityFilter={
                        priorityFilter
                    }
                    setPriorityFilter={
                        setPriorityFilter
                    }
                    categoryFilter={
                        categoryFilter
                    }
                    setCategoryFilter={
                        setCategoryFilter
                    }
                    categories={CATEGORIES}
                    customStart={customStart}
                    customEnd={customEnd}
                    setCustomStart={setCustomStart}
                    setCustomEnd={setCustomEnd}
                />

                <CycleList
                    occurrences={occurrences}
                    onComplete={
                        handleCompleteOccurrence
                    }
                    onSnooze={
                        handleSnoozeOccurrence
                    }
                    onSkip={
                        handleSkipOccurrence
                    }
                    onSelect={
                        setSelectedOccurrence
                    }
                />
            </main>

            {showForm && (
                <CycleForm
                    cycle={editingCycle}
                    onClose={() => {
                        setShowForm(false);
                        setEditingCycle(null);
                    }}
                    onSubmit={
                        handleSaveCycle
                    }
                />
            )}

            {selectedCycle && (
                <CycleDetails
                    cycle={selectedCycle}
                    onClose={() =>
                        setSelectedCycle(null)
                    }
                    onEdit={() =>
                        openEditForm(
                            selectedCycle
                        )
                    }
                    onPause={() =>
                        handlePauseCycle(
                            selectedCycle
                        )
                    }
                    onResume={() =>
                        handleResumeCycle(
                            selectedCycle
                        )
                    }
                    onDelete={() =>
                        handleDeleteCycle(
                            selectedCycle
                        )
                    }
                />
            )}
        </div>
    );
}

export default Cycles;