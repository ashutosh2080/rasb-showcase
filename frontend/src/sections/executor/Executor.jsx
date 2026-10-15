// src/sections/executor/Executor.jsx

import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import ExecutorDayHeader from "./ExecutorDayHeader";
import ExecutorTimeline from "./ExecutorTimeline";
import ExecutorItemModal from "./ExecutorItemModal";

import { executorService } from "./executor.api";

import "./Executor.css";

function getLocalDateString() {
    const now = new Date();

    const year = now.getFullYear();

    const month = String(
        now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        now.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getLocalTimezone() {
    return (
        Intl.DateTimeFormat().resolvedOptions()
            .timeZone || "Asia/Kolkata"
    );
}

function Executor() {
    const [selectedDate, setSelectedDate] =
        useState(
            getLocalDateString()
        );

    const [day, setDay] =
        useState(null);

    const [timeline, setTimeline] =
        useState({
            items: [],
            current: null,
            next: null,
            upcoming: [],
        });

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [refreshing, setRefreshing] =
        useState(false);

    const [modalOpen, setModalOpen] =
        useState(false);

    const [editingItem, setEditingItem] =
        useState(null);

    const [creatingDay, setCreatingDay] =
        useState(false);

    const loadDay = useCallback(
        async (date = selectedDate) => {
            try {
                setError("");

                const response =
                    await executorService.getDay(
                        date
                    );

                setDay(
                    response?.day || null
                );

                setTimeline(
                    response?.timeline || {
                        items: [],
                        current: null,
                        next: null,
                        upcoming: [],
                    }
                );
            } catch (err) {
                console.error(
                    "Unable to load Executor day:",
                    err
                );

                setDay(null);

                setTimeline({
                    items: [],
                    current: null,
                    next: null,
                    upcoming: [],
                });

                setError(
                    err.message ||
                        "Unable to load Executor."
                );
            } finally {
                setLoading(false);
                setRefreshing(false);
            }
        },
        [selectedDate]
    );

    useEffect(() => {
        setLoading(true);
        loadDay(selectedDate);
    }, [
        selectedDate,
        loadDay,
    ]);

    function handlePreviousDay() {
        const date = new Date(
            `${selectedDate}T12:00:00`
        );

        date.setDate(
            date.getDate() - 1
        );

        setSelectedDate(
            [
                date.getFullYear(),
                String(
                    date.getMonth() + 1
                ).padStart(2, "0"),
                String(
                    date.getDate()
                ).padStart(2, "0"),
            ].join("-")
        );
    }

    function handleNextDay() {
        const date = new Date(
            `${selectedDate}T12:00:00`
        );

        date.setDate(
            date.getDate() + 1
        );

        setSelectedDate(
            [
                date.getFullYear(),
                String(
                    date.getMonth() + 1
                ).padStart(2, "0"),
                String(
                    date.getDate()
                ).padStart(2, "0"),
            ].join("-")
        );
    }

    function handleToday() {
        setSelectedDate(
            getLocalDateString()
        );
    }

    async function handleRefresh() {
        setRefreshing(true);
        await loadDay(selectedDate);
    }

    async function handleCreateDay() {
        try {
            setCreatingDay(true);
            setError("");

            await executorService.createDay({
                planDate:
                    selectedDate,

                timezone:
                    getLocalTimezone(),
            });

            await loadDay(selectedDate);
        } catch (err) {
            console.error(
                "Unable to create Executor day:",
                err
            );

            setError(
                err.message ||
                    "Unable to create Executor day."
            );
        } finally {
            setCreatingDay(false);
        }
    }

    async function ensureDayExists() {
        if (day?.id) {
            return day;
        }

        try {
            setCreatingDay(true);
            setError("");

            const response =
                await executorService.createDay(
                    {
                        planDate:
                            selectedDate,
                        timezone:
                            getLocalTimezone(),
                    }
                );

            const createdDay =
                response?.day || null;

            setDay(createdDay);

            return createdDay;
        } finally {
            setCreatingDay(false);
        }
    }

    async function handleCreateItem() {
        try {
            setError("");

            const existingDay =
                await ensureDayExists();

            if (!existingDay?.id) {
                throw new Error(
                    "Unable to create the Executor day."
                );
            }

            setEditingItem(null);
            setModalOpen(true);
        } catch (err) {
            console.error(
                "Unable to prepare item creation:",
                err
            );

            setError(
                err.message ||
                    "Unable to create item."
            );
        }
    }

    function handleEditItem(item) {
        setEditingItem(item);
        setModalOpen(true);
    }

    function handleCloseModal() {
        if (creatingDay) {
            return;
        }

        setModalOpen(false);
        setEditingItem(null);
    }

    async function handleItemSaved(
        response,
        options = {}
    ) {
        if (!options.keepOpen) {
            setModalOpen(false);
            setEditingItem(null);
        }

        await loadDay(selectedDate);
    }

    async function handleDeleteItem() {
        await loadDay(selectedDate);
    }

    if (loading) {
        return (
            <div className="executor-page">
                <div className="executor-loading">
                    Loading Executor...
                </div>
            </div>
        );
    }

    return (
        <div className="executor-page">
            <ExecutorDayHeader
                selectedDate={
                    selectedDate
                }
                day={day}
                onPreviousDay={
                    handlePreviousDay
                }
                onNextDay={
                    handleNextDay
                }
                onToday={handleToday}
                onRefresh={
                    handleRefresh
                }
                onCreateItem={
                    handleCreateItem
                }
                refreshing={
                    refreshing
                }
                timezone={
                    getLocalTimezone()
                }
            />

            {error && (
                <div className="executor-error">
                    <div>
                        <strong>
                            Unable to load
                            Executor
                        </strong>

                        <span>
                            {error}
                        </span>
                    </div>

                    <div className="executor-error-actions">
                        <button
                            type="button"
                            onClick={
                                handleRefresh
                            }
                        >
                            Retry
                        </button>

                        {!day && (
                            <button
                                type="button"
                                onClick={
                                    handleCreateDay
                                }
                                disabled={
                                    creatingDay
                                }
                            >
                                {creatingDay
                                    ? "Creating..."
                                    : "Create Day"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {!error && (
                <ExecutorTimeline
                    timeline={timeline}
                    selectedDate={
                        selectedDate
                    }
                    onRefresh={
                        handleRefresh
                    }
                    onEditItem={
                        handleEditItem
                    }
                    onDeleteItem={
                        handleDeleteItem
                    }
                />
            )}

            <ExecutorItemModal
                isOpen={modalOpen}
                item={editingItem}
                selectedDate={
                    selectedDate
                }
                dayId={day?.id || null}
                onClose={
                    handleCloseModal
                }
                onSaved={
                    handleItemSaved
                }
            />
        </div>
    );
}

export default Executor;
