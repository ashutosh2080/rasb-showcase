import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getReminders } from "./reminderService";
import "./Reminders.css";

export default function Reminders() {
  const navigate = useNavigate();

  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    try {
      setLoading(true);
      setError("");

      const data = await getReminders();

      setReminders(data);
    } catch (error) {
      console.error("Failed to load reminders:", error);
      setError("Failed to load reminders.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section-page reminders-page">

      <div className="page-actions">

        <div>
          <div className="section-label">
            TASK TRACKER
          </div>

          <h2 className="section-heading">
            Reminders
          </h2>
        </div>

        <button
          className="primary-action"
          onClick={() => navigate("/reminders/new")}
        >
          + New Reminder
        </button>

      </div>

      <div className="section-grid">

        <div className="panel">

          <div className="panel-head">
            <span>Upcoming</span>

            <span className="panel-meta">
              {reminders.length} reminders
            </span>
          </div>

          {loading && (
            <div className="reminder-item">
              Loading reminders...
            </div>
          )}

          {error && (
            <div className="reminder-item">
              {error}
            </div>
          )}

          {!loading && !error && reminders.length === 0 && (
            <div className="reminder-item">
              <div>
                <strong>No reminders</strong>
                <span>Create your first reminder.</span>
              </div>
            </div>
          )}

          {!loading &&
            !error &&
            reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="note-item"
                onClick={() =>
                  navigate(`/reminders/${reminder.id}/edit`)
                }
              >
                <div>
                  <strong>{reminder.name}</strong>

                  <span>
                    {reminder.reminder_date} ·{" "}
                    {reminder.reminder_time}
                  </span>
                </div>

                <span className="note-lock">
                  {reminder.medium}
                </span>
              </div>
            ))}

        </div>

        <div className="panel">

          <div className="panel-head">
            <span>Delivery Channels</span>
            <span className="panel-meta">
              3 active
            </span>
          </div>

          <div className="chip-row">
            <span className="chip">Email</span>
            <span className="chip">WhatsApp</span>
            <span className="chip">Notification</span>
          </div>

        </div>

      </div>

    </section>
  );
}