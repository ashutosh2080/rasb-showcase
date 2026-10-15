import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ReminderEditor.css";
import {
    getReminder,
    updateReminder,
    deleteReminder as deleteReminderApi,
} from "./reminderService";


export default function EditReminder() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [recipients, setRecipients] = useState([]);


    const [reminder, setReminder] = useState({
        name: "",
        description: "",
        priority: "",
        date: "",
        time: "",
        durationMinutes: "",
        medium: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setReminder((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleRecipientChange = (index, value) => {
        setRecipients((prev) =>
            prev.map((email, i) =>
                i === index ? value : email
            )
        );
    };

    const removeRecipient = (index) => {
        setRecipients((prev) =>
            prev.filter((_, i) => i !== index)
        );
    };

    const addRecipient = () => {
        if (recipients.length >= 5) return;

        setRecipients((prev) => [
            ...prev,
            "",
        ]);
    };

    const saveChanges = async () => {
        try {
            const data = {
                name: reminder.name,
                description: reminder.description,
                priority: reminder.priority,
                reminderDate: reminder.date,
                reminderTime: reminder.time,
                durationMinutes: Number(reminder.durationMinutes),
                medium: reminder.medium,
                recurrence: "none",
                timezone: "Asia/Kolkata",
                status: "active",
                recipients:
                    reminder.medium === "email"
                        ? recipients
                            .map((email) => email.trim())
                            .filter(Boolean)
                        : [],
            };

            await updateReminder(id, data);

            navigate("/reminders");
        } catch (error) {
            console.error(
                "Failed to update reminder:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to update reminder"
            );
        }
    };

    const deleteReminder = async () => {
        const confirmed = window.confirm(
            "Delete this reminder?"
        );

        if (!confirmed) return;

        try {
            await deleteReminderApi(id);

            navigate("/reminders");
        } catch (error) {
            console.error(
                "Failed to delete reminder:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to delete reminder"
            );
        }
    };
    useEffect(() => {
        loadReminder();
    }, [id]);

    async function loadReminder() {
        try {
            const data = await getReminder(id);

            setReminder({
                name: data.name || "",
                description: data.description || "",
                priority: data.priority || "",
                date: data.reminder_date || "",
                time: data.reminder_time
                    ? data.reminder_time.slice(0, 5)
                    : "",
                durationMinutes: data.duration_minutes ?? "",
                medium: data.medium || "",
            });

            setRecipients(data.recipients || []);
        } catch (error) {
            console.error(
                "Failed to load reminder:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Failed to load reminder"
            );

            navigate("/reminders");
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="reminder-editor-page">

            <div className="reminder-editor">

                {/* HEADER */}

                <div className="editor-header">

                    <div>

                        <span className="editor-eyebrow">
                            RASB / REMINDERS / EDIT
                        </span>

                        <h1>Edit Reminder</h1>

                        <p>
                            Modify your scheduled reminder.
                        </p>

                    </div>


                    <div className="header-actions">

                        <button
                            className="delete-btn"
                            onClick={deleteReminder}
                        >
                            Delete
                        </button>

                        <button
                            className="close-btn"
                            onClick={() => navigate("/reminders")}
                        >
                            ×
                        </button>

                    </div>

                </div>


                {/* BODY */}

                <div className="editor-body">

                    {/* NAME */}

                    <div className="form-group">

                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            value={reminder.name}
                            onChange={handleChange}
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-group">

                        <label>Description</label>

                        <textarea
                            name="description"
                            value={reminder.description}
                            onChange={handleChange}
                        />

                    </div>


                    {/* PRIORITY */}

                    <div className="form-group">

                        <label>Priority</label>

                        <select
                            name="priority"
                            value={reminder.priority}
                            onChange={handleChange}
                        >

                            <option value="low">
                                Low
                            </option>

                            <option value="medium">
                                Medium
                            </option>

                            <option value="high">
                                High
                            </option>

                            <option value="critical">
                                Critical
                            </option>

                        </select>

                    </div>


                    {/* DATE */}

                    <div className="form-group">

                        <label>Date</label>

                        <input
                            type="date"
                            name="date"
                            value={reminder.date}
                            onChange={handleChange}
                        />

                    </div>


                    {/* TIME */}

                    <div className="form-group">

                        <label>Time</label>

                        <input
                            type="time"
                            name="time"
                            value={reminder.time}
                            onChange={handleChange}
                        />

                    </div>
                    {/* DURATION */}

                    <div className="form-group">

                        <label>Duration (minutes)</label>

                        <input
                            type="number"
                            name="durationMinutes"
                            min="1"
                            max="1440"
                            step="1"
                            placeholder="e.g. 30"
                            value={reminder.durationMinutes}
                            onChange={handleChange}
                        />

                    </div>


                    {/* MEDIUM */}

                    <div className="form-group">

                        <label>Medium</label>

                        <select
                            name="medium"
                            value={reminder.medium}
                            onChange={handleChange}
                        >

                            <option value="email">
                                Email
                            </option>

                            <option value="whatsapp">
                                WhatsApp
                            </option>

                            <option value="notification">
                                Notification
                            </option>

                        </select>

                    </div>
                    {reminder.medium === "email" && (
                        <div className="form-group">
                            <label>Email Recipients</label>

                            {recipients.map((email, index) => (
                                <div
                                    key={index}
                                    className="recipient-row"
                                >
                                    <input
                                        type="email"
                                        placeholder={`Recipient ${index + 1}`}
                                        value={email}
                                        onChange={(e) =>
                                            handleRecipientChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                    />

                                    {recipients.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                removeRecipient(index)
                                            }
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}

                            {recipients.length < 5 && (
                                <button
                                    type="button"
                                    className="secondary-btn"
                                    onClick={addRecipient}
                                >
                                    + Add Recipient
                                </button>
                            )}
                        </div>
                    )}

                </div>


                {/* FOOTER */}

                <div className="editor-footer">

                    <button
                        className="secondary-btn"
                        onClick={() => navigate("/reminders")}
                    >
                        Cancel
                    </button>

                    <button
                        className="primary-btn"
                        onClick={saveChanges}
                    >
                        Save Changes
                    </button>

                </div>

            </div>

        </section>
    );
}