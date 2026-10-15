import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { Card, Bar, Row } from "../../components/Card";
import { getNotes } from "../notes/noteService";
import { getReminders } from "../reminders/reminderService";
import { cycleService } from "../cycles/cycleService";
import { executorService } from "../executor/executor.api";

const DEFAULT_WIDGETS = {
  notes: true,
  reminders: true,
  digitalLife: true,
  activityLog: true,
  storage: true,
  vault: true,
  cycles: true,
};

function formatReminderDate(date, time) {
  if (!date) return "";

  const reminderDate = new Date(`${date}T${time || "00:00"}:00`);
  const now = new Date();

  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );

  const target = new Date(
    reminderDate.getFullYear(),
    reminderDate.getMonth(),
    reminderDate.getDate()
  );

  const diffDays = Math.round(
    (target - today) / (1000 * 60 * 60 * 24)
  );

  const formattedTime = reminderDate.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

  if (diffDays === 0) {
    return `Today, ${formattedTime}`;
  }

  if (diffDays === 1) {
    return `Tomorrow`;
  }

  if (diffDays > 1 && diffDays < 7) {
    return `${reminderDate.toLocaleDateString([], {
      weekday: "short",
    })}, ${formattedTime}`;
  }

  return reminderDate.toLocaleDateString([], {
    day: "numeric",
    month: "short",
  });
}

function getUpcomingReminders(reminders) {
  const now = new Date();

  return reminders
    .filter((reminder) => {
      if (reminder.status && reminder.status !== "active") {
        return false;
      }

      const reminderDate = new Date(
        `${reminder.reminder_date}T${reminder.reminder_time || "00:00"}:00`
      );

      return reminderDate >= now;
    })
    .sort((a, b) => {
      const dateA = new Date(
        `${a.reminder_date}T${a.reminder_time || "00:00"}:00`
      );

      const dateB = new Date(
        `${b.reminder_date}T${b.reminder_time || "00:00"}:00`
      );

      return dateA - dateB;
    });
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [upcomingCycles, setUpcomingCycles] = useState([]);
  const [executorDay, setExecutorDay] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [widgets, setWidgets] = useState(() => {
    try {
      const saved = localStorage.getItem("rasb-dashboard-widgets");

      return saved
        ? { ...DEFAULT_WIDGETS, ...JSON.parse(saved) }
        : DEFAULT_WIDGETS;
    } catch {
      return DEFAULT_WIDGETS;
    }
  });

  const [showWidgetMenu, setShowWidgetMenu] = useState(false);

  const open = (path) => () => navigate(path);

  async function loadDashboardData() {
    try {
      setError("");

      const [
        notesResponse,
        remindersResponse,
        cyclesResponse,
      ] = await Promise.all([
        getNotes(),
        getReminders(),
        cycleService.getOccurrences({
          start: new Date().toISOString(),
          end: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        }),
      ]);

      setNotes(notesResponse.notes || []);
      setReminders(remindersResponse || []);
      const cycleOccurrences =
        cyclesResponse?.data ||
        cyclesResponse?.occurrences ||
        cyclesResponse ||
        [];

      const upcoming = cycleOccurrences
        .filter(
          (occurrence) =>
            occurrence.status === "pending" &&
            new Date(occurrence.scheduled_at) >= new Date()
        )
        .sort(
          (a, b) =>
            new Date(a.scheduled_at) -
            new Date(b.scheduled_at)
        )
        .slice(0, 2);

      setUpcomingCycles(upcoming);
    } catch (error) {
      console.error("Dashboard data error:", error);
      setError("Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }
  async function loadExecutorOverview() {
    try {
      const now = new Date();

      const year =
        now.getFullYear();

      const month = String(
        now.getMonth() + 1
      ).padStart(2, "0");

      const day = String(
        now.getDate()
      ).padStart(2, "0");

      const date =
        `${year}-${month}-${day}`;

      const response =
        await executorService.getDay(
          date
        );

      setExecutorDay(
        response?.timeline || null
      );
    } catch (error) {
      console.error(
        "Executor overview error:",
        error
      );

      setExecutorDay(null);
    }
  }

  useEffect(() => {
    loadDashboardData();
    loadExecutorOverview();

    const interval = setInterval(() => {
      loadDashboardData();
      loadExecutorOverview();
    }, 30000);

    return () =>
      clearInterval(interval);
  }, []);
  function toggleWidget(widget) {
    setWidgets((current) => {
      const updated = {
        ...current,
        [widget]: !current[widget],
      };

      localStorage.setItem(
        "rasb-dashboard-widgets",
        JSON.stringify(updated)
      );

      return updated;
    });
  }

  const encryptedCount = notes.filter(
    (note) => note.encrypted
  ).length;

  const lastEditedNote = notes.length > 0 ? notes[0] : null;

  const upcomingReminders = getUpcomingReminders(reminders);

  const reminderChannels = [
    ...new Set(
      upcomingReminders
        .slice(0, 5)
        .map((reminder) => reminder.medium)
        .filter(Boolean)
    ),
  ];

  return (
    <section className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <div className="dashboard-eyebrow">OVERVIEW</div>
          <h1 className="dashboard-title">
            {new Date().getHours() < 12 ? "Good morning." : new Date().getHours() < 18 ? "Good afternoon." : "Good evening."}
          </h1>
          <p className="dashboard-subtitle">Here is what needs your attention.</p>
        </div>
        <div className="dashboard-header-actions">
          <button type="button" className="dashboard-secondary-action" onClick={open("/notes")}><span>+</span> New note</button>
          <button type="button" className="dashboard-primary-action" onClick={open("/reminders")}><span>+</span> New reminder</button>
        </div>
      </header>

      {/* Dashboard Controls */}
      <div className="dashboard-controls">
        <div className="dashboard-status">
          <span className="dashboard-status-dot" />
          {Object.values(widgets).filter(Boolean).length} of {Object.keys(widgets).length} widgets visible
        </div>
        <div className="dashboard-widget-control">
          <button
            className="widget-button"
            onClick={() => setShowWidgetMenu((current) => !current)}
            aria-expanded={showWidgetMenu}
          >
            Customize view <span>⌄</span>
          </button>

          {showWidgetMenu && (
            <div className="widget-menu">
              <div className="widget-menu-title">
                <span>Dashboard</span>
                <small>Choose what stays visible.</small>
              </div>

              {Object.entries({
                notes: "Notes",
                reminders: "Reminders",
                cycles: "Cycles",
                executor: "Executor",
                digitalLife: "Digital Life",
                /*activityLog: "Activity Log",
                storage: "Storage",
                vault: "Security Vault",*/
              }).map(([key, label]) => (
                <label key={key} className="widget-option">
                  <input
                    type="checkbox"
                    checked={widgets[key]}
                    onChange={() => toggleWidget(key)}
                  />
                  <span className="widget-check" />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {/* QUICK GLANCE */}
      <div className="dashboard-overview-strip">
        <div>
          <span>NOTES</span>
          <strong>{loading ? "—" : notes.length}</strong>
        </div>

        <div>
          <span>REMINDERS</span>
          <strong>
            {loading ? "—" : upcomingReminders.length}
          </strong>
        </div>

        <div>
          <span>NEXT CYCLES</span>
          <strong>
            {loading ? "—" : upcomingCycles.length}
          </strong>
        </div>

        {/*
        <div>
          <span>STORAGE</span>
          <strong>68%</strong>
        </div>
        */}
      </div>

      <div className="grid dashboard-grid">

        {/* NOTES */}
        {widgets.notes && (
          <Card
            id="notes"
            title="Notes"
            tag={
              loading
                ? "Loading..."
                : `${encryptedCount} encrypted`
            }
            tagClass="tag-muted"
            onOpen={open("/notes")}
          >
            {loading ? (
              <div className="card-body">
                Loading notes...
              </div>
            ) : (
              <>
                <div className="card-stat">
                  {notes.length}
                </div>

                <div className="card-stat-label">
                  TOTAL NOTES
                </div>

                <div className="card-body">
                  {lastEditedNote ? (
                    <>
                      Last edited — "{lastEditedNote.name}"
                      <br />

                      {new Date(
                        lastEditedNote.updated_at
                      ).toLocaleString()}
                    </>
                  ) : (
                    "No notes yet."
                  )}
                </div>
              </>
            )}
          </Card>
        )}

        {/* REMINDERS */}
        {widgets.reminders && (
          <Card
            id="reminders"
            title="Reminders"
            tag={`${upcomingReminders.length} upcoming`}
            tagClass="tag-warn"
            onOpen={open("/reminders")}
          >
            {loading ? (
              <div className="card-body">
                Loading reminders...
              </div>
            ) : upcomingReminders.length === 0 ? (
              <div className="card-body">
                No upcoming reminders.
              </div>
            ) : (
              <>
                {upcomingReminders
                  .slice(0, 2)
                  .map((reminder) => (
                    <Row
                      key={reminder.id}
                      k={reminder.name}
                      v={formatReminderDate(
                        reminder.reminder_date,
                        reminder.reminder_time
                      )}
                    />
                  ))}

                {reminderChannels.length > 0 && (
                  <div className="chip-row">
                    {reminderChannels.map((channel) => (
                      <span
                        className="chip"
                        key={channel}
                      >
                        {channel === "notification"
                          ? "Notification"
                          : channel.charAt(0).toUpperCase() +
                          channel.slice(1)}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </Card>
        )}
        {/* CYCLES */}
        {widgets.cycles && (
          <Card
            id="cycles"
            title="Cycles"
            tag="Recurring"
            tagClass="tag-warn"
            onOpen={open("/cycles")}
          >
            {upcomingCycles.length === 0 ? (
              <div className="card-body">
                No upcoming cycles.
                <br />
                <span className="card-muted">
                  Create something that repeats in your life.
                </span>
              </div>
            ) : (
              <div className="dashboard-cycle-list">
                {upcomingCycles.map((occurrence) => {
                  const scheduledAt = new Date(
                    occurrence.scheduled_at
                  );

                  const now = new Date();

                  const today = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate()
                  );

                  const occurrenceDay = new Date(
                    scheduledAt.getFullYear(),
                    scheduledAt.getMonth(),
                    scheduledAt.getDate()
                  );

                  const daysRemaining = Math.round(
                    (occurrenceDay - today) /
                    (1000 * 60 * 60 * 24)
                  );

                  let dayLabel;

                  if (daysRemaining === 0) {
                    dayLabel = "Today";
                  } else if (daysRemaining === 1) {
                    dayLabel = "Tomorrow";
                  } else {
                    dayLabel = `${daysRemaining} days`;
                  }

                  return (
                    <div
                      className="dashboard-cycle-item"
                      key={occurrence.id}
                    >
                      <div className="dashboard-cycle-main">
                        <strong>
                          {occurrence.name ||
                            occurrence.cycle_name ||
                            "Unnamed cycle"}
                        </strong>

                        <span className="dashboard-cycle-description">
                          {occurrence.description ||
                            "Recurring activity"}
                        </span>

                        <span className="dashboard-cycle-meta">
                          {scheduledAt.toLocaleDateString([], {
                            day: "numeric",
                            month: "short",
                          })}

                          {" · "}

                          {scheduledAt.toLocaleTimeString([], {
                            hour: "numeric",
                            minute: "2-digit",
                          })}

                          {occurrence.category && (
                            <>
                              {" · "}
                              {occurrence.category}
                            </>
                          )}
                        </span>
                      </div>

                      <span className="dashboard-cycle-days">
                        {dayLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        )}
        {/* EXECUTOR */}
        {widgets.executor && (
          <Card
            id="executor"
            title="Executor"
            tag="Today"
            tagClass="tag-ok"
            onOpen={open("/executor")}
          >
            {!executorDay ? (
              <div className="card-body">
                <strong>
                  No execution plan loaded.
                </strong>

                <br />

                <span className="card-muted">
                  Open Executor to build or
                  materialize today's plan.
                </span>
              </div>
            ) : (
              <>
                {executorDay.current && (
                  <div className="dashboard-executor-current">
                    <span className="dashboard-executor-label">
                      CURRENT
                    </span>

                    <strong>
                      {
                        executorDay
                          .current
                          .title
                      }
                    </strong>

                    <span>
                      {new Date(
                        executorDay
                          .current
                          .start_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "numeric",
                          minute:
                            "2-digit",
                        }
                      )}

                      {" → "}

                      {new Date(
                        executorDay
                          .current
                          .end_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "numeric",
                          minute:
                            "2-digit",
                        }
                      )}
                    </span>
                  </div>
                )}

                {!executorDay.current &&
                  executorDay.next && (
                    <div className="dashboard-executor-current">
                      <span className="dashboard-executor-label">
                        NEXT
                      </span>

                      <strong>
                        {
                          executorDay
                            .next
                            .title
                        }
                      </strong>

                      <span>
                        {new Date(
                          executorDay
                            .next
                            .start_at
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "numeric",
                            minute:
                              "2-digit",
                          }
                        )}

                        {" → "}

                        {new Date(
                          executorDay
                            .next
                            .end_at
                        ).toLocaleTimeString(
                          [],
                          {
                            hour:
                              "numeric",
                            minute:
                              "2-digit",
                          }
                        )}
                      </span>
                    </div>
                  )}

                {!executorDay.current &&
                  !executorDay.next && (
                    <div className="card-body">
                      No upcoming execution.
                      <br />

                      <span className="card-muted">
                        Your day is clear.
                      </span>
                    </div>
                  )}

                {executorDay.next && (
                  <div className="dashboard-executor-next">
                    <span>
                      NEXT
                    </span>

                    <strong>
                      {
                        executorDay
                          .next
                          .title
                      }
                    </strong>

                    <small>
                      {new Date(
                        executorDay
                          .next
                          .start_at
                      ).toLocaleTimeString(
                        [],
                        {
                          hour:
                            "numeric",
                          minute:
                            "2-digit",
                        }
                      )}
                    </small>
                  </div>
                )}

                {executorDay.upcoming?.length >
                  0 && (
                    <div className="dashboard-executor-count">
                      +{" "}
                      {
                        executorDay
                          .upcoming
                          .length
                      } more scheduled
                    </div>
                  )}
              </>
            )}
          </Card>
        )}

        {/* DIGITAL LIFE */}
        {widgets.digitalLife && (
          <Card
            id="digital-life"
            title="Digital Life"
            tag="9 tracked"
            tagClass="tag-muted"
            onOpen={open("/digital-life")}
          >
            <Row k="Domains" v="3" />
            <Row k="Handles" v="6" />
            <Row k="Exposure scan" v="Clean" />
          </Card>
        )}

        {/* ACTIVITY LOG 
        {widgets.activityLog && (
          <Card
            id="activity-log"
            title="Activity Log"
            tag="Live"
            tagClass="tag-ok"
            onOpen={open("/activity-log")}
          >
            <Row
              k="Last access"
              v="10.0.0.4 · ✓"
            />

            <Row
              k="Failed attempts (24h)"
              v="0"
            />

            <div className="card-body">
              GET /api/vault/unlock — 200 · 41ms
            </div>
          </Card>
        )}
          */}

        {/* STORAGE
        {widgets.storage && (
          <Card
            id="storage"
            title="Storage"
            tag="68% used"
            tagClass="tag-warn"
            onOpen={open("/storage")}
          >
            <Row
              k="2.7 GB of 4 GB"
              v="68%"
            />

            <Bar pct={68} />

            <div className="chip-row">
              <span className="chip">
                Notes 0.4 GB
              </span>

              <span className="chip">
                Files 1.8 GB
              </span>

              <span className="chip">
                Backups 0.5 GB
              </span>
            </div>
          </Card>
        )}
           */}

        {/* SECURITY VAULT 
        {widgets.vault && (
          <Card
            id="vault"
            title="Security Vault"
            tag="Locked"
            tagClass="tag-danger"
            onOpen={open("/vault")}
          >
            <div className="card-stat">
              42
            </div>

            <div className="card-stat-label">
              CREDENTIALS SECURED
            </div>

            <div className="chip-row">
              <span className="chip">
                AES-256-GCM
              </span>

              <span className="chip">
                Argon2id
              </span>

              <span className="chip">
                Zero-knowledge
              </span>
            </div>
          </Card>
        )}
          */}
      </div>


      <div className="dashboard-footer-note">
        <span>RASB</span><i />
        Your information, organized around your life.
      </div>
    </section>
  );
}