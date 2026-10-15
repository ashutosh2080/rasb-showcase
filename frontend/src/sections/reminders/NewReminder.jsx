import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./ReminderEditor.css";
import { createReminder as createReminderAPI } from "./reminderService";


export default function NewReminder() {
    const navigate = useNavigate();
    const [recipients, setRecipients] = useState([""]);
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

    const createReminder = async () => {
        try {
            if (!reminder.name.trim()) {
                alert("Reminder name is required");
                return;
            }

            if (!reminder.priority) {
                alert("Please choose a priority");
                return;
            }

            if (!reminder.date) {
                alert("Please choose a date");
                return;
            }

            if (!reminder.time) {
                alert("Please choose a time");
                return;
            }
            if (
                !reminder.durationMinutes ||
                Number(reminder.durationMinutes) <= 0
            ) {
                alert("Please enter a valid duration");
                return;
            }

            if (!reminder.medium) {
                alert("Please choose a notification medium");
                return;
            }

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

                recipients:
                    reminder.medium === "email"
                        ? recipients
                            .map((email) => email.trim())
                            .filter(Boolean)
                        : [],
            };
            await createReminderAPI(data);

            navigate("/reminders");
        } catch (error) {
            console.error("CREATE REMINDER ERROR:", error);

            console.log("STATUS:", error.response?.status);
            console.log("DATA:", error.response?.data);

            alert(
                JSON.stringify(
                    error.response?.data || error.message,
                    null,
                    2
                )
            );
        }
    };

    return (
        <section className="reminder-editor-page">

            <div className="reminder-editor">

                {/* HEADER */}

                <div className="editor-header">

                    <div>
                        <span className="editor-eyebrow">
                            RASB / REMINDERS
                        </span>

                        <h1>New Reminder</h1>

                        <p>
                            Schedule a new reminder.
                        </p>
                    </div>

                    <button
                        className="close-btn"
                        onClick={() => navigate("/reminders")}
                    >
                        ×
                    </button>

                </div>


                {/* BODY */}

                <div className="editor-body">

                    {/* NAME */}

                    <div className="form-group">

                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            placeholder="Enter reminder name"
                            value={reminder.name}
                            onChange={handleChange}
                        />

                    </div>


                    {/* DESCRIPTION */}

                    <div className="form-group">

                        <label>Description</label>

                        <textarea
                            name="description"
                            placeholder="Describe your reminder..."
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
                            <option value="">
                                Choose priority
                            </option>

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

                            <option value="">
                                Choose notification medium
                            </option>

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
                        onClick={createReminder}
                    >
                        Create Reminder
                    </button>

                </div>

            </div>

        </section>
    );
}